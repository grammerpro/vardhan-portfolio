"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Suspense } from "react";

export default function HeroKeyboard3D() {
  return (
    <div className="h-[600px] w-full bg-black">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Keyboard />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}

function Keyboard() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 2.5, 0.3]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Example key */}
      <mesh position={[-1.8, 0.6, 0.2]}>
        <boxGeometry args={[1, 0.6, 0.2]} />
        <meshStandardMaterial color="#facc15" />
        <Text position={[0, 0, 0.15]} fontSize={0.2} color="black">
          HOME
        </Text>
      </mesh>

      {/* Add more buttons as needed in grid */}
    </group>
  );
}
