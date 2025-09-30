"use client";

import { useEffect, useRef, useState } from "react";

export default function InteractiveCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let animationId: number;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);
    };

    const animate = () => {
      // Smooth following with easing
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;

      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      animationId = requestAnimationFrame(animate);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Hide cursor after inactivity
    let hideTimeout: NodeJS.Timeout;
    const resetHideTimeout = () => {
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setIsVisible(false), 3000);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mousemove", resetHideTimeout);
    animate();
    resetHideTimeout();

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousemove", resetHideTimeout);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      clearTimeout(hideTimeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Don't render anything if user prefers reduced motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div
      ref={dotRef}
      aria-hidden
      className={`pointer-events-none fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ${
        isHovering
          ? 'scale-150 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]'
          : 'scale-100 bg-blue-500/60 shadow-[0_0_10px_rgba(59,130,246,0.4)]'
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transition: 'opacity 0.3s ease' }}
    />
  );
}


