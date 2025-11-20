'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function AvatarWithAnimation({ onClick }: { onClick: () => void }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  // Load the GLB model
  const { scene } = useGLTF('/models/avatar.glb');
  
  // Clone the scene to avoid issues with cached instances
  const clone = useMemo(() => scene.clone(), [scene]);
  
  // Load the animation
  // Note: Ensure /animations/Idle.glb exists in your public folder
  const { animations } = useGLTF('/animations/Idle.glb');
  const { actions } = useAnimations(animations, group);

  // Play animation
  useEffect(() => {
    if (actions && animations.length > 0) {
      // Play the first animation found in the GLB
      const action = actions[animations[0].name];
      if (action) {
        action.reset().fadeIn(0.5).play();
      }
      return () => {
        action?.fadeOut(0.5);
      };
    }
  }, [actions, animations]);

  const { camera } = useThree();

  // Auto-fit camera so the entire model is visible
  useEffect(() => {
    try {
      const box = new THREE.Box3().setFromObject(clone);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const radius = size.length() * 0.5;
      const distance = radius * 2.2;

      camera.position.set(center.x, center.y + radius * 0.35, distance + 1.5);
      camera.lookAt(center.x, center.y, center.z);
      camera.updateProjectionMatrix();
    } catch (err) {
      // ignore
    }
  }, [clone, camera]);

  // Position the group
  useEffect(() => {
    try {
      const box = new THREE.Box3().setFromObject(clone);
      const bottomY = box.min.y;
      const desiredFeetY = -1.2;
      const offsetY = desiredFeetY - bottomY;
      if (group.current) {
        group.current.position.y = offsetY;
      }
    } catch (err) {
      // ignore
    }
  }, [clone]);

  // Hover scale effect
  useFrame(() => {
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
      position={[0, -2.5, 0]} 
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
      className="fixed bottom-5 right-5 w-56 h-80 z-[10002] cursor-pointer transition-transform hover:scale-105"
      title="Ask Vardhan"
    >
      <Canvas camera={{ position: [0, 0, 4.0], fov: 30 }}>
        <ambientLight intensity={1.2} />
        <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <Environment preset="city" />
        
        <Suspense fallback={null}>
          <AvatarWithAnimation onClick={handleClick} />
        </Suspense>
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/avatar.glb');
useGLTF.preload('/animations/Idle.glb');
