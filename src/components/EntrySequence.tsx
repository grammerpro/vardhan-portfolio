'use client';

import { useEffect, useRef } from 'react';
import { gsap, EASE, DUR } from '@/lib/gsap';

/**
 * Section 5.0. First load only, session-storage flagged.
 *
 * The overlay is rendered server-side so it covers the hero from the first
 * paint. A blocking script in <head> (see layout.tsx) stamps
 * document.documentElement.dataset.entry with 'first' or 'seen' before the
 * body paints, and CSS hides the overlay outright for 'seen'. That is what
 * keeps returning visitors from seeing a flash of it.
 *
 * Timing is derived from the brief's own budget rather than picked. Content
 * must be interactive by 2200ms; the curtain is --dur-curtain (1400ms) and
 * the hero starts at 60% of it, so the counter phase cannot exceed
 * 2200 - (1400 * 0.6) = 1360ms.
 */

const MIN_COUNTER_MS = 800;
const MAX_COUNTER_MS = 1360;

/** Fired when the curtain is 60% clear. HeroSection listens for it. */
export const HERO_CUE = 'entry:hero-cue';

/**
 * Real load milestones. The browser exposes no bytes-remaining figure for a
 * page that is still streaming, so a literal percentage of total payload is
 * not obtainable. These are three things that genuinely resolve, weighted by
 * how much of the perceived load they represent. Nothing here is a timer
 * pretending to be progress.
 */
function trackLoadProgress(onChange: (value: number) => void): () => void {
  let cancelled = false;
  let loaded = 0;

  const advance = (weight: number) => {
    if (cancelled) return;
    loaded += weight;
    onChange(Math.min(1, loaded));
  };

  // Fonts. The heaviest real dependency for a type-driven page.
  document.fonts.ready.then(() => advance(0.5));

  // Images already in the DOM.
  const images = Array.from(document.images);
  if (images.length === 0) {
    advance(0.3);
  } else {
    Promise.all(
      images.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve())),
    ).then(() => advance(0.3));
  }

  // Everything else the document is waiting on.
  if (document.readyState === 'complete') {
    advance(0.2);
  } else {
    window.addEventListener('load', () => advance(0.2), { once: true });
  }

  return () => {
    cancelled = true;
  };
}

export default function EntrySequence() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    const finish = () => {
      root.dataset.entry = 'seen';
      overlayRef.current?.remove();
    };

    // Returning visitor, or reduced motion. Either way there is no sequence:
    // the hero is already visible and just needs its cue.
    if (root.dataset.entry === 'seen') {
      window.dispatchEvent(new Event(HERO_CUE));
      return;
    }

    try {
      sessionStorage.setItem('entry-seen', '1');
    } catch {
      // Private mode. The sequence simply replays next visit.
    }

    const started = performance.now();

    // `target` is the real measured progress; `shown` eases toward it so the
    // number reads continuously instead of jumping between three milestones.
    let target = 0;
    let shown = 0;
    let rafId = 0;
    let done = false;

    const stopTracking = trackLoadProgress((value) => {
      target = value;
    });

    const tl = gsap.timeline({ paused: true });

    tl.to(readoutRef.current, {
      opacity: 0,
      duration: DUR.micro,
      ease: EASE.outExpo,
    })
      .to(
        topRef.current,
        {
          yPercent: -100,
          duration: DUR.curtain,
          ease: EASE.inOutQuart,
        },
        0,
      )
      .to(
        bottomRef.current,
        {
          yPercent: 100,
          duration: DUR.curtain,
          ease: EASE.inOutQuart,
        },
        0,
      )
      // 60% of the way through the curtain, not after it. The hero reveal and
      // the split overlap deliberately.
      .call(
        () => {
          window.dispatchEvent(new Event(HERO_CUE));
        },
        undefined,
        DUR.curtain * 0.6,
      )
      .call(finish);

    const tick = () => {
      const elapsed = performance.now() - started;

      // Past the cap the counter completes regardless of load state, so the
      // 2.2s budget holds on a slow connection.
      const forced = elapsed >= MAX_COUNTER_MS;
      const ceiling = forced ? 1 : target;

      shown += (ceiling - shown) * 0.12;
      if (forced) shown = Math.max(shown, Math.min(1, (elapsed - MAX_COUNTER_MS) / 200 + shown));

      const percent = Math.min(100, Math.round(shown * 100));
      if (readoutRef.current) {
        readoutRef.current.textContent = String(percent).padStart(3, '0');
      }

      const settled = percent >= 100 && elapsed >= MIN_COUNTER_MS;

      if (!done && (settled || elapsed >= MAX_COUNTER_MS + 200)) {
        done = true;
        if (readoutRef.current) readoutRef.current.textContent = '100';
        tl.play();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      stopTracking();
      tl.kill();
    };
  }, []);

  return (
    <div
      id="entry-overlay"
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <div ref={topRef} className="absolute inset-x-0 top-0 h-1/2 bg-void" />
      <div ref={bottomRef} className="absolute inset-x-0 bottom-0 h-1/2 bg-void" />
      <span
        ref={readoutRef}
        className="u-mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-bone"
      >
        000
      </span>
    </div>
  );
}
