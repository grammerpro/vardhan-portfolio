'use client';

import { useRef, useState } from 'react';
import { siteConfig } from '@/config/site';

type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string };
const emptyForm = { name: '', email: '', message: '', company: '' };

export default function ContactSection() {
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [copyStatus, setCopyStatus] = useState('');
  const addressRef = useRef<HTMLAnchorElement>(null);
  const sending = status.kind === 'sending';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    setStatus({ kind: 'sending' });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) {
        setStatus({ kind: 'error', message: typeof result.error === 'string' ? result.error : 'The message could not be sent. Please try again or email me directly.' });
        return;
      }
      setStatus({ kind: 'sent' });
      setFormData(emptyForm);
    } catch {
      setStatus({ kind: 'error', message: 'Could not reach the server. Your message is still here. Please try again or email me directly.' });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(previous => ({ ...previous, [name]: value }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(siteConfig.email);
      setCopyStatus('Email address copied.');
    } catch {
      const address = addressRef.current;
      const selection = window.getSelection();
      if (address && selection) {
        const range = document.createRange();
        range.selectNodeContents(address);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopyStatus('Clipboard unavailable. The address is selected; copy it or use the email link.');
    }
  };

  return (
    <section id="contact" className="contact-section section-shell" aria-labelledby="contact-title">
      <div className="contact-heading section-heading">
        <p className="eyebrow">06 / Contact</p>
        <h2 id="contact-title">Have something<br /><em>in mind?</em></h2>
      </div>
      <div className="contact-panel">
        <div className="contact-details">
          <p>Email is the fastest way to reach me. The form goes to the same place.</p>
          <div className="contact-email">
            <a ref={addressRef} href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <button type="button" className="button button-secondary" onClick={copyEmail}>Copy email</button>
          </div>
          <p className="form-note" role="status">{copyStatus}</p>
          <ul className="contact-socials">
            <li><a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a></li>
            <li><a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></li>
            <li><a href={siteConfig.social.leetcode} target="_blank" rel="noopener noreferrer">LeetCode <span aria-hidden="true">↗</span></a></li>
          </ul>
          <p className="eyebrow">{siteConfig.location}</p>
        </div>
        <form onSubmit={handleSubmit} method="post" action="/api/contact" className="contact-form" aria-busy={sending}>
          <noscript><p>This form needs JavaScript. Please use the email link to get in touch.</p></noscript>
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input className="form-input" id="name" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required maxLength={100} disabled={sending} />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input className="form-input" type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required maxLength={200} disabled={sending} />
          </div>
          <div className="form-field">
            <label htmlFor="message">Message</label>
            <textarea className="form-input" id="message" name="message" value={formData.message} onChange={handleChange} required maxLength={5000} rows={5} disabled={sending} aria-describedby="contact-privacy" />
          </div>
          <div hidden aria-hidden="true">
            <label htmlFor="company">Company</label>
            <input id="company" name="company" tabIndex={-1} autoComplete="off" value={formData.company} onChange={handleChange} />
          </div>
          <p id="contact-privacy" className="form-note">Your name, email, and message are sent through Resend to my inbox.</p>
          <button type="submit" disabled={sending} className="button button-primary">{sending ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
          <div className="form-status" role="status" aria-live="polite" aria-atomic="true">
            {status.kind === 'sent' && <p>Message accepted. I will reply to the address you gave.</p>}
            {status.kind === 'error' && <p>{status.message}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}

