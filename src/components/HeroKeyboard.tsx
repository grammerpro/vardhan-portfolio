// src/components/KeyboardHero.tsx
"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const buttons = [
  { label: "HOME", top: "12%", left: "10%" },
  { label: "PROJECTS", top: "12%", left: "33%" },
  { label: "CV", top: "12%", left: "56.5%" },
  { label: "GITHUB", top: "42%", left: "10%" },
  { label: "CONTACT", top: "42%", left: "33%" },
  { label: "HIRE ME", top: "72%", left: "10%" },
  { label: "HOME", top: "72%", left: "33%" },
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
    <div className="bg-white">
      {/* Hero Container */}
      <div className="w-full flex justify-center items-center py-16 bg-gradient-to-b from-white via-slate-100 to-gray-200">
        <div className="relative w-[1000px] h-[350px]">
          {/* Background Image */}
          <Image
            src="/images/keyboard-light-ui.png"
            alt="Keyboard Background"
            fill
            className="object-contain"
            priority
          />

          {/* Buttons Overlay */}
          {buttons.map((btn, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.95 }}
              className="absolute text-white font-semibold text-sm px-3 py-1 rounded shadow bg-black/80 hover:bg-black"
              style={{ top: btn.top, left: btn.left }}
            >
              {btn.label}
            </motion.button>
          ))}

          {/* Radar */}
          <div className="absolute right-[4.3%] top-[17%] w-32 h-32 md:w-52 md:h-52 rounded-full border-2 border-green-500 bg-black overflow-hidden shadow-md">
            <canvas ref={canvasRef} width={256} height={256} className="w-full h-full" />
            <div className="absolute inset-0 flex items-center justify-center text-green-400 text-xl md:text-3xl font-bold">
              VA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
