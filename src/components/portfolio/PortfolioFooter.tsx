import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { VMark } from './Navigation';

export default function PortfolioFooter() {
  return <footer className="portfolio-footer section-shell"><div className="footer-signature"><VMark /><p>Vardhan<span>.</span></p><span>Inside the system.</span></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Vardhan</p><div><Link href="/projects">All work</Link><Link href="/resume">Résumé</Link><a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={siteConfig.social.leetcode} target="_blank" rel="noopener noreferrer">LeetCode ↗</a></div><Link href="/#hero" className="back-top">Back to surface ↑</Link></div></footer>;
}
