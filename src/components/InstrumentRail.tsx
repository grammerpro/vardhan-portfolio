'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useLenis } from './providers/SmoothScrollProvider';

/**
 * The signature element. Reads out the page's own state:
 *
 *   SEC 03 / WORK        SCROLL 42.7%        FPS 60
 *
 * All three values are real. SEC comes from ScrollTrigger, SCROLL from the
 * Lenis progress value (or native scroll when Lenis is off), FPS from an
 * actual frame counter.
 *
 * This updates every frame, so it deliberately does not use React state.
 * Sixty re-renders a second would be the worst thing on the page for INP.
 * Values are written straight to textContent through refs from one rAF loop.
 * This is the one component where bypassing React's render cycle is correct.
 *
 * aria-hidden because a live region changing 60 times a second makes a screen
 * reader unusable, and this information is ambient rather than necessary.
 */

const SECTIONS = [
  { id: 'hero', label: 'INDEX' },
  { id: 'positioning', label: 'POSITIONING' },
  { id: 'work', label: 'WORK' },
  { id: 'capability', label: 'CAPABILITY' },
  { id: 'about', label: 'ABOUT' },
  { id: 'contact', label: 'CONTACT' },
];

export default function InstrumentRail() {
  const lenis = useLenis();
  const secRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);

  // Held in a ref rather than state so ScrollTrigger callbacks can update it
  // without provoking a render.
  const activeSection = useRef(0);

  useEffect(() => {
    let rafId = 0;
    let frames = 0;
    let windowStart = performance.now();

    const readScrollProgress = (): number => {
      // Lenis exposes a real 0-1 progress value. Without it (reduced motion)
      // fall back to native scroll so the readout stays true rather than
      // freezing at zero.
      if (lenis && typeof lenis.progress === 'number' && Number.isFinite(lenis.progress)) {
        return lenis.progress;
      }
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? window.scrollY / scrollable : 0;
    };

    // Which section owns the viewport centre. Computed by bounds check in the
    // same loop rather than with per-section ScrollTriggers: those fired their
    // onEnter callbacks during refresh, so at scroll 0 the last section won
    // and the rail read "SEC 06 / CONTACT" on a page that had not moved.
    const readSection = (): number => {
      const middle = window.innerHeight / 2;
      let current = 0;
      SECTIONS.forEach((section, index) => {
        const element = document.getElementById(section.id);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        if (rect.top <= middle && rect.bottom > middle) current = index;
      });
      return current;
    };

    const tick = (now: number) => {
      frames += 1;

      const index = readSection();
      if (index !== activeSection.current) {
        activeSection.current = index;
        if (secRef.current) {
          secRef.current.textContent = `SEC ${String(index + 1).padStart(2, '0')} / ${SECTIONS[index].label}`;
        }
      }

      // FPS over a rolling one-second window. Updating the text every frame
      // would make it unreadable anyway.
      const elapsed = now - windowStart;
      if (elapsed >= 1000) {
        const fps = Math.round((frames * 1000) / elapsed);
        if (fpsRef.current) fpsRef.current.textContent = `FPS ${fps}`;
        frames = 0;
        windowStart = now;
      }

      const percent = Math.min(100, Math.max(0, readScrollProgress() * 100));
      if (scrollRef.current) {
        scrollRef.current.textContent = `SCROLL ${percent.toFixed(1)}%`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [lenis]);

  useEffect(() => {
    // The rail itself fades in once, after the hero has settled.
    const element = document.getElementById('instrument-rail');
    if (!element) return;
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'none', delay: 1.4 },
    );
  }, []);

  return (
    <aside
      id="instrument-rail"
      aria-hidden="true"
      // Desktop sits at 8px so its ~13px-wide vertical text ends around 21px,
      // clearing the 40px --page-margin where content starts. At 24px it
      // collided with the hero name.
      // --graphite reads on both --paper and --void, verified in capture, so
      // this needs no blend trick. Deliberately low contrast: the brief asks
      // for quiet, and the rail is aria-hidden ambient telemetry.
      // On mobile it sits along the bottom edge over scrolling content, so it
      // takes the current arc background and a hairline rule and reads as a
      // status bar. Without that it floated over project artwork. On desktop
      // it is bare text in the left margin, where nothing collides.
      className="u-mono pointer-events-none fixed z-40 text-graphite opacity-0
                 bottom-0 left-0 right-0 flex justify-between gap-s3 px-s3 py-s2
                 bg-[color:var(--arc-bg)] border-t border-[color:var(--hairline-dark)]
                 md:border-0 md:bg-transparent
                 md:bottom-auto md:right-auto md:left-s1 md:top-1/2 md:block md:-translate-y-1/2 md:px-0 md:py-0"
    >
      {/* Desktop reads bottom-to-top up the left edge; mobile is a normal
          horizontal strip along the bottom. */}
      <span className="md:block md:[writing-mode:vertical-rl] md:rotate-180 md:mb-s3">
        <span ref={secRef}>SEC 01 / INDEX</span>
      </span>
      <span className="md:block md:[writing-mode:vertical-rl] md:rotate-180 md:mb-s3">
        <span ref={scrollRef}>SCROLL 0.0%</span>
      </span>
      <span className="md:block md:[writing-mode:vertical-rl] md:rotate-180">
        <span ref={fpsRef}>FPS 60</span>
      </span>
    </aside>
  );
}
