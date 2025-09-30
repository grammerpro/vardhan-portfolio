"use client";

import React, { useMemo } from "react";

type Shape = {
  type: "circle" | "rect" | "triangle" | "hex";
  x: number; // 0..100 vw
  y: number; // 0..100 vh
  size: number; // px at 1440 base
  rotate?: number; // deg
  opacity?: number; // 0..1
};

function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = ((Math.PI * 2) / 6) * i - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }) as [number, number][];
  return `M ${pts.map((p) => p.join(",")).join(" L ")} Z`;
}

export default function BackgroundShapes({ count = 14 }: { count?: number }) {
  // Deterministic-ish palette
  const strokes = [
    "#0ea5e9", // sky-500
    "#38bdf8", // sky-400
    "#a5f3fc", // sky-200
    "#60a5fa", // blue-400
    "#93c5fd", // blue-300
  ];

  const shapes = useMemo<Shape[]>(() => {
    const rng = (seed: number) => () => {
      // xorshift32
      seed ^= seed << 13;
      seed ^= seed >> 17;
      seed ^= seed << 5;
      return ((seed >>> 0) % 1000) / 1000;
    };
    const r = rng(123456789);
    const types: Shape["type"][] = ["circle", "rect", "triangle", "hex"];
    const list: Shape[] = [];
    for (let i = 0; i < count; i++) {
      const t = types[Math.floor(r() * types.length)];
      list.push({
        type: t,
        x: 5 + r() * 90,
        y: 8 + r() * 84,
        size: 50 + r() * 140,
        rotate: r() * 360,
        opacity: 0.06 + r() * 0.08,
      });
    }
    return list;
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="bg-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>
        {shapes.map((s, idx) => {
          const stroke = strokes[idx % strokes.length];
          const strokeOpacity = s.opacity ?? 0.08;
          const base = 100 / 1440; // scale px -> viewBox units assuming 1440px width
          const size = s.size * base; // vw units of the viewBox
          const groupProps = {
            transform: `translate(${s.x} ${s.y}) rotate(${s.rotate})`,
            style: { filter: "url(#bg-blur)" },
          } as const;
          return (
            <g key={idx} {...groupProps}>
              {s.type === "circle" && (
                <circle r={size / 2} cx={0} cy={0} fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={0.2} />
              )}
              {s.type === "rect" && (
                <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={size * 0.18} ry={size * 0.18} fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={0.2} />
              )}
              {s.type === "triangle" && (
                <polygon
                  points={`${0},${-size / 2} ${size / 2},${size / 2} ${-size / 2},${size / 2}`}
                  fill="none"
                  stroke={stroke}
                  strokeOpacity={strokeOpacity}
                  strokeWidth={0.2}
                />
              )}
              {s.type === "hex" && (
                <path d={hexPath(0, 0, size / 2)} fill="none" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={0.2} />
              )}
            </g>
          );
        })}
      </svg>
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          svg g { animation: drift 24s ease-in-out infinite; }
          svg g:nth-child(3n) { animation-duration: 28s; animation-delay: -6s; }
          svg g:nth-child(4n) { animation-duration: 32s; animation-delay: -10s; }
        }
        @keyframes drift {
          0%, 100% { transform: translate(var(--x, 0)) rotate(var(--r, 0)); }
          50% { transform: translate(calc(var(--x, 0) + 0.6px), calc(var(--y, 0) + 0.6px)) rotate(calc(var(--r, 0) + 6deg)); }
        }
      `}</style>
    </div>
  );
}
