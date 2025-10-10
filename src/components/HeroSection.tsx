'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function HorizonGlow() {
  return (
    <>
      <motion.div
        className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[#ffe3c6]/70 blur-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.5, 0.32], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-[#d8b4fe]/40 blur-[160px]"
        animate={{ opacity: [0.25, 0.45, 0.3], x: [0, 20, -20] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[22rem] w-[22rem] translate-x-1/3 rounded-full bg-[#7dd3fc]/40 blur-[160px]"
        animate={{ opacity: [0.25, 0.4, 0.28], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
      />
    </>
  );
}

function TileField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const tiles = useMemo(() => {
    const cols = 36;
    const rows = 38;
    const spacing = 0.48;
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetZ = rows * spacing * 0.55;

    return Array.from({ length: cols * rows }, (_, index) => {
      const x = index % cols;
      const z = Math.floor(index / cols);
      const position = new THREE.Vector3(x * spacing - offsetX, 0, -z * spacing + offsetZ);
      const radial = Math.hypot(position.x, position.z + 6);
      const depth = z / rows;
      return {
        position,
        noise: Math.random() * Math.PI * 2,
        radial,
        depth,
      };
    });
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    tiles.forEach((tile, index) => {
      const hue = THREE.MathUtils.lerp(0.78, 0.68, tile.depth);
      const lightness = THREE.MathUtils.lerp(0.72, 0.55, tile.depth);
      const base = new THREE.Color().setHSL(hue, 0.72, lightness);
      mesh.setColorAt(index, base);
      dummy.position.copy(tile.position);
      dummy.scale.set(0.92, 0.92, 0.92);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [tiles, dummy]);

  useFrame(({ clock, pointer }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const t = clock.getElapsedTime();
    const pointerX = pointer.x * 7.2;
    const pointerZ = -pointer.y * 9 - 4;

    tiles.forEach((tile, index) => {
      const wave = Math.sin(tile.position.x * 1.25 + t * 1.05 + tile.noise) * 0.08;
      const wave2 = Math.cos(tile.position.z * 0.75 + t * 0.9 + tile.noise) * 0.07;
      const distance = Math.hypot(tile.position.x - pointerX, tile.position.z - pointerZ);
      const pointerLift = Math.exp(-distance * 0.38) * 0.55;
      const walkway = Math.exp(-(tile.position.x ** 2) * 0.6) * Math.exp(-tile.depth * 2) * 0.6;
      const baseLift = THREE.MathUtils.lerp(0.04, 0.32, 1 - tile.depth);
      const height = baseLift + walkway + wave + wave2 + pointerLift;

      dummy.position.set(tile.position.x, height * 0.48, tile.position.z);
      const yScale = 0.65 + height * 1.35;
      dummy.scale.setScalar(0.92);
      dummy.scale.y = yScale;
      dummy.rotation.set(-0.1 + height * 0.05, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);

      const intensity = THREE.MathUtils.clamp(0.4 + height * 0.9, 0.2, 1);
      color.setHSL(THREE.MathUtils.lerp(0.78, 0.68, intensity), 0.8, THREE.MathUtils.lerp(0.55, 0.75, intensity));
      mesh.setColorAt(index, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group rotation={[-0.35, 0, 0]} position={[0, -1.8, -3.2]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, tiles.length]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.24, 0.46]} />
        <meshStandardMaterial
          vertexColors
          emissive="#a855f7"
          emissiveIntensity={0.25}
          roughness={0.55}
          metalness={0.25}
          envMapIntensity={0.8}
          transparent
          opacity={0.93}
        />
      </instancedMesh>
    </group>
  );
}

type AccentConfig = {
  position: [number, number, number];
  args: [number, number, number];
  color: string;
  speed: number;
  floatIntensity: number;
  rotation: [number, number, number];
};

function FloatingBackdrop() {
  const accents = useMemo<AccentConfig[]>(
    () => [
      {
        position: [-5.2, 2.6, -7.8],
        args: [1.6, 0.46, 1.6],
        color: '#c084fc',
        speed: 0.95,
        floatIntensity: 0.3,
        rotation: [0.4, 0.8, 0.2],
      },
      {
        position: [4.6, 2.1, -7.2],
        args: [1.4, 0.52, 1.4],
        color: '#a855f7',
        speed: 1.1,
        floatIntensity: 0.28,
        rotation: [-0.35, 0.5, -0.2],
      },
      {
        position: [-1.2, 1.2, -6],
        args: [1.1, 0.38, 1.1],
        color: '#60a5fa',
        speed: 1.35,
        floatIntensity: 0.35,
        rotation: [0.2, -0.4, 0.3],
      },
    ],
    []
  );

  return (
    <Canvas
      className="absolute inset-0"
      style={{ pointerEvents: 'none' }}
      camera={{ position: [0, 0, 12], fov: 52 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 6, 5]} intensity={0.35} color="#f0abfc" />
      <directionalLight position={[-6, -4, -3]} intensity={0.25} color="#60a5fa" />

      {accents.map(({ position, args, color: tone, speed, floatIntensity, rotation }, index) => (
        <Float key={index} speed={speed} rotationIntensity={0.28} floatIntensity={floatIntensity}>
          <group position={position} rotation={rotation}>
            <RoundedBox args={args} radius={Math.min(...args) * 0.28} smoothness={6}>
              <meshStandardMaterial
                color={tone}
                metalness={0.32}
                roughness={0.24}
                emissive={tone}
                emissiveIntensity={0.28}
              />
            </RoundedBox>
          </group>
        </Float>
      ))}

      <EffectComposer>
        <Bloom intensity={0.25} luminanceThreshold={0.26} luminanceSmoothing={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

export default function HeroSection() {
  const highlights = [
    'Immersive WebGL storytelling',
    'AI-assisted design workflows',
    'Polished product launches',
  ];

  return (
    <section
      id="home"
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-gradient-to-b from-[#fdf3dc] via-[#f8f4ff] to-[#eef1ff] text-neutral-900 dark:from-[#140b24] dark:via-[#1b1530] dark:to-[#0f1628] dark:text-white"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/60 dark:via-white/5 dark:to-white/5" />
        <HorizonGlow />
        <FloatingBackdrop />
        <div className="absolute inset-x-0 bottom-0 h-[60vh] min-h-[320px]">
          <Canvas camera={{ position: [0, 5.8, 9.6], fov: 38 }} gl={{ antialias: true, alpha: true }}>
            <ambientLight intensity={0.45} />
            <directionalLight position={[6, 10, 6]} intensity={0.8} color="#fbcfe8" />
            <directionalLight position={[-6, 5, -6]} intensity={0.4} color="#a855f7" />
            <pointLight position={[0, 4.2, 4]} intensity={0.55} color="#f5d0fe" />
            <pointLight position={[0, 3, -6]} intensity={0.35} color="#c4b5fd" />

            <TileField />

            <Environment preset="sunset" />
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.1} luminanceSmoothing={0.4} />
            </EffectComposer>
          </Canvas>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#fdf3dc] via-transparent to-transparent dark:from-[#140b24]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-24 pb-32 text-center sm:pt-28 lg:pt-32">
        <motion.div
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-purple-500 shadow-[0_18px_46px_-24px_rgba(147,51,234,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-purple-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          Vardhan — Creative Developer
        </motion.div>

        <motion.h1
          className="text-4xl font-semibold leading-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.75rem] dark:text-white"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          Designing immersive web moments with purpose
        </motion.h1>

        <motion.p
          className="mt-6 max-w-3xl text-base text-neutral-600 sm:text-lg md:text-xl dark:text-neutral-300"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          Hi, I&apos;m Vardhan. I blend realtime 3D, thoughtful UX, and dependable engineering to shape personal, high-impact
          digital experiences. I help teams launch ideas that feel tactile, human, and unforgettable.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: 'easeOut' }}
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-sky-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_25px_70px_-25px_rgba(147,51,234,0.75)] transition-all duration-300"
          >
            Let&apos;s collaborate
          </motion.a>
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-full border border-purple-200/70 bg-white/60 px-10 py-4 text-lg font-semibold text-purple-600 backdrop-blur-xl transition-all duration-300 hover:border-purple-300 hover:bg-white/80 dark:border-white/20 dark:bg-white/10 dark:text-purple-200 dark:hover:border-purple-200/40"
          >
            See my work
          </motion.a>
        </motion.div>

        <motion.ul
          className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.55, ease: 'easeOut' }}
        >
          {highlights.map((item) => (
            <li
              key={item}
              className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-sm font-medium text-neutral-600 shadow-[0_30px_80px_-45px_rgba(147,51,234,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-neutral-200"
            >
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
















