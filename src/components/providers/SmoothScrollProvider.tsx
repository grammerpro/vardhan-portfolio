'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { REDUCED_MOTION_QUERY } from '@/hooks/useReducedMotion';

/**
 * The one Lenis instance for the whole app.
 *
 * Note on the GSAP wiring: the brief asks for ScrollTrigger.scrollerProxy.
 * That is for when Lenis wraps a custom scroll element. This page scrolls on
 * window, so Lenis moves real scroll position and ScrollTrigger reads it
 * correctly without a proxy. Proxying window is a known source of pin-offset
 * and refresh bugs, so the standard integration is used instead: forward
 * Lenis scroll events to ScrollTrigger.update, and drive lenis.raf from the
 * GSAP ticker so both run on one RAF loop.
 */

const LenisContext = createContext<Lenis | null>(null);

/**
 * Returns the live Lenis instance, or null when smooth scroll is off
 * (reduced motion, or before the provider's effect has run). Consumers must
 * handle null rather than assume it exists.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/** Functional equivalent of --ease-out-expo, for Lenis's easing option. */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);

    let instance: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      if (instance) return;

      instance = new Lenis({
        duration: 1.1,
        easing: easeOutExpo,
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      instance.on('scroll', ScrollTrigger.update);

      // GSAP ticker time is in seconds, lenis.raf expects milliseconds.
      tick = (time: number) => instance?.raf(time * 1000);
      gsap.ticker.add(tick);

      setLenis(instance);
    };

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      instance?.destroy();
      tick = null;
      instance = null;
      setLenis(null);
    };

    // Reduced motion means no smooth scroll at all: Lenis is never
    // constructed, and the browser's native scrolling is left alone. Bound to
    // the media query rather than read once, so toggling the OS setting takes
    // effect without a reload.
    const sync = () => (mq.matches ? stop() : start());

    sync();
    mq.addEventListener('change', sync);

    // Font swap changes layout height after first paint, which invalidates
    // every ScrollTrigger start/end computed before it.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mq.removeEventListener('change', sync);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
