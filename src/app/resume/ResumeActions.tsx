'use client';

import { useState } from 'react';
import styles from './resume.module.css';

export default function ResumeActions() {
  const [showPdf, setShowPdf] = useState(false);
  return <div className={styles.interactive}>
    <div className={styles.actions}>
      <a href="/resume.pdf" download="Vardhan_Resume.pdf" className={styles.primary}>Download PDF <span aria-hidden="true">↓</span></a>
      <button type="button" onClick={() => setShowPdf(!showPdf)} aria-expanded={showPdf} aria-controls="resume-viewer">{showPdf ? 'Hide viewer' : 'Read here'} <span aria-hidden="true">{showPdf ? '−' : '+'}</span></button>
      <button type="button" onClick={() => window.print()}>Print overview <span aria-hidden="true">↗</span></button>
    </div>
    <noscript><p>Read the <a href="/resume.pdf">original PDF</a> directly, or print the overview below.</p></noscript>
    <div id="resume-viewer" className={styles.viewer} hidden={!showPdf}>
      {showPdf && <><div className={styles.viewerBar}><span>Original résumé / PDF</span><a href="/resume.pdf" target="_blank" rel="noopener noreferrer">Open in new tab <span aria-hidden="true">↗</span></a></div><iframe src="/resume.pdf" title="Vardhan résumé, original PDF" /><p className={styles.viewerNote}>If your browser does not display the PDF, <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">open it in a new tab</a> or use Download PDF.</p></>}
    </div>
  </div>;
}
