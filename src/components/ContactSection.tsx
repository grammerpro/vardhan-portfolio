'use client';

import { useState } from 'react';
import { siteConfig } from '@/config/site';

/**
 * Phase 2 content pass.
 *
 * The form now posts to /api/contact and reports what actually happened. The
 * previous version called setIsSubmitted(true) and showed "Thank you for your
 * message!" without sending anything.
 *
 * The "Available for new projects" badge is gone from here. The claim is true
 * but it was being made in three places at once; it now appears once, in the
 * footer.
 */

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    // Honeypot. Hidden from people, filled in by bots.
    company: '',
  });

  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ kind: 'sending' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus({
          kind: 'error',
          message: result.error || 'Something went wrong. Please email me directly.',
        });
        return;
      }

      setStatus({ kind: 'sent' });
      setFormData({ name: '', email: '', message: '', company: '' });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Could not reach the server. Please email me directly.',
      });
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked. The address is visible on screen either way.
    }
  };

  const sending = status.kind === 'sending';

  return (
    <section id="contact" className="relative w-full bg-paper py-s7 text-ink">
      <div className="mx-auto max-w-[var(--grid-max)] px-[var(--page-margin)]">
        <h2 className="u-mono mb-s5 text-graphite">
          Contact
        </h2>
        <p className="mb-s6 max-w-[52ch] text-body leading-[var(--leading-body)] text-ink">
          Email is the fastest way to reach me. The form goes to the same place.
        </p>

        <div className="grid grid-cols-1 gap-s6 lg:grid-cols-2">
          {/* Direct channels */}
          <div className="flex flex-col gap-s2">
            <div className="flex items-center gap-4">
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-body text-ink underline underline-offset-4 hover:text-signal"
              >
                {siteConfig.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="u-mono text-graphite underline underline-offset-4 hover:text-signal"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <ul className="flex flex-col gap-s1 text-body">
              <li>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 hover:text-signal"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 hover:text-signal"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.social.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline underline-offset-4 hover:text-signal"
                >
                  LeetCode
                </a>
              </li>
            </ul>

            <p className="u-mono pt-s3 text-graphite">
              {siteConfig.location}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-s3">
            <div>
              <label
                htmlFor="name"
                className="u-mono mb-s1 block text-graphite"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
                disabled={sending}
                className="w-full border border-[color:var(--hairline-light)] bg-transparent px-s2 py-s2 text-body text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="u-mono mb-s1 block text-graphite"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                maxLength={200}
                disabled={sending}
                className="w-full border border-[color:var(--hairline-light)] bg-transparent px-s2 py-s2 text-body text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="u-mono mb-s1 block text-graphite"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                maxLength={5000}
                rows={6}
                disabled={sending}
                className="w-full resize-none border border-[color:var(--hairline-light)] bg-transparent px-s2 py-s2 text-body text-ink"
              />
            </div>

            {/* Honeypot. Hidden from people and from screen readers, but a bot
                parsing the DOM will fill it in and get silently dropped. */}
            <div aria-hidden="true" className="absolute left-[-9999px]">
              <label htmlFor="company">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="u-mono w-full bg-ink px-s4 py-s3 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-signal disabled:opacity-50"
            >
              {sending ? 'Sending' : 'Send message'}
            </button>

            {/* Real outcomes only. aria-live so the result is announced. */}
            <div aria-live="polite" className="min-h-[1.5rem]">
              {status.kind === 'sent' && (
                <p className="text-ink">
                  Message sent. I will reply to the address you gave.
                </p>
              )}
              {status.kind === 'error' && (
                <p className="text-signal">{status.message}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
