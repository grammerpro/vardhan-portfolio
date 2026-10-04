'use client';

import { useEffect, useRef, useState } from 'react';
import ExperienceBoundary from '@/components/experience/ExperienceBoundary';
import { ExperienceSettings, useMotionPreferences } from './MotionPreferences';
import PreservedHashLinks from './PreservedHashLinks';

const chapters = [{ id: 'hero', name: 'Surface' }, { id: 'unfold', name: 'Unfold' }, { id: 'work', name: 'Work' }, { id: 'capability', name: 'Systems' }, { id: 'about', name: 'Person' }, { id: 'contact', name: 'Contact' }];

export default function Journey() {
  const { mode } = useMotionPreferences();
  const [chapter, setChapter] = useState('hero');
  const backdrop = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    let sections: { id: string; top: number }[] = [];
    const measure = () => { sections = chapters.map(item => ({ id: item.id, top: (document.getElementById(item.id)?.getBoundingClientRect().top ?? 0) + scrollY })); update(); };
    const update = () => {
      frame = 0;
      const y = scrollY;
      const current = [...sections].reverse().find(section => section.top <= y + innerHeight * .38)?.id ?? 'hero';
      setChapter(previous => previous === current ? previous : current);
      const heroHeight = document.getElementById('hero')?.offsetHeight ?? innerHeight;
      const transition = Math.max(0, Math.min(1, (y - heroHeight * .36) / (heroHeight * .55)));
      backdrop.current?.style.setProperty('--darkness', String(mode === 'static' ? (y > heroHeight * .6 ? 1 : 0) : transition));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('pageshow', measure);
    let alive = true;
    document.fonts.ready.then(() => { if (alive) measure(); });
    measure();
    return () => { alive = false; observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); window.removeEventListener('pageshow', measure); };
  }, [mode]);
  return <>
    <PreservedHashLinks />
    <div className="journey-backdrop" ref={backdrop} aria-hidden="true" />
    <ExperienceBoundary mode={mode} />
    <nav className="chapter-rail" aria-label="Chapters">{chapters.map((item, i) => <a key={item.id} href={`#${item.id}`} aria-label={`${String(i + 1).padStart(2, '0')} ${item.name}`} aria-current={chapter === item.id ? 'location' : undefined}><span className="chapter-label">{item.name}</span><span className="chapter-tick" /><span className="chapter-number">{String(i + 1).padStart(2, '0')}</span></a>)}</nav>
    <ExperienceSettings />
  </>;
}
