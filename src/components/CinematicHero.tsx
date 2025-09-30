"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, PerformanceMonitor, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion } from "framer-motion";
import Magnetic from "@/components/Magnetic";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

type HologramTileProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  title: string;
  hue: number; // 0-360
};

function useMouseParallax(intensity = 0.02) {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / size.width) * 2 - 1;
      const y = (e.clientY / size.height) * 2 - 1;
      if (groupRef.current) {
        gsap.to(groupRef.current.rotation, {
          x: y * intensity,
          y: -x * intensity,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [intensity, size.width, size.height]);
  return groupRef;
}

function ParticlesField({ count = 1200 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = THREE.MathUtils.randFloat(2.5, 6);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      arr[i * 3 + 0] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, [count]);

  const velocities = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = THREE.MathUtils.randFloat(-0.003, 0.003);
      arr[i * 3 + 1] = THREE.MathUtils.randFloat(-0.003, 0.003);
      arr[i * 3 + 2] = THREE.MathUtils.randFloat(-0.003, 0.003);
    }
    return arr;
  }, [count]);

  const tmpVec = new THREE.Vector3();
  const mouse = useRef(new THREE.Vector2(0, 0));
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    const pts = points.current as THREE.Points | null;
    if (!pts) return;
    const geom = pts.geometry as THREE.BufferGeometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < posAttr.count; i++) {
      const ix = i * 3;
      tmpVec.set(posAttr.array[ix + 0], posAttr.array[ix + 1], posAttr.array[ix + 2]);
      // gentle drift
      tmpVec.x += velocities[ix + 0];
      tmpVec.y += velocities[ix + 1];
      tmpVec.z += velocities[ix + 2];
      // mouse attraction
      const target = new THREE.Vector3(mouse.current.x * 1.2, mouse.current.y * 1.2, 0);
      tmpVec.add(target.sub(tmpVec).multiplyScalar(0.0007));
      // bounds
      const r = 7.5;
      if (tmpVec.length() > r) tmpVec.setLength(r);
      posAttr.array[ix + 0] = tmpVec.x;
      posAttr.array[ix + 1] = tmpVec.y;
      posAttr.array[ix + 2] = tmpVec.z;
    }
    posAttr.needsUpdate = true;
    pts.rotation.y += 0.0008;
  });

  return (
    <points ref={points} frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} sizeAttenuation color={new THREE.Color("#66e1ff")} transparent opacity={0.65} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function AuroraBackground({ isLight }: { isLight: boolean }) {
  const material = useMemo(() => {
    const uniforms: {
      uTime: { value: number };
      uA: { value: [number, number, number] };
      uB: { value: [number, number, number] };
      uC: { value: [number, number, number] };
    } = {
      uTime: { value: 0 },
      uA: { value: new THREE.Color(isLight ? "#bde3ff" : "#003b5f").toArray() as [number, number, number] },
      uB: { value: new THREE.Color(isLight ? "#e6f3ff" : "#05122b").toArray() as [number, number, number] },
      uC: { value: new THREE.Color(isLight ? "#b7ffd8" : "#00ffee").toArray() as [number, number, number] },
    };

    const vertex = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragment = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uA; // accent
      uniform vec3 uB; // base
      uniform vec3 uC; // tint

      // simple hash noise
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = vUv;
        // base vertical gradient
        float g = smoothstep(0.0, 1.0, uv.y);
        vec3 col = mix(uB, vec3(1.0), 0.05);

        // aurora bands
        vec2 p1 = uv * vec2(3.0, 2.0);
        p1.x += uTime * 0.05;
        float a1 = fbm(p1 + vec2(0.0, uTime * 0.03));

        vec2 p2 = uv * vec2(2.0, 3.0);
        p2.x -= uTime * 0.04;
        float a2 = fbm(p2 + vec2(5.0, -uTime * 0.02));

        float bands = smoothstep(0.4, 1.0, a1 * 0.6 + a2 * 0.6);
        col = mix(col, uA, bands * 0.55);

        // soft tint toward edges
        float vign = smoothstep(0.0, 0.6, distance(uv, vec2(0.5)));
        col = mix(col, uC, vign * 0.25);

        gl_FragColor = vec4(col, 0.9);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
    });
    return mat;
  }, [isLight]);

  useFrame(({ clock }) => {
    (material.uniforms.uTime as { value: number }).value = clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, -2]} scale={[20, 12, 1]} material={material}>
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  );
}

