import Link from 'next/link';
import { MotionToggle } from './MotionPreferences';

export function VMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M1 2h9l10 31h-8L1 2Z" fill="currentColor" /><path d="M23 1h8L20 29l-4-11L23 1Z" fill="currentColor" /><path d="m13 3 5 13" stroke="#A36120" strokeWidth="1.5" /></svg>;
}

export default function Navigation() {
  return <header className="site-header">
    <Link className="wordmark" href="/" aria-label="Vardhan — home"><VMark /><span>Vardhan<span className="wordmark-period">.</span></span></Link>
    <nav aria-label="Main navigation" className="main-nav"><Link href="/#work">Work</Link><Link href="/#capability">Expertise</Link><Link href="/#about">About</Link><Link href="/resume">Résumé <span aria-hidden="true">↗</span></Link><Link href="/#contact" className="nav-contact">Let’s talk <span aria-hidden="true">↗</span></Link></nav>
    <MotionToggle />
  </header>;
}
