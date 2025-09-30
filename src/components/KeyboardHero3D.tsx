'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import KeyboardModel from './KeyboardModel';

export default function KeyboardHero3D() {
  return (
    <div className="w-full h-[500px] bg-black rounded-md">
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 5]} intensity={1} />
        <Environment preset="studio" />
        <KeyboardModel />
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
