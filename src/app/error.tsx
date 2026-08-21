'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Runtime error boundary. Same rules as the 404: say what happened, offer the
 * next action, do not apologise and do not perform.
 *
 * The digest is surfaced deliberately. If someone reports a problem, that
 * string is the only thing that makes it findable in the logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh w-full items-center bg-paper text-ink">
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <div className="col-span-4 md:col-span-7 md:col-start-2">
          <p className="u-mono mb-s3 text-graphite">Application error</p>

          <h1 className="mb-s4 font-display text-h1 font-black leading-[0.95] tracking-display">
            Something failed to&nbsp;render.
          </h1>

          <p className="mb-s5 max-w-[52ch] text-body leading-[var(--leading-body)] text-graphite">
            This is a fault on the page, not with anything you did. Retrying
            usually clears it. If it does not, the reference below identifies
            this specific failure.
          </p>

          <div className="flex flex-wrap items-center gap-s3">
            <button
              type="button"
              onClick={reset}
              className="u-mono bg-ink px-s4 py-s2 text-paper transition-colors duration-[var(--dur-micro)] hover:bg-signal"
            >
              Retry
            </button>

            <Link href="/" className="link text-body hover:text-signal">
              Return to the index
            </Link>
          </div>

          {error.digest && (
            <p className="u-mono mt-s5 text-graphite">Reference {error.digest}</p>
          )}
        </div>
      </div>
    </div>
  );
}
