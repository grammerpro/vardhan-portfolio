'use client';

import { useRef, useState } from 'react';

/**
 * Fit Check. The second signature moment on the page, alongside the rail.
 *
 * A visitor pastes a job description and gets an honest read on whether
 * Vardhan matches it, including where he does not. The retrieved evidence is
 * shown with its relevance scores rather than hidden behind a typing
 * indicator, which makes the feature a demonstration of the retrieval work
 * rather than a claim about it.
 *
 * Everything this produces is also readable as plain prose elsewhere on the
 * page. Nobody is required to use it.
 */

type Evidence = { id: string; title: string; type: string; score: number };

type Phase = 'idle' | 'retrieving' | 'generating' | 'done' | 'error';

const EXAMPLES = [
  'AEM developer, 5 years, Java and React',
  'Front end engineer with WebGL experience',
];

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !description.trim()) return;

    setPhase('retrieving');
    setEvidence([]);
    setAnswer('');
    setMessage('');

    try {
      const response = await fetch('/api/fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });

      const contentType = response.headers.get('Content-Type') || '';

      // Errors and out-of-scope come back as JSON rather than a stream.
      if (contentType.includes('application/json')) {
        const json = await response.json().catch(() => ({}));
        setMessage(json.error || 'Something failed.');
        setPhase('error');
        return;
      }

      if (!response.ok || !response.body) {
        setMessage('Something failed. The resume and the work section have the same information.');
        setPhase('error');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let headerRead = false;
      let text = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // First line is the retrieval result, then the model's text.
        if (!headerRead) {
          const newline = buffer.indexOf('\n');
          if (newline === -1) continue;
          try {
            const head = JSON.parse(buffer.slice(0, newline));
            setEvidence(head.evidence ?? []);
            setSearched(head.searched ?? 0);
          } catch {
            // Malformed header; the stream still carries the answer.
          }
          buffer = buffer.slice(newline + 1);
          headerRead = true;
          setPhase('generating');
        }

        text += buffer;
        buffer = '';
        setAnswer(text);
      }

      if (text.trim() === 'OUT_OF_SCOPE') {
        setAnswer('');
        setMessage('That does not look like a job description. Fit Check only answers questions about roles and skills.');
        setPhase('error');
        return;
      }

      setPhase('done');
    } catch {
      setMessage('Could not reach the server. The resume and the work section have the same information.');
      setPhase('error');
    }
  };

  const readout =
    phase === 'retrieving'
      ? `RETRIEVING ${searched || ''} ENTRIES`
      : phase === 'generating'
        ? `MATCHED ${evidence.length} / GENERATING`
        : phase === 'done'
          ? `MATCHED ${evidence.length} / COMPLETE`
          : '';

  return (
    <section id="fit" className="relative w-full bg-void py-s7 text-bone">
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <h2 className="u-mono col-span-4 mb-s5 text-graphite-void md:col-span-12">Fit check</h2>

        <div className="col-span-4 md:col-span-5 md:col-start-2">
          <p className="mb-s4 max-w-[46ch] text-body leading-[var(--leading-body)] text-graphite-void">
            Paste a job description. This reads it against Vardhan&apos;s actual
            experience and tells you where he matches and where he does not.
            It is built to say no.
          </p>

          <form onSubmit={submit}>
            <label htmlFor="fit-input" className="u-mono mb-s1 block text-graphite-void">
              Job description
            </label>

            <textarea
              id="fit-input"
              ref={inputRef}
              value={description}
              onChange={(event) => setDescription(event.target.value.slice(0, MAX))}
              rows={8}
              maxLength={MAX}
              disabled={busy}
              placeholder="Paste the role, or just its requirements."
              className="w-full resize-none border border-[color:var(--hairline-dark)] bg-transparent px-s2 py-s2 text-body text-bone placeholder:text-graphite-void"
            />

            <div className="mt-s1 flex flex-wrap items-center justify-between gap-s2">
              <span className="u-mono text-graphite-void">
                {description.length} / {MAX}
              </span>
              <span className="u-mono text-graphite-void">Not logged, not stored</span>
            </div>

            <div className="mt-s3 flex flex-wrap items-center gap-s3">
              <button
                type="submit"
                disabled={busy || !description.trim()}
                className="u-mono bg-bone px-s4 py-s2 text-void transition-colors duration-[var(--dur-micro)] hover:bg-signal hover:text-bone disabled:opacity-40"
              >
                {busy ? 'Checking' : 'Check fit'}
              </button>

              {readout && <span className="u-mono text-signal">{readout}</span>}
            </div>
          </form>

          <div className="mt-s3 flex flex-wrap gap-s2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                disabled={busy}
                onClick={() => {
                  setDescription(example);
                  inputRef.current?.focus();
                }}
                className="u-mono link text-graphite-void hover:text-bone"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Retrieval and answer. aria-live so a screen reader is told the
            assessment arrived, polite so it does not interrupt typing. */}
        <div className="col-span-4 mt-s5 md:col-span-5 md:col-start-8 md:mt-0" aria-live="polite">
          {evidence.length > 0 && (
            <>
              <p className="u-mono mb-s2 text-graphite-void">
                Evidence retrieved from {searched} entries
              </p>
              <ul className="mb-s5 flex flex-col">
                {evidence.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between gap-s3 border-b border-[color:var(--hairline-dark)] py-s2"
                  >
                    <span className="u-mono text-bone">{item.id}</span>
                    <span className="u-mono tabular-nums text-signal">
                      {item.score.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {answer && (
            <div className="whitespace-pre-wrap text-body leading-[var(--leading-body)] text-bone">
              {answer}
            </div>
          )}

          {message && (
            <p className="text-body leading-[var(--leading-body)] text-graphite-void">{message}</p>
          )}
        </div>
      </div>
    </section>
  );
}
