"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import Magnetic from "./Magnetic";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Projects", href: "#projects" },
  { name: "About", href: "#about" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're on the resume page
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
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith('/')) {
      // Navigate to page route
      window.location.href = href;
      return;
    }

    const sectionId = href.substring(1);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
  <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/70 bg-white/90 dark:bg-neutral-900/80 border-b border-gray-200/50 dark:border-neutral-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <button
          onClick={() => scrollToSection("#home")}
          className="text-2xl font-bold tracking-wide text-blue-600 hover:text-blue-700 transition-colors"
        >
          VARDHAN
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Magnetic key={link.name} strength={6}>
              <button
                onClick={() => scrollToSection(link.href)}
                className={`inline-block font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                  activeSection === (link.href.startsWith('/') ? link.href.substring(1) : link.href.substring(1)) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {link.name}
              </button>
            </Magnetic>
          ))}
          {mounted && (
            <button
              onClick={toggle}
              className="rounded-full border px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 border-gray-300 dark:border-neutral-700 transition-colors flex items-center gap-1"
              aria-label={`Current theme: ${theme}. Click to cycle themes.`}
            >
              {theme === 'auto' && <span>🅰️</span>}
              {theme === 'light' && <span>☀️</span>}
              {theme === 'dark' && <span>🌙</span>}
              <span className="sr-only">{theme}</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
  <div className="md:hidden bg-white/95 dark:bg-neutral-900/90 backdrop-blur px-4 pb-4 space-y-3 border-b border-gray-200/50 dark:border-neutral-800">
          {navLinks.map((link) => (
            <Magnetic key={link.name} strength={4}>
              <button
                onClick={() => scrollToSection(link.href)}
    className="block text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 text-base font-medium text-left w-full"
              >
                {link.name}
              </button>
            </Magnetic>
          ))}
        </div>
      )}
    </nav>
  );
}
