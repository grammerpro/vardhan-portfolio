'use client';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-neutral-950 py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-2">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Let&apos;s build something<br />extraordinary together.</h2>
            <p className="mb-8 max-w-md text-neutral-400">
              I&apos;m currently available for freelance projects and open to full-time opportunities.
            </p>
            <a
              href="mailto:hello@vardhan.dev"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200"
            >
              Get in touch
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Sitemap</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-neutral-300 hover:text-white">Home</a></li>
              <li><a href="#projects" className="text-neutral-300 hover:text-white">Projects</a></li>
              <li><a href="#about" className="text-neutral-300 hover:text-white">About</a></li>
              <li><a href="/resume" className="text-neutral-300 hover:text-white">Resume</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Socials</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-300 hover:text-white">Twitter / X</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">GitHub</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">LinkedIn</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between border-t border-neutral-800 pt-8 md:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; {currentYear} Vardhan. All rights reserved.
          </p>
          <p className="mt-4 text-sm text-neutral-500 md:mt-0">
            Designed & Built with Next.js & Tailwind
          </p>
        </div>
      </div>
    </footer>
  );
}
