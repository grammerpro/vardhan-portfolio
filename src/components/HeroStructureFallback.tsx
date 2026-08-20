'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { projectToPath } from './webgl/structureGenerator.mjs';

/**
 * The static half of The Index.
 *
 * WebGL is skipped below 768px for performance and skipped entirely under
 * reduced motion. Absence is not a design, so both cases get the same
 * structure, generated from the same module, at the same 0.35 opacity.
 *
 * It is inline <svg> with a single <path>, not an <img>. That is deliberate:
 * an <img> is a Largest Contentful Paint candidate, and as a file reference it
 * became the LCP element on mobile with a 6.8s load delay. Inline SVG content
 * is not an LCP candidate, needs no request, and one path is one DOM node
 * instead of 576.
 *
 * On mobile it keeps the scroll-linked fade. Under reduced motion it is fully
 * static, because section 7 forbids scroll scrubs there.
 */
export default function HeroStructureFallback() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { d, width, height } = useMemo(() => projectToPath(), []);

  useEffect(() => {
    const small = window.matchMedia('(max-width: 767px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Shown whenever the canvas is not: on small screens, or under reduced
    // motion at any width. Reduced motion previously got nothing at all.
    const sync = () => {
      setVisible(small.matches || reduced.matches);
      setAnimate(!reduced.matches);
    };

    sync();
    small.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      small.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!visible || !animate) return;

    let frame = 0;
    const tick = () => {
      const node = ref.current;
      if (node) {
        const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
        node.style.opacity = String(1 - progress);
        node.style.transform = `translate3d(0, ${window.scrollY * 0.4}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, animate]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
        focusable="false"
        className="absolute left-1/2 top-[28%] w-[125%] max-w-none -translate-x-1/2 -translate-y-1/2 md:top-1/2 md:w-full"
      >
        <path
          d={d}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
