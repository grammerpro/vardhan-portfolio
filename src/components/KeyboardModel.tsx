'use client';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent, ThreeElements, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Group } from 'three';

type KeyboardModelProps = ThreeElements['group'];

type GLTFResult = {
  scene: Group;
};

export default function KeyboardModel(props: KeyboardModelProps) {
  const { scene } = useGLTF('/models/base.glb') as unknown as GLTFResult;
  const ref = useRef<Group>(null);

  // Animate slowly spinning
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
    }
  });

  // Click handler example
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const clicked = e.object.name;
    alert(`Clicked: ${clicked}`);
  };

  return (
    <group ref={ref} {...props} dispose={null} onClick={handleClick}>
      <primitive object={scene} />
    </group>
  );
}
