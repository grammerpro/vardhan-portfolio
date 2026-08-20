'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Section 5.2, and the tonal arc from section 2.
 *
 * Two things happen across one 120vh pin:
 *
 * 1. Word opacity scrubs from 0.15 to 1.0 sequentially, so the visitor reads
 *    the sentence at whatever pace they scroll. Scroll-linked, not triggered.
 * 2. The page background interpolates --paper -> --void and the text --ink ->
 *    --bone. This is the light-to-dark beat, and it is why the work section
 *    below can simply be --void with no transition of its own.
 *
 * The colour is written to CSS custom properties on <html> rather than to
 * this section, because the navbar and the sections below need to read the
 * same values.
 */

const SENTENCE =
  'I build enterprise web platforms during the day, and 3D interfaces, retrieval systems, and browser tooling on my own time.';

const WORDS = SENTENCE.split(' ');

export default function PositioningSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const words = root.current?.querySelectorAll<HTMLElement>('[data-word]');
      if (!words?.length) return;

      const html = document.documentElement;

      // Reduced motion: no pin, no scrub. The sentence is simply readable and
      // the page commits to the dark palette for the sections that need it.
      if (prefersReducedMotion()) {
        gsap.set(words, { opacity: 1 });
        return;
      }

      gsap.set(words, { opacity: 0.15 });

      const paper = '#E8E6E1';
      const voidColor = '#0D0F12';
      const ink = '#121417';
      const bone = '#E8E6E1';

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 1,
          // Only this section drives the arc, so nothing else has to
          // coordinate with it.
          invalidateOnRefresh: true,
        },
      });

      // Colour is driven through gsap.utils.interpolate rather than by
      // tweening the custom properties directly. GSAP's handling of raw
      // `--var` colour tweens depends on it recognising the value as a colour,
      // which is fragile; interpolating explicitly is deterministic.
      const mixBg = gsap.utils.interpolate(paper, voidColor);
      const mixFg = gsap.utils.interpolate(ink, bone);
      const arc = { progress: 0 };

      timeline
        .to(words, {
          opacity: 1,
          ease: 'none',
          stagger: { each: 0.4, ease: 'none' },
        })
        .to(
          arc,
          {
            progress: 1,
            ease: 'none',
            onUpdate: () => {
              html.style.setProperty('--arc-bg', mixBg(arc.progress));
              html.style.setProperty('--arc-fg', mixFg(arc.progress));
              html.style.setProperty('--nav-fg', mixFg(arc.progress));
            },
          },
          0,
        );

      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
      };
    },
    { scope: root },
  );

  return (
    <section
      id="positioning"
      ref={root}
      className="relative flex min-h-svh w-full items-center bg-[color:var(--arc-bg)]"
    >
      <div className="mx-auto w-full max-w-[var(--grid-max)] px-[var(--page-margin)]">
        <p className="max-w-[18ch] font-display text-h1 font-bold leading-[1.05] tracking-[-0.03em] text-[color:var(--arc-fg)] md:max-w-[22ch]">
          {WORDS.map((word, index) => (
            <span key={`${word}-${index}`} data-word className="inline-block">
              {word}
              {index < WORDS.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
