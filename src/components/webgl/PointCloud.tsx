'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hero point cloud with a vertical sweep line traversing it, referencing DOM
 * traversal and crawling. Points near the sweep brighten to --signal and dim
 * back.
 *
 * This is ambient. It must never compete with the type, which is why the
 * base colour sits close to the paper background and only the sweep band
 * reaches full accent.
 */

// Reduced from 2200 after review: at that density the field read as texture
// noise across the whole viewport and pulled FPS to the mid-30s.
const COUNT = 900;
const SPREAD_X = 14;
const SPREAD_Y = 8;
const SPREAD_Z = 5;

const VERTEX = /* glsl */ `
  uniform float uSweep;
  uniform float uBandWidth;
  uniform float uPixelRatio;
  varying float vBrightness;

  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    // Distance from this point to the sweep line, in world X.
    float distance = abs(modelPosition.x - uSweep);
    vBrightness = 1.0 - smoothstep(0.0, uBandWidth, distance);

    // Nearer points are larger, and lit points swell slightly.
    float size = 2.0 + vBrightness * 3.0;
    gl_PointSize = size * uPixelRatio * (10.0 / -viewPosition.z);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uBase;
  uniform vec3 uSignal;
  varying float vBrightness;

  void main() {
    // Round points rather than squares.
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    // Ambient means ambient. The accent only reaches full strength at the
    // very centre of the sweep, and even lit points stay well under opaque,
    // so the field never competes with the headline.
    vec3 color = mix(uBase, uSignal, vBrightness * 0.85);
    float alpha = mix(0.10, 0.45, vBrightness);
    gl_FragColor = vec4(color, alpha);
  }
`;

export default function PointCloud({ dpr }: { dpr: number }) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uSweep: { value: -SPREAD_X / 2 },
      // Wider band reads as a soft traverse rather than a hard blue stripe.
      uBandWidth: { value: 3.2 },
      uPixelRatio: { value: dpr },
      uBase: { value: new THREE.Color('#5A5F66') },
      uSignal: { value: new THREE.Color('#1F3BFF') },
    }),
    [dpr],
  );

  useFrame((state, delta) => {
    if (!points.current || !material.current) return;

    // Slow rotation. Deliberately below the threshold where it reads as
    // motion rather than drift.
    points.current.rotation.y += delta * 0.045;

    // Sweep traverses left to right and wraps.
    const u = material.current.uniforms.uSweep;
    u.value += delta * 2.6;
    if (u.value > SPREAD_X / 2 + 2) u.value = -SPREAD_X / 2 - 2;
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
