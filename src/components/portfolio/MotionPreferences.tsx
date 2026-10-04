'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ExperienceMode = 'full' | 'balanced' | 'static';
type Preference = 'system' | ExperienceMode;
type Preferences = { mode: ExperienceMode; preference: Preference; setPreference: (value: Preference) => void };
const Context = createContext<Preferences>({ mode: 'static', preference: 'system', setPreference: () => {} });
const STORAGE_KEY = 'vardhan-experience';

export function MotionProvider({ children }: { children: ReactNode }) {
  const [preference, updatePreference] = useState<Preference>('system');
  const [systemMode, setSystemMode] = useState<ExperienceMode>('static');
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    const sync = () => setSystemMode(reduced.matches ? 'static' : coarse.matches ? 'balanced' : 'full');
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'full' || saved === 'balanced' || saved === 'static') updatePreference(saved);
    } catch { /* Session settings still work if storage is unavailable. */ }
    sync();
    reduced.addEventListener('change', sync);
    coarse.addEventListener('change', sync);
    return () => { reduced.removeEventListener('change', sync); coarse.removeEventListener('change', sync); };
  }, []);
  const mode = preference === 'system' ? systemMode : preference;
  useEffect(() => {
    document.documentElement.dataset.motion = mode;
    return () => { delete document.documentElement.dataset.motion; };
  }, [mode]);
  function setPreference(value: Preference) {
    updatePreference(value);
    try {
      if (value === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch { /* No storage requirement. */ }
  }
  return <Context.Provider value={{ mode, preference, setPreference }}>{children}</Context.Provider>;
}

export const useMotionPreferences = () => useContext(Context);

export function MotionToggle() {
  const { mode, setPreference } = useMotionPreferences();
  return <button type="button" className="motion-toggle" onClick={() => setPreference(mode === 'static' ? 'system' : 'static')} aria-pressed={mode === 'static'}>
    <span aria-hidden="true">{mode === 'static' ? 'Ⅱ' : '◌'}</span><span>{mode === 'static' ? 'Motion reduced' : 'Reduce motion'}</span>
  </button>;
}

export function ExperienceSettings() {
  const { mode, preference, setPreference } = useMotionPreferences();
  return <details className="experience-settings">
    <summary><span className={`mode-dot ${mode}`} aria-hidden="true" />Experience <span className="setting-value">{mode}</span><span aria-hidden="true">＋</span></summary>
    <div className="settings-panel">
      <label htmlFor="experience-mode">Choose your experience</label>
      <select id="experience-mode" value={preference} onChange={event => setPreference(event.target.value as Preference)}>
        <option value="system">Follow device settings</option><option value="full">Full — spatial journey</option><option value="balanced">Balanced — lighter graphics</option><option value="static">Static — motion reduced</option>
      </select>
      <p>Every mode includes the same projects, résumé and contact options.</p>
      <button type="button" className="text-link" onClick={() => setPreference('system')}>Reset to device settings</button>
    </div>
  </details>;
}
