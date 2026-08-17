'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import SplitType from 'split-type';
import { gsap, useGSAP, EASE, DUR, STAGGER } from '@/lib/gsap';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { HERO_CUE } from './EntrySequence';
import { siteConfig } from '@/config/site';

/**
 * Section 5.1. Replaces the previous 423-line hero.
 *
 * Gone with it: the per-character blur reveal (a typewriter-adjacent effect
 * that animated `filter`, which section 7 forbids on scroll), both magnetic
 * CTA buttons, the ambient shapes, the interactive grid, and the noise
 * texture layer.
 *
 * The WebGL point cloud behind the type is dynamically imported and client-
 * only, so the three/R3F bundle stays out of the first load.
 */
const SceneLayer = dynamic(() => import('./webgl/SceneLayer'), { ssr: false });
export default function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const nameEl = root.current?.querySelector<HTMLElement>('[data-hero-name]');
      const supporting = root.current?.querySelectorAll<HTMLElement>('[data-hero-fade]');

      if (!nameEl || !supporting) return;

      // Reduced motion: everything visible at its final position, no split,
      // no tween. Section 7 requires this to be built in per section rather
      // than retrofitted.
      if (reduced) {
        gsap.set([nameEl, ...Array.from(supporting)], { opacity: 1, y: 0 });
        return;
      }

      const split = new SplitType(nameEl, { types: 'lines' });
      const lines = split.lines ?? [];

      // Each line gets its own overflow:hidden mask so the type slides up out
      // of nothing. Big type is never revealed on opacity alone.
      lines.forEach((line) => {
        const mask = document.createElement('span');
        mask.style.display = 'block';
        mask.style.overflow = 'hidden';
        line.parentNode?.insertBefore(mask, line);
        mask.appendChild(line);
      });

      gsap.set(nameEl, { opacity: 1 });
      gsap.set(lines, { yPercent: 110 });
      gsap.set(supporting, { opacity: 0, y: 24 });

      const tl = gsap.timeline({ paused: true });

      tl.to(lines, {
        yPercent: 0,
        duration: DUR.reveal,
        ease: EASE.outExpo,
        stagger: STAGGER.line,
      }).to(
        supporting,
        {
          opacity: 1,
          y: 0,
          duration: DUR.base,
          ease: EASE.outExpo,
          stagger: STAGGER.item,
        },
        // 300ms after the first name line begins, per the brief.
        0.3,
      );

      // The entry sequence fires this at 60% of the curtain so the two
      // overlap. If the sequence already ran this session it fires on mount.
      const play = () => tl.play();
      window.addEventListener(HERO_CUE, play, { once: true });

      return () => window.removeEventListener(HERO_CUE, play);
    },
    { scope: root },
  );

  return (
    <section
      id="hero"
      ref={root}
      className="relative flex min-h-svh w-full flex-col justify-end bg-paper"
    >
      <SceneLayer />

      <div
        className="relative z-10 mx-auto grid w-full max-w-[var(--grid-max)] grid-cols-4 gap-s3 px-[var(--page-margin)]
                   pb-s6 pt-s7 md:grid-cols-12 md:pb-s7"
      >
        {/* Positioning statement, upper right, narrow measure. Section 5.1
            caps this at five columns. */}
        <p
          data-hero-fade
          className="col-span-4 mb-s6 self-start text-body leading-[var(--leading-body)] text-graphite
                     md:col-span-5 md:col-start-8 md:mb-s8"
        >
          Five years building content platforms and services for telecom,
          fintech, insurance, and healthcare. The repos are where the graphics
          and retrieval work lives.
        </p>

        {/* Name block, low left. */}
        <div className="col-span-4 md:col-span-8 md:col-start-1">
          <p data-hero-fade className="u-mono mb-s3 text-graphite">
            {siteConfig.role} / {siteConfig.location}
          </p>

          <h1
            data-hero-name
            className="font-display text-display font-black leading-[0.86] tracking-[-0.03em] text-ink opacity-0"
            style={{ fontStretch: '118%' }}
          >
            Vardhan
          </h1>

          <p data-hero-fade className="mt-s4">
            <a
              href="#work"
              className="u-mono text-ink underline decoration-1 underline-offset-8
                         transition-colors duration-[var(--dur-micro)] hover:text-signal"
            >
              Selected work
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
