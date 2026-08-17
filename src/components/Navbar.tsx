"use client";

import { useEffect, useState } from "react";
import { useLenis } from "./providers/SmoothScrollProvider";

/**
 * Rebuilt in Phase 3. The previous version was a floating glassmorphism pill
 * with backdrop-blur-xl, drop shadows, and a blue accent, all of which brief
 * section 7 bans outright. The theme toggle went with it: the light-to-dark
 * transition is scroll-driven now (section 2's tonal arc), so a manual toggle
 * fights it.
 *
 * Colour comes from --nav-fg, which the tonal arc rewrites as the background
 * moves from --paper to --void. It defaults to --ink.
 */

/** Clearance for the fixed navbar. Matches --nav-offset in globals.css. */
const NAV_OFFSET = 96;

const navLinks = [
  { name: "Work", href: "#work" },
  { name: "Capability", href: "#capability" },
  { name: "About", href: "#about" },
  { name: "Resume", href: "/resume" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();

  // Close the mobile menu on Escape, so keyboard users are never trapped.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (href: string) => {
    if (href.startsWith("/")) {
      window.location.href = href;
      return;
    }

    if (window.location.pathname !== "/") {
      window.location.href = "/" + href;
      return;
    }

    const element = document.getElementById(href.substring(1));
    if (element) {
      if (lenis) {
        // Native smooth scrolling fights Lenis's RAF loop.
        lenis.scrollTo(element, { offset: -NAV_OFFSET });
      } else {
        // Reduced motion. Native scrolling honours scroll-padding-top.
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <nav
      // White text under `difference` inverts whatever is actually behind it:
      // over --paper it resolves to near --ink, over --void to near --bone.
      // Driving it from --nav-fg instead left the bar dark-on-dark at section
      // boundaries, because the colour switched a moment before the
      // background under the fixed bar did. An earlier attempt paired
      // difference with --nav-fg rather than white, which washed out.
      className="u-mono fixed inset-x-0 top-0 z-50 flex items-center justify-between
                 px-[var(--page-margin)] py-s3 text-white mix-blend-difference"
    >
      <button
        type="button"
        onClick={() => go("#hero")}
        className="transition-opacity duration-[var(--dur-micro)] hover:opacity-60"
      >
        Vardhan
      </button>

      {/* Desktop */}
      <div className="hidden gap-s3 md:flex">
        {navLinks.map((link) => (
          <button
            key={link.name}
            type="button"
            onClick={() => go(link.href)}
            className="transition-opacity duration-[var(--dur-micro)] hover:opacity-60"
          >
            {link.name}
          </button>
        ))}
      </div>

      {/* Mobile */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        className="md:hidden"
      >
        {menuOpen ? "Close" : "Menu"}
      </button>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex flex-col gap-s3 bg-void
                     px-[var(--page-margin)] py-s4 text-bone md:hidden"
        >
          {navLinks.map((link) => (
            <button
              key={link.name}
              type="button"
              onClick={() => go(link.href)}
              className="text-left transition-opacity duration-[var(--dur-micro)] hover:opacity-60"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
