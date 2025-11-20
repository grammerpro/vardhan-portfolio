'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
  const { camera } = useThree();

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

  // Auto-fit camera so the entire model is visible: compute bounding box & place camera
  useEffect(() => {
    try {
      const box = new THREE.Box3().setFromObject(clone);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Sphere radius & a multiplier to determine camera distance
      const radius = size.length() * 0.5;
      const distance = radius * 2.2; // tweak this factor if needed

      // Move the camera back and slightly up to fit the model vertically
      camera.position.set(center.x, center.y + radius * 0.35, distance + 0.8);
      camera.lookAt(center.x, center.y, center.z);
      camera.updateProjectionMatrix();
    } catch (err) {
      // Clone may not be fully ready; ignore errors silently
    }
  }, [clone, camera]);

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
      position={[0, -2.5, 0]} // Centered full body
      rotation={[0, -0.2, 0]}
    >
      <primitive object={clone} scale={2.3} />
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
      className="fixed bottom-5 right-5 w-48 h-64 z-[10002] cursor-pointer transition-transform hover:scale-105"
      title="Ask Vardhan"
    >
      <Canvas camera={{ position: [0, 0, 3.0], fov: 35 }}>
        <ambientLight intensity={1.2} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <AvatarModel onClick={handleClick} />
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
