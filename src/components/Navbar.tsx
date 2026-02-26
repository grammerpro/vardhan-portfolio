"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeProvider";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Projects", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "#contact" },
];

function NavLink({
  name,
  href,
  isActive,
  onClick
}: {
  name: string;
  href: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const linkRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      ref={linkRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-4 py-2 text-sm font-medium tracking-wide transition-colors"
    >
      {/* Background glow on hover */}
      <motion.span
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/15 dark:to-purple-400/15"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Text */}
      <span className={`relative z-10 ${isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-neutral-600 dark:text-neutral-300"
        }`}>
        {name}
      </span>

      {/* Active indicator dot */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="absolute -bottom-1 left-1/2 h-1 w-1 rounded-full bg-blue-500 dark:bg-blue-400"
            initial={{ opacity: 0, scale: 0, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, scale: 0, x: "-50%" }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-10 h-10" />;

  const icons = {
    auto: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    light: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    dark: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  };

  return (
    <motion.button
      onClick={toggle}
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-700/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 transition-colors hover:border-blue-300 dark:hover:border-blue-600"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
    >
      <motion.span
        key={theme}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
        transition={{ duration: 0.2 }}
      >
        {icons[theme]}
      </motion.span>
    </motion.button>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (window.location.pathname === '/resume') {
        setActiveSection('resume');
        return;
      }

      const sections = navLinks
        .filter(link => link.href.startsWith('#'))
        .map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    // If it's a page route (like /resume), navigate directly
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }

    // If we're not on the home page, navigate to home with the hash
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
      return;
    }

    // We're on the home page, scroll to section
    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Desktop Navbar - Floating pill */}
      <motion.div
        className={`hidden md:flex items-center gap-1 px-2 py-2 rounded-full border transition-all duration-300 ${isScrolled
            ? "bg-white/80 dark:bg-neutral-900/80 border-neutral-200/60 dark:border-neutral-700/60 shadow-lg shadow-neutral-900/5 dark:shadow-black/20"
            : "bg-white/40 dark:bg-neutral-900/40 border-neutral-200/30 dark:border-neutral-700/30"
          } backdrop-blur-xl`}
        layout
      >
        {/* Logo */}
        <motion.button
          onClick={() => scrollToSection("#home")}
          className="px-4 py-2 text-base font-semibold tracking-[0.2em] text-neutral-900 dark:text-white transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          V
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Nav Links */}
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            name={link.name}
            href={link.href}
            isActive={activeSection === (link.href.startsWith('/') ? link.href.substring(1) : link.href.substring(1))}
            onClick={() => scrollToSection(link.href)}
          />
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Theme Toggle */}
        <ThemeToggle />
      </motion.div>

      {/* Mobile Navbar */}
      <div className="md:hidden">
        <motion.div
          className={`flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-300 ${isScrolled
              ? "bg-white/80 dark:bg-neutral-900/80 border-neutral-200/60 dark:border-neutral-700/60 shadow-lg"
              : "bg-white/40 dark:bg-neutral-900/40 border-neutral-200/30 dark:border-neutral-700/30"
            } backdrop-blur-xl`}
        >
          <button
            onClick={() => scrollToSection("#home")}
            className="text-base font-semibold tracking-[0.2em] text-neutral-900 dark:text-white"
          >
            V
          </button>

          <div className="flex-1" />

          <ThemeToggle />

          <motion.button
            className="flex items-center justify-center w-10 h-10 rounded-full border border-neutral-200/50 dark:border-neutral-700/50 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm text-neutral-600 dark:text-neutral-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            <motion.svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </motion.button>
        </motion.div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-xl"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {navLinks.map((link, index) => (
                <motion.button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className={`w-full px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors ${activeSection === (link.href.startsWith('/') ? link.href.substring(1) : link.href.substring(1))
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {link.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