import { useRouter } from "next/navigation";

function HologramTile({ position, rotation = [0, 0, 0], title, hue }: HologramTileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = `hsl(${hue}, 95%, 65%)`;
  const router = useRouter();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 1.5 + position[0]) * 0.002;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.8 + Math.sin(clock.getElapsedTime() * 3 + position[0]) * 0.2;
    }
  });
  const href = title === "About" ? "/about" : title === "Projects" ? "/projects" : "/contact";
  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onPointerDown={() => router.push(href)}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "default")}
      >
        <planeGeometry args={[1.4, 0.9, 1, 1]} />
        <meshStandardMaterial color={color} emissive={new THREE.Color(color)} emissiveIntensity={1} transparent opacity={0.18} metalness={0.1} roughness={0.2} />
      </mesh>
      <Text position={[0, 0, 0.01]} fontSize={0.18} color={color} anchorX="center" anchorY="middle">
        {title}
      </Text>
    </group>
  );
}

function HologramRig() {
  const groupRef = useMouseParallax(0.06);
  const spin = useRef(0);
  useFrame(() => {
    spin.current += 0.0025;
    if (groupRef.current) groupRef.current.rotation.z = Math.sin(spin.current) * 0.05;
  });
  return (
    <group ref={groupRef}>
      <Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.2}>
        <group>
          {/* Glass core */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.06, 64]} />
            <meshPhysicalMaterial
              color="#7dfcff"
              transparent
              opacity={0.15}
              roughness={0.1}
              metalness={0.2}
              transmission={0.95}
              thickness={0.4}
              emissive={new THREE.Color("#34d2ff")}
              emissiveIntensity={1.2}
            />
          </mesh>
          {/* Navigation tiles */}
          <group position={[-2.1, 0.85, 0.15]}>
            <HologramTile title="About" position={[0, 0, 0]} rotation={[0.08, -0.08, -0.05]} hue={200} />
          </group>
          <group position={[2.2, 0.6, -0.12]}>
            <HologramTile title="Projects" position={[0, 0, 0]} rotation={[0.02, 0.1, 0.04]} hue={155} />
          </group>
          <group position={[0, -1.05, 0.15]}>
            <HologramTile title="Contact" position={[0, 0, 0]} rotation={[0.06, -0.05, 0.02]} hue={305} />
          </group>
        </group>
      </Float>
    </group>
  );
}

type CinematicHeroProps = {
  mode?: "dark" | "light";
};

