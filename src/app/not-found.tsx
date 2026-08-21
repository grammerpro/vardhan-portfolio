import Link from 'next/link';

export const metadata = { title: 'Not found' };

/**
 * Section 7 of PHASE_2_BRIEF: state what happened and what to do next, in the
 * interface's voice. No apologies, no personality, no oversized "404" as
 * decoration.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh w-full items-center bg-paper text-ink">
      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] md:grid-cols-12">
        <div className="col-span-4 md:col-span-7 md:col-start-2">
          <p className="u-mono mb-s3 text-graphite">Error 404</p>

          <h1 className="mb-s4 font-display text-h1 font-black leading-[0.95] tracking-display">
            This page does not&nbsp;exist.
          </h1>

          <p className="mb-s5 max-w-[52ch] text-body leading-[var(--leading-body)] text-graphite">
            The address is either mistyped or points at something that has been
            removed. Everything on this site is reachable from the index.
          </p>

          <ul className="flex flex-col gap-s2 text-body">
            <li>
              <Link href="/" className="link hover:text-signal">
                Return to the index
              </Link>
            </li>
            <li>
              <Link href="/#work" className="link hover:text-signal">
                Selected work
              </Link>
            </li>
            <li>
              <Link href="/resume" className="link hover:text-signal">
                Resume
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
