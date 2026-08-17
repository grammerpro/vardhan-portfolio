'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AssistantWidget = dynamic(() => import('@/react/AssistantWidget'), { ssr: false });

/**
 * The assistant is mounted with showButton={false}, so nothing about it is
 * visible on load, but it still fetched resume.json and evaluated its bundle
 * during the initial page load and contributed to total blocking time.
 *
 * Holding it until the browser is idle keeps it off the critical path without
 * changing what it does.
 */
export default function DeferredAssistant() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // `'requestIdleCallback' in window` narrows window to never in the else
    // branch, so the capability is read off a local first.
    const ric = window.requestIdleCallback;
    const cancel = window.cancelIdleCallback;

    if (typeof ric === 'function') {
      const handle = ric(() => setReady(true), { timeout: 4000 });
      return () => cancel?.(handle);
    }

    const timer = window.setTimeout(() => setReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;

  return (
    <AssistantWidget
      theme="auto"
      kbUrl="/data/resume.json"
      avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=Vardhan&backgroundColor=b6e3f4"
      agentName="Vardhan"
      enableVoice={true}
      showButton={false}
    />
  );
}
