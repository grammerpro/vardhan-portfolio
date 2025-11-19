'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

function AvatarModel({ onClick }: { onClick: () => void }) {
  const group = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  // Animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Waving animation
    if (rightArm.current) {
      // Arm swings back and forth
      rightArm.current.rotation.z = Math.sin(t * 5) * 0.5 + 2.5; 
    }

    // Head tracking mouse (subtle)
    if (head.current) {
      const targetX = (state.mouse.x * 0.5);
      const targetY = (state.mouse.y * 0.5);
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, targetX, 0.1);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, -targetY, 0.1);
    }

    // Hover scale effect
    if (group.current) {
      const targetScale = hovered ? 1.1 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  // Colors based on the Bitmoji (Blonde hair, Blue shirt)
  const skinColor = "#f5d0b0";
  const shirtColor = "#60a5fa"; // Blue-400
  const hairColor = "#fcd34d"; // Amber-300
  const pantsColor = "#1e3a8a"; // Dark Blue Jeans
  const shoeColor = "#ffffff";

  return (
    <group 
      ref={group} 
      onClick={onClick} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
      position={[0, -0.5, 0]}
    >
      {/* Torso */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.7, 0.3]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      <mesh position={[0.15, -0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.15, -0.95, 0.05]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>
      <mesh position={[0.15, -0.95, 0.05]}>
        <boxGeometry args={[0.15, 0.1, 0.25]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>

      {/* Head Group */}
      <group ref={head} position={[0, 0.6, 0]}>
        {/* Face */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        
        {/* Hair (Simplified) */}
        <mesh position={[0, 0.1, -0.05]}>
          <sphereGeometry args={[0.36, 32, 32]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0, 0.3, 0.05]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="black" />
        </mesh>

        {/* Glasses */}
        <mesh position={[0, 0.05, 0.32]}>
          <torusGeometry args={[0.14, 0.015, 16, 32]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.12, 0.05, 0.32]}>
           <ringGeometry args={[0.06, 0.08, 32]} />
           <meshStandardMaterial color="#333" />
        </mesh>
         <mesh position={[0.12, 0.05, 0.32]}>
           <ringGeometry args={[0.06, 0.08, 32]} />
           <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      {/* Right Arm (Waving) */}
      <group ref={rightArm} position={[0.4, 0.2, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* Left Arm (Idle) */}
      <group position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.2]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.1, 0.5, 4, 8]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

    </group>
  );
}

interface AssistantWidgetInstance {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

interface CustomWindow extends Window {
  assistantWidgetInstance?: AssistantWidgetInstance;
}

export default function ThreeDAvatarLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    // Access the global widget instance
    const widget = (window as unknown as CustomWindow).assistantWidgetInstance;
    if (widget) {
      if (isOpen) {
        widget.close();
      } else {
        widget.open();
      }
      setIsOpen(!isOpen);
    }
  };

  // Listen for widget close events from the widget itself
  useEffect(() => {
    const checkState = setInterval(() => {
       const widget = (window as unknown as CustomWindow).assistantWidgetInstance;
       if (widget && widget.isOpen !== isOpen) {
         // Sync state if changed externally (e.g. close button clicked)
         // Note: The vanilla widget might not expose isOpen property directly, 
         // so we might need to rely on the toggle behavior mostly.
       }
    }, 1000);
    return () => clearInterval(checkState);
  }, [isOpen]);

  return (
    <div 
      className="fixed bottom-5 right-5 w-28 h-36 z-[10002] cursor-pointer transition-transform hover:scale-105"
      title="Ask Vardhan"
    >
      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
          <AvatarModel onClick={handleClick} />
        </Float>
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