export default function CinematicHero({ mode = "light" }: CinematicHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-headline",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, ease: "power3.out", duration: 1.1, delay: 0.2 }
      );
      gsap.fromTo(
        ".hero-tagline",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, ease: "power3.out", duration: 1, delay: 0.35 }
      );
      gsap.fromTo(
        ".hero-cta",
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, ease: "power3.out", duration: 0.9, delay: 0.5 }
      );

      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "+=120%",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          gsap.to(".hero-parallax", { y: progress * -120, ease: "none" });
          gsap.to(".hero-canvas", { y: progress * -80, opacity: 1 - progress * 0.2, ease: "none" });
        },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const name = "VARDHAN";
  const isLight = mode === "light";

  return (
    <section
      ref={rootRef}
      className={
        "relative isolate min-h-[88vh] w-full overflow-hidden " +
        (isLight ? "bg-[#f7fbff]" : "bg-[#070b14]")
      }
    >
      {/* Background gradients */}
      <div
        className={
          "pointer-events-none hero-parallax absolute -top-32 left-1/2 h-[120vh] w-[120vh] -translate-x-1/2 rounded-full blur-2xl " +
          (isLight
            ? "bg-[radial-gradient(ellipse_at_center,rgba(0,100,255,0.16),rgba(255,255,255,0)_60%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.18),rgba(0,0,0,0)_60%)]")
        }
      />
      <div
        className={
          "pointer-events-none absolute inset-0 " +
          (isLight
            ? "bg-[radial-gradient(1000px_700px_at_30%_0%,rgba(0,120,255,0.12),transparent),radial-gradient(900px_600px_at_80%_20%,rgba(0,200,255,0.10),transparent)]"
            : "bg-[radial-gradient(1000px_700px_at_30%_0%,rgba(93,0,255,0.15),transparent),radial-gradient(900px_600px_at_80%_20%,rgba(0,255,200,0.12),transparent)]")
        }
      />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-28 text-center sm:pt-40">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-200/90 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          <span>Interactive Sci‑Fi Control</span>
        </div>

        <h1
          className={
            "hero-headline font-sans text-5xl font-extrabold tracking-tight md:text-7xl " +
            (isLight ? "text-[#0b1a2b]" : "text-white")
          }
        >
          {name.split("").map((char, idx) => (
            <motion.span
              key={idx}
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.06 * idx, duration: 0.6, ease: "easeOut" }}
              className="[text-shadow:0_0_12px_rgba(52,210,255,0.65)]"
            >
              {char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className={
            "hero-tagline mt-3 text-lg md:text-xl " +
            (isLight ? "text-slate-700" : "text-cyan-200/80")
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.span
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block"
          >
            BUILD. CREATE. LAUNCH.
          </motion.span>
        </motion.p>

        <Magnetic>
          <motion.a
            href="/projects"
            className={
            "hero-cta group relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-full border px-8 py-3 text-base font-semibold backdrop-blur transition-colors " +
            (isLight
              ? "border-sky-300/60 bg-white text-sky-700 shadow-[0_0_30px_rgba(0,120,255,0.15)_inset] hover:bg-sky-50"
              : "border-cyan-300/30 bg-cyan-400/10 text-cyan-100 shadow-[0_0_30px_rgba(0,255,200,0.2)_inset] hover:bg-cyan-400/15")
            }
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className="pointer-events-none absolute inset-0 -z-10 opacity-60 blur-xl transition duration-500 group-hover:opacity-90"
              style={{
                background: isLight
                  ? "radial-gradient(120px 120px at var(--x,50%) var(--y,50%), rgba(0,120,255,0.35), transparent 60%)"
                  : "radial-gradient(120px 120px at var(--x,50%) var(--y,50%), rgba(0,255,200,0.45), transparent 60%)",
              }}
            />
            <span className="relative">Enter Portfolio</span>
          </motion.a>
        </Magnetic>
      </div>

      {/* Three.js Scene */}
      <div className="hero-canvas absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6.5], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <PerformanceMonitor onDecline={(perf) => console.log("Perf down", perf)} />
          <color attach="background" args={[isLight ? "#f7fbff" : "#070b14"]} />
          <fog attach="fog" args={[isLight ? "#e6f3ff" : "#070b14", 6, 14]} />

          <ambientLight intensity={0.25} />
          <directionalLight position={[1, 2, 3]} intensity={isLight ? 0.8 : 1.2} color={new THREE.Color(isLight ? "#6bb7ff" : "#6cf0ff")} />
          <pointLight position={[-3, -1, 2]} intensity={isLight ? 0.7 : 1} color={new THREE.Color(isLight ? "#6bb7ff" : "#a35bff")} distance={12} />

          <AuroraBackground isLight={isLight} />
          <ParticlesField count={isLight ? 900 : 1100} />
          <HologramRig />

          <Environment preset={isLight ? "sunset" : "city"} />

          <EffectComposer multisampling={0}>
            <Bloom intensity={isLight ? 0.4 : 0.6} mipmapBlur luminanceThreshold={0.2} luminanceSmoothing={0.25} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Mouse glow for CTA */}
      <MouseGlow />
    </section>
  );
}

function MouseGlow() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = document.querySelector('.hero-cta') as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--y', `${y}%`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return null;
}

