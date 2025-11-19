'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, MeshDistortMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

interface ShapeProps {
  position: [number, number, number];
  color: string;
  label: string;
  onClick: () => void;
  geometryType: 'icosahedron' | 'torus' | 'octahedron';
  delay?: number;
}

function FloatingShape({ position, color, label, onClick, geometryType, delay = 0 }: ShapeProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (!mesh.current) return;
    // Gentle rotation
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.2;
    mesh.current.rotation.y += 0.01;
    
    // Scale on hover
    const targetScale = hovered ? 1.2 : 1;
    mesh.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  const Geometry = () => {
    switch (geometryType) {
      case 'icosahedron':
        return <icosahedronGeometry args={[0.8, 0]} />;
      case 'torus':
        return <torusGeometry args={[0.6, 0.25, 16, 32]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.8, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
      <group position={position}>
        <mesh
          ref={mesh}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          <Geometry />
          <MeshDistortMaterial
            color={color}
            speed={2}
            distort={0.3}
            radius={1}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, -1.4, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </Float>
  );
}

export default function InteractiveShapes() {
  const router = useRouter();

  const handleResumeClick = () => {
    router.push('/resume');
  };

  const handleCertificatesClick = () => {
    // For now, linking to resume as certificates are usually there, 
    // or we could scroll to an about section
    router.push('/resume'); 
  };

  const handleProjectsClick = () => {
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <group position={[4, 0, 0]}>
      <FloatingShape
        position={[0, 1.5, 0]}
        color="#3b82f6" // Blue
        label="RESUME"
        onClick={handleResumeClick}
        geometryType="icosahedron"
        delay={0}
      />
      <FloatingShape
        position={[1.5, -0.5, 0.5]}
        color="#8b5cf6" // Purple
        label="CERTIFICATES"
        onClick={handleCertificatesClick}
        geometryType="torus"
        delay={2}
      />
      <FloatingShape
        position={[-1.5, -1, -0.5]}
        color="#f59e0b" // Amber
        label="PROJECTS"
        onClick={handleProjectsClick}
        geometryType="octahedron"
        delay={4}
      />
    </group>
  );
}
