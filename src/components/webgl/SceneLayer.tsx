'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import IndexStructure from './IndexStructure';

/**
 * The single <Canvas> for the whole page. Section 4 allows exactly one, as a
 * fixed, full-viewport, pointer-events-none layer behind the content.
 *
 * Guards required by section 7:
 *  - DPR capped at min(devicePixelRatio, 2)
 *  - mounts only while the hero is in or near the viewport
 *  - unmounts on tab blur
 *  - never mounts at all under reduced motion
 */
export default function SceneLayer() {
  const [active, setActive] = useState(false);
  const [dpr, setDpr] = useState(1);
  const nearHero = useRef(false);
  const visible = useRef(true);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Desktop only. The point cloud is ambient decoration, and on a phone the
    // three.js parse and compile cost pushed total blocking time past four
    // seconds, which fails the mobile budget in section 7 outright. The hero
    // is type-led and reads correctly without it.
    if (window.matchMedia('(max-width: 767px)').matches) return;

    setDpr(Math.min(window.devicePixelRatio, 2));

    // Three.js parses and compiles for long enough to show up in total
    // blocking time, so nothing starts until the browser is idle. The hero
    // reads perfectly well without the point cloud for the first moment, and
    // fading it in over 1600ms hides the late arrival anyway.
    let settled = false;
    const sync = () => setActive(settled && nearHero.current && visible.current);
    const settle = () => {
      settled = true;
      sync();
    };

    // `'requestIdleCallback' in window` narrows window to never in the else
    // branch, so the capability is read off a local first.
    const ric = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;
    let idleHandle: number | undefined;
    let timerHandle: number | undefined;

    if (typeof ric === 'function') idleHandle = ric(settle, { timeout: 3000 });
    else timerHandle = window.setTimeout(settle, 2000);

    const hero = document.getElementById('hero');
    let observer: IntersectionObserver | undefined;

    if (hero) {
      observer = new IntersectionObserver(
        ([entry]) => {
          nearHero.current = entry.isIntersecting;
          sync();
        },
        // One viewport of margin, so it is ready before it is needed and
        // released shortly after it leaves.
        { rootMargin: '100% 0px 100% 0px' },
      );
      observer.observe(hero);
    }

    const onVisibility = () => {
      visible.current = document.visibilityState === 'visible';
      sync();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (idleHandle !== undefined) cancelIdle?.(idleHandle);
      if (timerHandle !== undefined) window.clearTimeout(timerHandle);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!active) return null;

  return (
    // Canvas opacity 0 to 1 over 1600ms, linear, per section 5.1.
    <div aria-hidden="true" className="canvas-fade pointer-events-none fixed inset-0 z-0">
      {/* Orthographic, not a long-lens perspective. The brief allows either,
          but true orthographic makes "diagram rather than object in a room"
          structural rather than an approximation that drifts the first time
          somebody adjusts the focal length. Antialiasing stays on here: at 1px
          line width, aliased edges are very visible. */}
      <Canvas
        orthographic
        dpr={dpr}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [26, 18, 30], zoom: 14, near: -200, far: 200 }}
      >
        <IndexStructure />
      </Canvas>
    </div>
  );
}
