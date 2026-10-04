'use client';

import { useRef, useState } from 'react';

type Evidence = { id: string; title: string; type: string; score: number };
type Phase = 'idle' | 'retrieving' | 'generating' | 'done' | 'error';
const EXAMPLES = ['AEM developer, Java and React', 'Front end engineer with graphics experience'];
const MAX = 6000;

export default function FitCheck() {
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [searched, setSearched] = useState(0);
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const busy = phase === 'retrieving' || phase === 'generating';

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !description.trim()) return;
    setPhase('retrieving');
    setEvidence([]);
    setSearched(0);
    setAnswer('');
    setMessage('');
    try {
      const response = await fetch('/api/fit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description }),
      });
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const json = await response.json().catch(() => ({}));
        setMessage(typeof json.error === 'string' ? json.error : 'The assessment could not be generated. Please try again.');
        setPhase('error');
        return;
      }
      if (!response.ok || !response.body) throw new Error('Response unavailable');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let headerRead = false;
      let text = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        if (!headerRead) {
          const newline = buffer.indexOf('\n');
          if (newline === -1) continue;
          const head = JSON.parse(buffer.slice(0, newline));
          const entries: Evidence[] = Array.isArray(head.evidence) ? head.evidence.filter((entry: Evidence) => typeof entry?.id === 'string' && typeof entry.title === 'string' && Number.isFinite(entry.score)) : [];
          setEvidence(entries);
          setSearched(Number.isFinite(head.searched) ? head.searched : 0);
          buffer = buffer.slice(newline + 1);
          headerRead = true;
          setPhase('generating');
        }
        text += buffer;
        buffer = '';
        setAnswer(text);
      }
      text += decoder.decode();
      if (!headerRead || !text.trim()) throw new Error('Empty assessment');
      if (text.trim() === 'OUT_OF_SCOPE') {
        setAnswer('');
        setMessage('That does not look like a job description. Fit Check only answers questions about roles and skills.');
        setPhase('error');
        return;
      }
      setAnswer(text);
      setPhase('done');
    } catch {
      setAnswer('');
      setMessage('The assessment could not finish. Your description is still here. Please try again or review the résumé and work.');
      setPhase('error');
    }
  };

  const readout = phase === 'retrieving' ? 'Finding relevant experience…' : phase === 'generating' ? 'Writing assessment…' : phase === 'done' ? 'Assessment complete.' : '';

  return (
    <section id="fit" className="fit-section section-shell" aria-labelledby="fit-title" tabIndex={-1}>
      <div className="fit-heading section-heading"><p className="eyebrow">Recruiter utility</p><h3 id="fit-title">A clearer picture of fit.</h3></div>
      <div className="fit-grid">
        <div className="fit-intro">
          <p>Compare a role with Vardhan&apos;s documented experience. This optional AI assessment identifies matches and gaps; it can make mistakes.</p>
          <form onSubmit={submit} method="post" action="/api/fit" className="fit-form" aria-busy={busy}>
            <noscript><p>Fit Check needs JavaScript. The résumé and work links below remain available.</p></noscript>
            <div className="form-field">
              <label htmlFor="fit-input">Job description</label>
              <textarea id="fit-input" ref={inputRef} value={description} onChange={event => setDescription(event.target.value.slice(0, MAX))} rows={7} maxLength={MAX} disabled={busy} required placeholder="Paste the role, or just its requirements." className="form-input" aria-describedby="fit-privacy fit-count" />
            </div>
            <div className="fit-meta"><span id="fit-count" className="form-note">{description.length} / {MAX} characters</span></div>
            <p id="fit-privacy" className="form-note">Submitting sends this text to Google Gemini for embedding and assessment. This app does not intentionally save or log it; Google&apos;s processing policies apply. Please omit confidential or personal information.</p>
            <div className="form-actions"><button type="submit" disabled={busy || !description.trim()} className="button button-primary">{busy ? 'Checking…' : 'Check fit'} <span aria-hidden="true">↗</span></button><span className="form-note" role="status">{readout}</span></div>
          </form>
          <div className="fit-examples">{EXAMPLES.map(example => <button key={example} type="button" disabled={busy} className="button button-secondary" onClick={() => { setDescription(example); inputRef.current?.focus(); }}>{example}</button>)}</div>
        </div>
        <div className="fit-result" aria-busy={busy}>
          {!answer && !message && !busy && <p>Evidence comes first.<br />The assessment will show where the role aligns and where the evidence falls short.</p>}
          {evidence.length > 0 && <><p className="eyebrow">Relevant evidence / {searched} entries searched</p><ul className="fit-evidence">{evidence.map(item => <li key={item.id}><span>{item.title}<small>{item.id}</small></span><span aria-label={`Similarity ${item.score.toFixed(2)}`}>{item.score.toFixed(2)}</span></li>)}</ul><p className="form-note">Similarity scores rank evidence. They are not a fit percentage.</p></>}
          {answer && <div className="fit-answer">{answer}</div>}
          <div className="form-status" role="status" aria-atomic="true">{message && <p>{message}</p>}</div>
          <p className="form-note">Prefer to read directly? <a href="/resume">View résumé</a> or <a href="#work">explore work</a>.</p>
        </div>
      </div>
    </section>
  );
}

