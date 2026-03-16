'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionStyle,
} from 'framer-motion';

// ─── Animated text that reveals letter by letter ────────────────────────────
function AnimatedText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.4,
            delay: delay + index * 0.03,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="inline-block"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Magnetic button component ──────────────────────────────────────────────
function MagneticButton({
  children,
  href,
  variant = 'primary',
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setPosition({ x: x * 0.15, y: y * 0.15 });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  const baseStyles =
    'relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-4 text-sm font-medium tracking-wide transition-all duration-300';

  const variants = {
    primary:
      'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:shadow-xl hover:shadow-neutral-900/20 dark:hover:shadow-white/20',
    secondary:
      'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900',
  };

  return (
    <motion.a
      ref={buttonRef}
      href={href}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Shimmer effect */}
      <motion.span
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.a>
  );
}

// ─── Floating ambient shapes ────────────────────────────────────────────────
function AmbientShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-cyan-500/15 to-blue-500/10 blur-3xl"
        animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-500/10 to-pink-500/5 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

// ─── Interactive grid with magnetic / ripple effect ─────────────────────────
function InteractiveGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 60;
    const dotRadius = 1.5;
    const influenceRadius = 120;
    const maxDisplacement = 15;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;
      const dark = isDarkMode();
      const dotColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
      const activeColor = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';

      for (let x = 0; x <= canvas.width + gridSize; x += gridSize) {
        for (let y = 0; y <= canvas.height + gridSize; y += gridSize) {
          let drawX = x,
            drawY = y,
            currentRadius = dotRadius,
            currentColor = dotColor;
          const dx = mouse.x - x,
            dy = mouse.y - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < influenceRadius && distance > 0) {
            const force = (1 - distance / influenceRadius) * maxDisplacement;
            const angle = Math.atan2(dy, dx);
            drawX = x - Math.cos(angle) * force;
            drawY = y - Math.sin(angle) * force;
            currentRadius = dotRadius * (1 + (1 - distance / influenceRadius) * 0.8);
            currentColor = activeColor;
          }

          ctx.beginPath();
          ctx.arc(drawX, drawY, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = currentColor;
          ctx.fill();
        }
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

// ─── Noise texture overlay ──────────────────────────────────────────────────
function NoiseTexture() {
  return (
    <div
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO SECTION — Apple-style scroll effect
// ═══════════════════════════════════════════════════════════════════════════
export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // ── Scroll progress: 0 → 1 across the 300vh wrapper ──────────────────
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end end'],
  });

  // ── Headline transforms ───────────────────────────────────────────────
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.5, 0]);

  // ── Badge & CTA fade (match headline) ─────────────────────────────────
  const badgeCtaOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // ── Background zoom-out reveal ────────────────────────────────────────
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0]);

  // ── Subtitle / tagline fade-in from below ─────────────────────────────
  const subtitleY = useTransform(scrollYProgress, [0.2, 0.5], [40, 0]);
  const subtitleOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

  // ── Frosted overlay at 60 % ───────────────────────────────────────────
  const overlayOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 0.4]);

  // ── Scroll indicator disappears quickly ───────────────────────────────
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // ── Reduced-motion overrides ──────────────────────────────────────────
  const safeHeadlineScale = prefersReducedMotion ? 1 : headlineScale;
  const safeHeadlineOpacity = prefersReducedMotion ? 1 : headlineOpacity;
  const safeBadgeCtaOpacity = prefersReducedMotion ? 1 : badgeCtaOpacity;
  const safeBgScale = prefersReducedMotion ? 1 : bgScale;
  const safeSubtitleY = prefersReducedMotion ? 0 : subtitleY;
  const safeSubtitleOpacity = prefersReducedMotion ? 1 : subtitleOpacity;
  const safeOverlayOpacity = prefersReducedMotion ? 0 : overlayOpacity;
  const safeScrollIndicatorOpacity = prefersReducedMotion ? 1 : scrollIndicatorOpacity;

  return (
    // ── 300vh scroll wrapper ──────────────────────────────────────────────
    <div ref={scrollRef} style={{ height: '300vh' }} className="relative">
      {/* ── Sticky inner hero ──────────────────────────────────────────── */}
      <section
        id="home"
        ref={containerRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
      >
        {/* Background layer with zoom-out effect */}
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ scale: safeBgScale } as MotionStyle}
        >
          <InteractiveGrid />
          <NoiseTexture />
          <AmbientShapes />
        </motion.div>

        {/* Frosted overlay — fades in at ~60 % */}
        <motion.div
          className="absolute inset-0 backdrop-blur-md bg-white/30 dark:bg-neutral-950/40 pointer-events-none"
          style={{ opacity: safeOverlayOpacity } as MotionStyle}
        />

        {/* ── Main content ──────────────────────────────────────────── */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl text-center">
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ opacity: safeBadgeCtaOpacity } as MotionStyle}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-4 py-2 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 tracking-wide">
                Available for new projects
              </span>
            </motion.div>

            {/* ── Headline — shrinks + fades on scroll ──────────────── */}
            <motion.h1
              className="mb-6 text-6xl font-bold tracking-tight md:text-8xl lg:text-9xl will-change-transform"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={
                {
                  scale: safeHeadlineScale,
                  opacity: safeHeadlineOpacity,
                } as MotionStyle
              }
            >
              <AnimatedText text="VARDHAN" delay={0.3} />
            </motion.h1>

            {/* ── Role line — fades with headline ───────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              style={{ opacity: safeHeadlineOpacity } as MotionStyle}
              className="mb-6 flex items-center justify-center gap-3 text-sm font-medium tracking-widest text-neutral-500 dark:text-neutral-400 uppercase"
            >
              <span>Creative Developer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span>Designer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span>Engineer</span>
            </motion.div>

            {/* ── Tagline — fades IN from below after 20-50 % ──────── */}
            <motion.p
              className="mx-auto mb-12 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400 md:text-xl leading-relaxed will-change-transform"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              style={
                {
                  opacity: safeSubtitleOpacity,
                  y: safeSubtitleY,
                } as MotionStyle
              }
            >
              Crafting digital experiences at the intersection of design and
              technology. Building interfaces that feel alive.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              style={{ opacity: safeBadgeCtaOpacity } as MotionStyle}
            >
              <MagneticButton href="#projects" variant="primary">
                View My Work
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton href="#contact" variant="secondary">
                Get in Touch
              </MagneticButton>
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator — vanishes fast ──────────────────────── */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          style={{ opacity: safeScrollIndicatorOpacity } as MotionStyle}
        >
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 dark:text-neutral-600">
              Scroll
            </span>
            <svg
              className="w-5 h-5 text-neutral-400 dark:text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
