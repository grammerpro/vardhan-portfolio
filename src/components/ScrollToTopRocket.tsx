"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface ScrollToTopRocketProps {
  size?: number;
  offset?: { bottom: number; left: number };
}

import { scrollToTopConfig } from "@/config/scrollToTop";

export default function ScrollToTopRocket({
  size = scrollToTopConfig.size,
  offset = scrollToTopConfig.offset,
}: ScrollToTopRocketProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const { resolvedTheme } = useTheme();

  const prefersReducedMotion = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const containerWidth = size + 36;
  const containerHeight = size + 60;
  const rocketShellWidth = size;
  const rocketShellHeight = Math.round(size * 1.25);
  const flameHeight = Math.round(size * 0.5);
  const isDark = resolvedTheme === "dark";
  const rocketBackground = isDark
    ? "linear-gradient(180deg, rgba(14,165,233,0.35) 0%, rgba(12,74,110,0.7) 65%, rgba(17,24,39,0.85) 100%)"
    : "linear-gradient(180deg, rgba(125,211,252,0.55) 0%, rgba(59,130,246,0.7) 55%, rgba(255,255,255,0.9) 100%)";

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    if (prefersReducedMotion) {
      window.scrollTo({ top: 0 });
      return;
    }
    // Pre-launch shake for a snappy cue
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsLaunching(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Reset after launch animation
      setTimeout(() => setIsLaunching(false), 1000);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  if (!isVisible) return null;

  // Use explicit classnames so Tailwind doesn't purge them
  const ringClass = resolvedTheme === "dark" ? "focus:ring-fuchsia-400" : "focus:ring-sky-400";
  const animClass = prefersReducedMotion ? "" : (isLaunching ? "animate-launch" : (isShaking ? "animate-shake" : "animate-bob"));

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`fixed z-[9999] overflow-visible transition-transform duration-300 hover:-translate-y-1 hover:scale-110 focus:outline-none ${animClass}`}
      style={{
        bottom: `calc(${offset.bottom}px + env(safe-area-inset-bottom, 0px))`,
        left: `${offset.left}px`,
      }}
      aria-label="Scroll to top"
      tabIndex={0}
    >
      <div className="relative flex flex-col items-center justify-end">
        {/* Rocket SVG */}
        <div
          className="relative flex items-center justify-center drop-shadow-lg"
          style={{
            width: `${rocketShellWidth}px`,
            height: `${rocketShellHeight}px`,
          }}
        >
          <svg
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-auto text-sky-500 drop-shadow-[0_4px_8px_rgba(59,130,246,0.4)] dark:text-sky-400 dark:drop-shadow-[0_4px_10px_rgba(14,165,233,0.5)]"
            aria-hidden="true"
          >
            <path
              d="M32 2c-7.2 6.8-11.3 16.3-11.3 26.4 0 4.1.8 8.1 2.3 11.9l.5 1.1L32 62l8.5-20.6.5-1.1c1.5-3.8 2.3-7.8 2.3-11.9C43.3 18.3 39.2 8.8 32 2z"
              fill="currentColor"
            />
            <path
              d="M28 7.7c-3.6 4.6-5.5 10.7-5.3 17.3.1 2.7.7 5.4 1.8 7.9.2.5-.3.9-.7.6-2.2-1.6-3.6-4.9-3.6-8.5 0-5.4 2.5-10.6 6.3-15 .5-.6 1.5-.1 1.5.7z"
              fill="white"
              opacity="0.3"
            />
            <circle cx="32" cy="24" r="5.5" fill="white" />
            <circle cx="32" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
            <path
              d="M23 37.5l-11 9.7 10.9-1.6 1.7 11 6.6-12.3c-3.4-1.2-6.2-3.5-8.2-6.8z"
              fill="currentColor"
            />
            <path
              d="M41 37.5l11 9.7-10.9-1.6-1.7 11-6.6-12.3c3.4-1.2 6.2-3.5 8.2-6.8z"
              fill="currentColor"
            />
            <path d="M29 45.5L32 54l3-8.5-3-1.8-3 1.8z" fill="currentColor" opacity="0.65" />
          </svg>
          {isLaunching && !prefersReducedMotion && (
            <div
              className="absolute -bottom-1 left-1/2 w-3 -translate-x-1/2 rounded-b-full bg-gradient-to-t from-orange-500 via-amber-400 to-transparent opacity-95 animate-flame"
              style={{ height: `${flameHeight}px` }}
            />
          )}
        </div>
      </div>
    </button>
  );
}
