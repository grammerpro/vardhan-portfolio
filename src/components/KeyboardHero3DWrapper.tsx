'use client';

import dynamic from 'next/dynamic';

// Dynamically import the 3D component with SSR disabled
const KeyboardHero3D = dynamic(() => import('./KeyboardHero3D'), { ssr: false });

export default function KeyboardHero3DWrapper() {
  return <KeyboardHero3D />;
}
