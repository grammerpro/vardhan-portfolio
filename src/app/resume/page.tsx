'use client';

import { useState } from 'react';

/**
 * Rebuilt in Workstream C. The previous version was off the token system
 * entirely (seven uses of sky-500, a spread of gray-*), used rounded pill
 * buttons with drop shadows and hover scaling, and shipped a developer note to
 * visitors telling them to "make sure public/resume.pdf exists".
 *
 * The paper airplane animation went with it. It was off-token (#0ea5e9) and a
 * flourish of exactly the kind the brief's own error-state rule rejects.
 */
export default function Resume() {
  const [showPdf, setShowPdf] = useState(false);

  return (
    <div className="min-h-svh w-full bg-paper py-s7 text-ink">
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <div className="col-span-4 md:col-span-10 md:col-start-2">
          <p className="u-mono mb-s3 text-graphite">Resume</p>

          <h1 className="mb-s4 font-display text-h1 font-black leading-[0.95] tracking-display">
            Full stack engineer, five years&nbsp;in.
          </h1>

          <p className="mb-s5 max-w-[52ch] text-body leading-[var(--leading-body)] text-graphite">
            The PDF is the detailed version, with named employers and dates. Read
            it here or take a copy.
          </p>

          <div className="mb-s6 flex flex-wrap items-center gap-s3">
            <a
              href="/resume.pdf"
              download="Vardhan_Resume.pdf"
              className="u-mono bg-ink px-s4 py-s2 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-signal"
            >
              Download PDF
            </a>

            <button
              type="button"
              onClick={() => setShowPdf(!showPdf)}
              aria-expanded={showPdf}
              aria-controls="resume-viewer"
              className="u-mono link text-ink hover:text-signal"
            >
              {showPdf ? 'Hide viewer' : 'Read here'}
            </button>
          </div>

          {showPdf && (
            <div
              id="resume-viewer"
              className="border border-[color:var(--hairline-light)]"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--hairline-light)] px-s3 py-s2">
                <span className="u-mono text-graphite">resume.pdf</span>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="&#8599;"
                  className="u-mono link link-external text-ink hover:text-signal"
                >
                  Open in new tab
                </a>
              </div>
              <iframe
                src="/resume.pdf"
                title="Vardhan resume, PDF"
                className="h-[80svh] w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
