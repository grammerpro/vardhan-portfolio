'use client';

import { siteConfig } from '@/config/site';

/**
 * Section 5.7. The marquee is a single row, set in the mono utility face at
 * low contrast, roughly 40 seconds per cycle. It should read as a status
 * ticker rather than a banner.
 *
 * The marquee is the one place a `linear` timing function is correct: brief
 * section 3 permits it for continuous loops.
 */

const TICKER = [
  'FULL STACK ENGINEER',
  'CINCINNATI OHIO',
  'ADOBE EXPERIENCE MANAGER',
  'REACT / TYPESCRIPT',
  'JAVA SPRING BOOT',
  'AWS',
  'THREE.JS',
  'OPEN TO FULL-TIME',
];

export default function Footer() {
  const year = new Date().getFullYear();
  const row = TICKER.join('  /  ');

  return (
    <footer className="relative w-full overflow-hidden bg-paper pt-s6 text-ink">
      {/* Marquee. aria-hidden because it is decorative repetition; everything
          it says is stated in prose elsewhere on the page. Hidden outright
          under reduced motion rather than left as a frozen strip. */}
      <div
        aria-hidden="true"
        className="flex w-full overflow-hidden border-y border-[color:var(--hairline-light)] py-s2 motion-reduce:hidden"
      >
        <div className="marquee-track u-mono flex shrink-0 gap-s4 whitespace-nowrap text-graphite">
          <span>{row}</span>
          <span>{row}</span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)] py-s6 md:grid-cols-12">
        <div className="col-span-4 md:col-span-6">
          <p className="u-mono mb-s3 text-graphite">Sitemap</p>
          <ul className="flex flex-col gap-s1 text-body">
            <li>
              <a href="#hero" className="link hover:text-signal">
                Index
              </a>
            </li>
            <li>
              <a href="#work" className="link hover:text-signal">
                Work
              </a>
            </li>
            <li>
              <a href="#about" className="link hover:text-signal">
                About
              </a>
            </li>
            <li>
              <a href="/resume" className="link hover:text-signal">
                Resume
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-4 md:col-span-6">
          <p className="u-mono mb-s3 text-graphite">Elsewhere</p>
          <ul className="flex flex-col gap-s1 text-body">
            <li>
              <a data-cursor="↗"
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-external hover:text-signal"
              >
                GitHub
              </a>
            </li>
            <li>
              <a data-cursor="↗"
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-external hover:text-signal"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a data-cursor="↗"
                href={siteConfig.social.leetcode}
                target="_blank"
                rel="noopener noreferrer"
                className="link link-external hover:text-signal"
              >
                LeetCode
              </a>
            </li>
          </ul>
        </div>

        <div className="u-mono col-span-4 mt-s5 flex flex-col gap-s1 text-graphite md:col-span-12 md:flex-row md:justify-between">
          <span>&copy; {year} Vardhan</span>
          <span>Open to full-time roles and freelance work</span>
        </div>
      </div>
    </footer>
  );
}
