'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import BackgroundShapes from '@/components/BackgroundShapes';

// Particle system component with enhanced interactivity
function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const { mouse } = useThree();
  const [hovered, setHovered] = useState(false);

  const particlesCount = 1500;
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
      points.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;

      // Enhanced magnetic effect
      const mouseVector = new THREE.Vector3(mouse.x * 5, mouse.y * 5, 0);
      points.current.position.lerp(mouseVector, hovered ? 0.02 : 0.005);
    }
  });

  return (
    <points
      ref={points}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#0ea5e9"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Floating geometric shapes with enhanced effects
function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.6}>
        <Sphere args={[0.4]} position={[-4, 2, -3]}>
          <MeshDistortMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            distort={0.3}
            speed={1.5}
            roughness={0}
            metalness={0.2}
          />
        </Sphere>
      </Float>
      <Float speed={2} rotationIntensity={1} floatIntensity={0.4}>
        <Sphere args={[0.25]} position={[4, -2, -2]}>
          <MeshDistortMaterial
            color="#f0f9ff"
            transparent
            opacity={0.2}
            distort={0.4}
            speed={2}
          />
        </Sphere>
      </Float>
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.5}>
        <Sphere args={[0.15]} position={[0, 3, -1]}>
          <MeshDistortMaterial
            color="#e0f2fe"
            transparent
            opacity={0.25}
            distort={0.2}
            speed={1.8}
          />
        </Sphere>
      </Float>
    </group>
  );
}

// Main glass orb with enhanced materials
function GlassOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <Sphere ref={meshRef} args={[1.5]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          distort={0.1}
          speed={0.8}
          roughness={0}
          metalness={0.1}
          transmission={0.9}
          thickness={0.5}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroSection() {
  return (
  <section id="home" className="relative w-full h-screen flex items-center justify-center bg-white dark:bg-neutral-950 overflow-hidden snap-start">
      {/* Subtle gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/20 dark:from-neutral-950 dark:via-neutral-900/40 dark:to-neutral-900/20"></div>

      {/* Geometric background shapes */}
      <BackgroundShapes />

      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-sky-100/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-100/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-100/25 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Main headline with Apple-style typography */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
                        Hi, I&apos;m{' '}
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              Vardhan
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 font-light tracking-wide"
          >
            Creative Developer
          </motion.p>
        </motion.div>

        {/* Tagline that fades in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mb-16"
        >
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
            Crafting sleek web experiences with AI, 3D & creativity
          </p>
        </motion.div>

        {/* CTA Buttons with Apple-style design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 bg-sky-500 text-white rounded-full font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-sky-600"
          >
            View My Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 border-2 border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-100 rounded-full font-medium text-lg hover:bg-gray-50 dark:hover:bg-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600 transition-all duration-300"
          >
            Get In Touch
          </motion.button>
        </motion.div>
      </div>

      {/* Three.js Scene with enhanced camera controls */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.4} color="#0ea5e9" />

          <ParticleField />
          <FloatingShapes />
          <GlassOrb />

          <Environment preset="studio" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.3}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />

          <EffectComposer>
            <Bloom intensity={0.3} />
            <ChromaticAberration offset={[0.001, 0.001]} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Scroll indicator with Apple-style design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
  className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
  <div className="w-6 h-10 border-2 border-gray-300 dark:border-neutral-700 rounded-full flex justify-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </div>
  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-light text-center">Scroll to explore</p>
      </motion.div>
    </section>
  );
}
