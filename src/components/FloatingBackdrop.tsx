'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, RoundedBox } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function TileField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  const tiles = useMemo(() => {
    const cols = 36;
    const rows = 38;
    const spacing = 0.48;
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetZ = rows * spacing * 0.55;

    return Array.from({ length: cols * rows }, (_, index) => {
      const x = index % cols;
      const z = Math.floor(index / cols);
      const position = new THREE.Vector3(x * spacing - offsetX, 0, -z * spacing + offsetZ);
      const radial = Math.hypot(position.x, position.z + 6);
      const depth = z / rows;
      return {
        position,
        noise: Math.random() * Math.PI * 2,
        radial,
        depth,
      };
    });
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    tiles.forEach((tile, index) => {
      const hue = THREE.MathUtils.lerp(0.78, 0.68, tile.depth);
      const lightness = THREE.MathUtils.lerp(0.72, 0.55, tile.depth);
      const base = new THREE.Color().setHSL(hue, 0.72, lightness);
      mesh.setColorAt(index, base);
      dummy.position.copy(tile.position);
      dummy.scale.set(0.92, 0.92, 0.92);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [tiles, dummy]);

  useFrame(({ clock, pointer }) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    const t = clock.getElapsedTime();
    const pointerX = pointer.x * 7.2;
    const pointerZ = -pointer.y * 9 - 4;

    tiles.forEach((tile, index) => {
      const wave = Math.sin(tile.position.x * 1.25 + t * 1.05 + tile.noise) * 0.08;
      const wave2 = Math.cos(tile.position.z * 0.75 + t * 0.9 + tile.noise) * 0.07;
      const distance = Math.hypot(tile.position.x - pointerX, tile.position.z - pointerZ);
      const pointerLift = Math.exp(-distance * 0.38) * 0.55;
      const walkway = Math.exp(-(tile.position.x ** 2) * 0.6) * Math.exp(-tile.depth * 2) * 0.6;
      const baseLift = THREE.MathUtils.lerp(0.04, 0.32, 1 - tile.depth);
      const height = baseLift + walkway + wave + wave2 + pointerLift;

      const hue = THREE.MathUtils.lerp(0.78, 0.68, tile.depth);
      const lightness = THREE.MathUtils.lerp(0.72, 0.55 + pointerLift * 0.55, tile.depth);
      const saturation = THREE.MathUtils.lerp(0.72, 0.95, pointerLift * 2.5);
      color.setHSL(hue, saturation, lightness);
      mesh.setColorAt(index, color);

      dummy.position.set(tile.position.x, height, tile.position.z);
      dummy.scale.setScalar(0.92);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, tiles.length]} castShadow receiveShadow>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial metalness={0.15} roughness={0.3} />
    </instancedMesh>
  );
}

function FloatingCubes() {
  return (
    <>
      <Float speed={3.2} rotationIntensity={1.4} floatIntensity={1.8}>
        <RoundedBox
          args={[1.8, 1.8, 1.8]}
          position={[5, 6, 0]}
          radius={0.2}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.68, 0.8, 0.75)}
            metalness={0.4}
            roughness={0.25}
            emissive={new THREE.Color().setHSL(0.68, 0.7, 0.25)}
            emissiveIntensity={0.4}
          />
        </RoundedBox>
      </Float>

      <Float speed={3.8} rotationIntensity={1} floatIntensity={2}>
        <RoundedBox
          args={[1.5, 1.5, 1.5]}
          position={[-5.5, 6.5, 3]}
          radius={0.18}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.78, 0.72, 0.68)}
            metalness={0.4}
            roughness={0.28}
            emissive={new THREE.Color().setHSL(0.78, 0.75, 0.22)}
            emissiveIntensity={0.38}
          />
        </RoundedBox>
      </Float>

      <Float speed={3.5} rotationIntensity={1.2} floatIntensity={1.6}>
        <RoundedBox
          args={[2.1, 2.1, 2.1]}
          position={[-4, 8, -6]}
          radius={0.22}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.72, 0.75, 0.72)}
            metalness={0.35}
            roughness={0.32}
            emissive={new THREE.Color().setHSL(0.72, 0.7, 0.28)}
            emissiveIntensity={0.35}
          />
        </RoundedBox>
      </Float>

      <Float speed={3.6} rotationIntensity={1.15} floatIntensity={1.7}>
        <RoundedBox
          args={[1.6, 1.6, 1.6]}
          position={[5.2, 6, -5]}
          radius={0.19}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={new THREE.Color().setHSL(0.75, 0.76, 0.7)}
            metalness={0.38}
            roughness={0.26}
            emissive={new THREE.Color().setHSL(0.75, 0.72, 0.24)}
            emissiveIntensity={0.36}
          />
        </RoundedBox>
      </Float>
    </>
  );
}

export default function FloatingBackdrop() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 9, 12], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      className="pointer-events-none"
    >
      <color attach="background" args={['#00000000']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 12, 8]} intensity={1.2} castShadow />
      <pointLight position={[0, 10, 0]} intensity={1.5} color={new THREE.Color().setHSL(0.73, 0.8, 0.75)} />

      <TileField />
      <FloatingCubes />

      <Environment preset="city" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.92} intensity={0.65} />
      </EffectComposer>
    </Canvas>
  );
}
