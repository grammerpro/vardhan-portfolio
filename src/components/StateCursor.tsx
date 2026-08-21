'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * State-aware cursor label.
 *
 * Not a trailing dot, not a ring, no blend mode, no lag. The native cursor is
 * left alone; this adds a small mono label beside it that names what the thing
 * under the pointer does, driven by data-cursor attributes on elements.
 *
 * Position is written straight to the node on pointermove rather than held in
 * React state. A state update per mouse move would re-render the tree dozens of
 * times a second, which is the same reason the instrument rail bypasses React.
 *
 * Removed entirely on touch devices and under reduced motion.
 */
export default function StateCursor() {
  const [enabled, setEnabled] = useState(false);
  const node = useRef<HTMLDivElement>(null);
  const label = useRef<string | null>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => setEnabled(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      const el = node.current;
      if (!el) return;

      // No lerp. The brief asks for no lag, so the label tracks exactly.
      el.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

      const target = event.target as Element | null;
      const holder = target?.closest?.('[data-cursor]') as HTMLElement | null;
      const next = holder?.dataset.cursor ?? null;

      if (next !== label.current) {
        label.current = next;
        el.textContent = next ?? '';
        el.dataset.active = next ? 'true' : 'false';
      }
    };

    const onLeave = () => {
      const el = node.current;
      if (!el) return;
      label.current = null;
      el.textContent = '';
      el.dataset.active = 'false';
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={node}
      aria-hidden="true"
      data-active="false"
      className="u-mono pointer-events-none fixed left-0 top-0 z-[95] translate-x-0 translate-y-0
                 pl-s3 pt-s1 text-[color:var(--arc-fg)] opacity-0 transition-opacity
                 duration-[var(--dur-micro)] data-[active=true]:opacity-100"
    />
  );
}
