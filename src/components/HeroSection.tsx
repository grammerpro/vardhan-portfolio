'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const FloatingBackdrop = dynamic(() => import('./FloatingBackdrop'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-sky-500/10" />
  ),
});

function HorizonGlow() {
  return (
    <>
      <motion.div
        className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#ffe3c6]/70 blur-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.32], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-[#d8b4fe]/40 blur-[160px]"
        animate={{ opacity: [0.25, 0.45, 0.3], x: [0, 20, -20] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[22rem] w-[22rem] translate-x-1/3 rounded-full bg-[#7dd3fc]/40 blur-[160px]"
        animate={{ opacity: [0.25, 0.4, 0.28], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
    </>
  );
}

export default function HeroSection() {
  const highlights = [
    'Immersive WebGL storytelling',
    'AI-assisted design workflows',
    'Polished product launches',
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-dvh supports-[height:100dvh]:min-h-dvh flex-col justify-center overflow-hidden bg-gradient-to-b from-[#fdf3dc] via-[#f8f4ff] to-[#eef1ff] text-neutral-900 dark:from-[#140b24] dark:via-[#1b1530] dark:to-[#0f1628] dark:text-white"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/60 dark:via-white/5 dark:to-white/5" />
        <HorizonGlow />
        <div className="absolute inset-x-0 bottom-0 h-[60vh] min-h-[320px]">
          <FloatingBackdrop />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fdf3dc] via-transparent to-transparent dark:from-[#140b24]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-24 pb-32 text-center sm:pt-28 lg:pt-32">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-purple-500 shadow-[0_18px_46px_-24px_rgba(147,51,234,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-purple-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          Vardhan  Creative Developer
        </motion.div>

        <motion.h1
          className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] dark:text-white"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          Designing immersive web moments with purpose
        </motion.h1>

        <motion.p
          className="mt-6 max-w-3xl text-base text-neutral-600 sm:text-lg md:text-xl dark:text-neutral-300"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          Hi, I&apos;m Vardhan. I blend realtime 3D, thoughtful UX, and dependable engineering to shape personal, high-impact digital experiences. I help teams launch ideas that feel tactile, human, and unforgettable.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-sky-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_25px_70px_-25px_rgba(147,51,234,0.75)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-fuchsia-400"
            aria-label="Navigate to contact section"
          >
            Let&apos;s collaborate
          </motion.a>
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-full border border-purple-200/70 bg-white/60 px-10 py-4 text-lg font-semibold text-purple-600 backdrop-blur-xl transition-all duration-300 hover:border-purple-300 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:border-white/20 dark:bg-white/10 dark:text-purple-200 dark:hover:border-purple-200/40 dark:focus:ring-fuchsia-400"
            aria-label="Navigate to projects section"
          >
            See my work
          </motion.a>
        </motion.div>

        <motion.ul
          className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: 'easeOut' }}
        >
          {highlights.map((item) => (
            <li
              key={item}
              className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-neutral-600 shadow-[0_30px_80px_-45px_rgba(147,51,234,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
            >
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
