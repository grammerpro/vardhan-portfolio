'use client';

/**
 * Single point of GSAP plugin registration.
 *
 * Every module that animates imports gsap from here, never from 'gsap'
 * directly. That way plugin registration cannot be skipped in one file and
 * duplicated in another, and the easing/duration constants below stay the
 * only values any tween is allowed to use.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

  // Lenis drives the ticker from its own RAF loop. GSAP's lag smoothing
  // second-guesses the delta it gets handed and desyncs scrubs.
  gsap.ticker.lagSmoothing(0);

  // Mobile browsers fire resize when the URL bar shows or hides. Refreshing
  // on that makes pinned sections jump mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });

  // GSAP has no cubic-bezier parser of its own, so the --ease-* tokens from
  // globals.css are restated here as CustomEase paths. A cubic-bezier
  // (x1,y1,x2,y2) is the path M0,0 C{x1},{y1} {x2},{y2} 1,1.
  CustomEase.create('out-expo', 'M0,0 C0.16,1 0.3,1 1,1');
  CustomEase.create('out-quint', 'M0,0 C0.22,1 0.36,1 1,1');
  CustomEase.create('in-out-quart', 'M0,0 C0.76,0 0.24,1 1,1');
}

/** Mirrors --ease-* in globals.css. */
export const EASE = {
  outExpo: 'out-expo',
  outQuint: 'out-quint',
  inOutQuart: 'in-out-quart',
} as const;

/** Mirrors --dur-* in globals.css, in seconds because GSAP wants seconds. */
export const DUR = {
  micro: 0.2,
  base: 0.7,
  reveal: 1.15,
  curtain: 1.4,
} as const;

/** Stagger values from the brief's motion rules, in seconds. */
export const STAGGER = {
  /** Between headline lines. */
  line: 0.08,
  /** Between small repeated items. */
  item: 0.04,
  /** Between major blocks. */
  block: 0.12,
} as const;

export { gsap, ScrollTrigger, CustomEase, useGSAP };
