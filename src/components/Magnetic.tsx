"use client";

import { ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
  strength?: number; // pixels
};

export default function Magnetic({ children, strength = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animationId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      targetX = Math.max(Math.min(x, strength), -strength);
      targetY = Math.max(Math.min(y, strength), -strength);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      // Smooth interpolation for less jerky movement
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      animationId = requestAnimationFrame(animate);
    };

    // Only add listeners when mouse enters the element
    const onEnter = () => {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseleave", onLeave);
      animate();
    };

    const onExit = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      targetX = 0;
      targetY = 0;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onExit);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onExit);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [strength]);

  return <div ref={ref} className="inline-block will-change-transform">{children}</div>;
}


