// src/components/KeyboardHero.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const buttons = [
  { label: "HOME", top: "7%", left: "7.5%" },
  { label: "PROJECTS", top: "7%", left: "30.5%" },
  { label: "CV", top: "7%", left: "54.5%" },
  { label: "GITHUB", top: "38%", left: "7.5%" },
  { label: "CONTACT", top: "38%", left: "30.5%" },
  { label: "HIRE ME", top: "69%", left: "7.5%" },
  { label: "HOME", top: "69%", left: "30.5%" }
];

export default function KeyboardHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    let angle = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(0,255,0,0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 10) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // Radar line
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      const x = w / 2 + Math.cos(angle) * (w / 2);
      const y = h / 2 + Math.sin(angle) * (h / 2);
      ctx.lineTo(x, y);
      ctx.stroke();

      angle += 0.02;
      requestAnimationFrame(loop);
    };

    loop();
  }, []);

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-10">
        <div className="relative w-[1000px] h-[340px] md:h-[360px]">
          <Image
            src="/images/keyboard-light-ui.png"
            alt="Keyboard UI"
            fill
            className="object-contain"
            priority
          />

          {/* Overlay Buttons */}
          {buttons.map((btn, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.93 }}
              className="absolute text-white font-bold text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 rounded-md shadow-md border border-black bg-black/70"
              style={{ top: btn.top, left: btn.left }}
            >
              {btn.label}
            </motion.button>
          ))}

          {/* Radar Circle */}
          <div className="absolute right-[3.8%] top-[18%] w-40 h-40 md:w-64 md:h-64 rounded-full border-2 border-green-500 bg-black overflow-hidden shadow-xl">
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-green-400 text-xl md:text-3xl font-bold">
              VA
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="mt-8">
          <div className="text-green-600 border border-green-800 px-4 py-2 rounded-md text-sm font-mono bg-white">
            Available For Freelance
          </div>
        </div>
      </div>
    </div>
  );
}
