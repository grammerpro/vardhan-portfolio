'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function AvatarModel({ onClick }: { onClick: () => void }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  // Load the GLB model
  const { scene } = useGLTF('/models/avatar.glb');
  
  // Clone the scene to avoid issues with cached instances
  const clone = useMemo(() => scene.clone(), [scene]);
  
  // Refs for bones
  const rightArm = useRef<THREE.Object3D | null>(null);
  const head = useRef<THREE.Object3D | null>(null);

  // Find bones on mount
  useEffect(() => {
    clone.traverse((child) => {
      if (child.type === 'Bone') {
        if (child.name.includes('RightArm') || child.name.includes('RightForeArm')) {
           // Prefer RightArm for waving
           if (!rightArm.current || child.name.includes('RightArm')) {
             rightArm.current = child;
           }
        }
        if (child.name.includes('Head')) {
          head.current = child;
        }
      }
    });
  }, [clone]);

  // Animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Waving animation
    if (rightArm.current) {
      rightArm.current.rotation.z = Math.sin(t * 5) * 0.5 - 1.5; 
      rightArm.current.rotation.x = Math.sin(t * 5) * 0.2 + 0.5;
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

  return (
    <group 
      ref={group} 
      onClick={onClick} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
      position={[0, -1.6, 0]}
    >
      <primitive object={clone} scale={1.2} />
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
