'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

function AvatarModel({ onClick }: { onClick: () => void }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  // Load the GLB model
  const { scene, animations: modelAnimations } = useGLTF('/models/avatar.glb');

  // Also try loading separate animation file
  const { animations: idleAnimations } = useGLTF('/animations/Idle.glb');

  // Combine animations - prefer idle animations if they exist
  const allAnimations = idleAnimations.length > 0 ? idleAnimations : modelAnimations;

  // Clone the scene
  const clone = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        (child as THREE.SkinnedMesh).frustumCulled = false;
      }
    });
    return cloned;
  }, [scene]);

  // Setup animations
  const { actions, mixer } = useAnimations(allAnimations, group);

  // Play animation
  useEffect(() => {
    if (allAnimations.length > 0 && actions) {
      const animationName = allAnimations[0].name;
      const action = actions[animationName];

      if (action) {
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.fadeIn(0.5).play();
      }

      return () => {
        action?.fadeOut(0.5);
      };
    }
  }, [actions, allAnimations]);

  // Update mixer every frame
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }

    if (group.current) {
      // Hover scale effect
      const targetScale = hovered ? 1.08 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group
      ref={group}
      onClick={onClick}
      onPointerOver={() => {
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'default';
      }}
      position={[0, -2.2, 0]}  // Move model down even more
      rotation={[0, -0.1, 0]}
      scale={0.75}  // Smaller scale to fit the canvas
    >
      <primitive object={clone} />
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
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleClick = () => {
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

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  useEffect(() => {
    const checkState = setInterval(() => {
      const widget = (window as unknown as CustomWindow).assistantWidgetInstance;
      if (widget && widget.isOpen !== isOpen) {
        setIsOpen(widget.isOpen);
      }
    }, 1000);
    return () => clearInterval(checkState);
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed z-40 transition-all duration-300 ${isMinimized
            ? 'bottom-4 right-4 w-14 h-14'
            : 'bottom-4 right-4 w-32 h-52 md:w-40 md:h-64'
          }`}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Control buttons */}
        <div className="absolute -top-2 -right-2 flex gap-1 z-50">
          <button
            onClick={handleMinimize}
            className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center text-[10px] text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '↗' : '↙'}
          </button>
          <button
            onClick={handleClose}
            className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-red-400 hover:text-white flex items-center justify-center text-[10px] text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
            title="Close"
          >
            ✕
          </button>
        </div>

        {isMinimized ? (
          <motion.div
            className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => setIsMinimized(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">👤</span>
          </motion.div>
        ) : (
          <div
            className="w-full h-full cursor-pointer rounded-lg overflow-hidden"
            title="Click to chat with Vardhan"
          >
            <Canvas
              camera={{
                position: [0, -0.5, 3.5],  // Camera looking slightly down
                fov: 50,
                near: 0.1,
                far: 100
              }}
              gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <pointLight position={[-3, 3, 2]} intensity={0.8} color="#ffcc88" />
              <Environment preset="apartment" />

              <Suspense fallback={null}>
                <AvatarModel onClick={handleClick} />
              </Suspense>

              <ContactShadows
                position={[0, -3.2, 0]}
                opacity={0.3}
                scale={4}
                blur={2}
                far={3}
              />
            </Canvas>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

useGLTF.preload('/models/avatar.glb');
useGLTF.preload('/animations/Idle.glb');
