'use client';

import React, { useRef } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

interface KeyProps {
  position: [number, number, number];
  color: string;
  label: string;
  width?: number;
  height?: number;
  depth?: number;
  fontSize?: number;
  textColor?: string;
}

const Key = ({ position, color, label, width = 0.8, height = 0.8, depth = 0.4, fontSize = 0.2, textColor = 'white' }: KeyProps) => {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = React.useState(false);

  useFrame(() => {
    if (mesh.current) {
      const targetY = hovered ? position[1] - 0.1 : position[1];
      mesh.current.position.y += (targetY - mesh.current.position.y) * 0.1;
    }
  });

  return (
    <group position={position}>
      <RoundedBox
        ref={mesh}
        args={[width, height, depth]} // Width, Height, Depth
        radius={0.1}
        smoothness={4}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <Text
        position={[0, 0, depth / 2 + 0.01]}
        fontSize={fontSize}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

const SpeakerGrill = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[0, (i - 7) * 0.12, 0]}>
          <boxGeometry args={[4, 0.05, 0.05]} />
          <meshStandardMaterial color="#111" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

const Oscilloscope = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Bezel */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 2.2, 0.2]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.11]} rotation={[0, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#003300" />
      </mesh>
      {/* Grid Lines (Simplified) */}
      <group position={[0, 0, 0.12]}>
         <mesh>
            <planeGeometry args={[1.4, 0.02]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
         </mesh>
         <mesh rotation={[0, 0, Math.PI / 2]}>
            <planeGeometry args={[1.4, 0.02]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
         </mesh>
         {/* Trace */}
         <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, 0.5]}>
            <planeGeometry args={[1, 0.05]} />
            <meshBasicMaterial color="#00ff00" />
         </mesh>
      </group>
    </group>
  );
};

export default function ProceduralKeyboard(props: ThreeElements['group']) {
  return (
    <group {...props}>
      {/* Main Body */}
      <RoundedBox args={[10, 3, 0.5]} radius={0.2} smoothness={4}>
        <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.8} />
      </RoundedBox>

      {/* Left Section: Keys */}
      <group position={[-3, 0, 0.3]}>
        {/* Row 1 */}
        <Key position={[-1.2, 0.8, 0]} label="HOME" color="#111" />
        <Key position={[0, 0.8, 0]} label="G3" color="#A5C9FF" textColor="black" />
        <Key position={[1.2, 0.8, 0]} label="IG" color="#FF6B6B" /> {/* Gradient approx */}

        {/* Row 2 */}
        <Key position={[-1.2, -0.2, 0]} label="@" color="#F5F5DC" textColor="black" />
        <Key position={[0, -0.2, 0]} label="HIRE ME" color="#111" width={1.0} />
        <Key position={[1.2, -0.2, 0]} label="X" color="#111" />

        {/* Row 3 */}
        <Key position={[-1.2, -1.2, 0]} label="CALL ME" color="#111" width={1.0} />
        <Key position={[0, -1.2, 0]} label="DB" color="#FFC0CB" textColor="black" />
        <Key position={[1.2, -1.2, 0]} label="BH" color="#4169E1" />
      </group>

      {/* Top Left Display */}
      <group position={[-3, 1.8, 0.26]}>
        <RoundedBox args={[3.5, 0.4, 0.1]} radius={0.1} smoothness={4}>
             <meshStandardMaterial color="#000" />
        </RoundedBox>
        <Text position={[-1.5, 0, 0.06]} fontSize={0.15} color="#00ff00" anchorX="left" anchorY="middle">
            Available For Freelance
        </Text>
        <mesh position={[1.5, 0, 0.06]}>
            <circleGeometry args={[0.1, 16]} />
            <meshBasicMaterial color="#00ff00" toneMapped={false} />
        </mesh>
      </group>

      {/* Center Section: Speaker Grill */}
      <SpeakerGrill position={[1, -0.2, 0.26]} />

      {/* Right Section: Oscilloscope */}
      <Oscilloscope position={[3.8, 0, 0.26]} />
      
    </group>
  );
}
