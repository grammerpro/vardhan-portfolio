'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExperienceMode } from '@/lib/scene-path';
import SignaturePoster from './SignaturePoster';
import styles from './experience.module.css';

export function ExperienceBoundary({ mode }: { mode: ExperienceMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const retryGraphics = () => {
    // Clear the failed UI in the same update that mounts the replacement canvas.
    setFailed(false);
    setReady(false);
    setAttempt((value) => value + 1);
  };

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const update = () => {
      const hero = document.getElementById('hero');
      const contact = document.getElementById('contact');
      const heroBottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight - window.scrollY;
      const atContact = contact ? contact.getBoundingClientRect().top < window.innerHeight * .5 : false;
      layer.dataset.chapter = atContact ? 'contact' : heroBottom > 0 ? 'hero' : 'interior';
      layer.style.setProperty('--poster-opacity', atContact ? '.65' : String(Math.min(1, Math.max(0, heroBottom / window.innerHeight))));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    let dispose: (() => void) | undefined;
    setReady(false);
    setFailed(false);
    if (mode === 'static') return;
    const start = async () => {
      try {
        const { createExperienceRenderer } = await import('./ExperienceRenderer');
        if (canceled || !canvasRef.current) return;
        dispose = createExperienceRenderer({
          canvas: canvasRef.current,
          mode,
          onReady: () => { if (!canceled) setReady(true); },
          onFailure: () => {
            if (canceled) return;
            setReady(false);
            setFailed(true);
            dispose?.();
          },
        });
      } catch {
        if (!canceled) setFailed(true);
      }
    };
    // Semantic HTML and the poster paint before the optional renderer loads.
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (window.requestIdleCallback) idle = window.requestIdleCallback(() => void start(), { timeout: 1000 });
    else timer = setTimeout(() => void start(), 100);
    return () => {
      canceled = true;
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) clearTimeout(timer);
      dispose?.();
    };
  }, [mode, attempt]);

  return (
    <>
      <div ref={layerRef} className={styles.layer} data-ready={ready ? 'true' : 'false'} data-mode={mode} aria-hidden="true">
        <div className={styles.poster}>
          <picture>
            <source media="(max-width: 1000px)" srcSet="/signature/hero-mobile.webp" />
            {/* This is a small, transparent, renderer-matched local plate. */}
            <img src="/signature/hero-desktop.webp" alt="" width="1440" height="900" decoding="async" />
          </picture>
        </div>
        {mode !== 'static' && <canvas key={`${mode}-${attempt}`} ref={canvasRef} className={styles.canvas} />}
      </div>
      {failed && mode !== 'static' && (
        <div className={styles.recovery} role="status">
          <span>Showing the still composition.</span>
          <button type="button" onClick={retryGraphics}>Retry graphics <span aria-hidden="true">↗</span></button>
        </div>
      )}
    </>
  );
}

export function AssemblyInspector() {
  const [exploded, setExploded] = useState(false);
  return (
    <div className={styles.inspector}>
      <div className={styles.inspectorVisual}><SignaturePoster exploded={exploded} /></div>
      <div className={styles.inspectorCopy}>
        <div className={styles.inspectorHeader}><span>Assembly study</span><span aria-hidden="true">V / 01</span></div>
        <button type="button" aria-pressed={exploded} onClick={() => setExploded((value) => !value)}>
          {exploded ? 'Reassemble' : 'Separate the parts'} <span aria-hidden="true">{exploded ? '−' : '+'}</span>
        </button>
        <p aria-live="polite">{exploded ? 'Two aluminum wings separate from the dark inner spine. A glass insert and amber signal line trace the opening.' : 'Asymmetric aluminum wings, a dark spine, glass insert, and an amber signal line form one instrument.'}</p>
        <p className={styles.inspectorNote}>Original procedural sculpture. An illustration of the portfolio’s construction.</p>
      </div>
    </div>
  );
}

export default ExperienceBoundary;
