'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { generateIndexStructure, ASSEMBLY } from './structureGenerator.mjs';

/**
 * The Index. Replaces the point cloud, which read as pathogen imagery because
 * randomly scattered soft-edged dots with a travelling brightness front is the
 * visual grammar of microscopy. No colour or density change escapes that, so
 * scatter is replaced with structure.
 *
 * All 61 modules live in a single merged BufferGeometry and assemble entirely
 * in the vertex shader. Animating 61 separate objects would mean 61 draw calls
 * and per-object matrix work on the main thread every frame, which fights the
 * performance work in Workstream E. This is one draw call and no main-thread
 * cost.
 *
 * Line width is 1px and cannot be anything else: core WebGL ignores
 * `linewidth` on effectively every platform. That happens to be exactly what
 * the brief asks for, so the constraint agrees with the design. Do not try to
 * thicken it here; it needs Line2 from three's examples, which is a different
 * object entirely.
 */

const VERTEX = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aDelay;

  uniform float uTime;
  uniform float uDuration;

  varying float vDepth;

  void main() {
    // Functional equivalent of --ease-out-expo, cubic-bezier(0.16, 1, 0.3, 1).
    // Same substitution documented for the Lenis easing in Phase 1.
    float t = clamp((uTime - aDelay) / uDuration, 0.0, 1.0);
    float eased = t >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * t);

    vec3 displaced = position + aOffset * (1.0 - eased);
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);

    // Depth cue. Without this all 61 nested modules draw at one opacity and
    // the interior collapses into a tangle of coincident lines. Fading by
    // view depth is what makes it read as a drafted axonometric rather than
    // noise, and it is how a draughtsman would weight the same drawing.
    vDepth = viewPosition.z;

    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uNear;
  uniform float uFar;

  varying float vDepth;

  void main() {
    // Nearest edges at full weight, furthest at a third. Range is in view
    // space, so it is stable under rotation.
    float t = clamp((vDepth - uFar) / (uNear - uFar), 0.0, 1.0);
    float weight = mix(0.28, 1.0, t);
    gl_FragColor = vec4(uColor, uOpacity * weight);
  }
`;

/** --ink. Held at 0.35 so the lines stay visually lighter than body text. */
const INK = '#121417';
const BASE_OPACITY = 0.35;

/** Ambient rotation: one revolution in 180 seconds, Y axis only. */
const SPIN = (Math.PI * 2) / 180;

/** Cursor parallax ceiling, in radians. Two degrees, per the brief. */
const TILT = (2 * Math.PI) / 180;

/** Nudged left of centre so the structure clears the hero paragraph. */
const BASE_X = -4;

export default function IndexStructure() {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const modules = generateIndexStructure();

    const positions: number[] = [];
    const offsets: number[] = [];
    const delays: number[] = [];

    modules.forEach((volume) => {
      // EdgesGeometry over BoxGeometry gives clean box edges with none of the
      // diagonal triangulation artifacts you get from wireframe: true.
      const box = new THREE.BoxGeometry(volume.size[0], volume.size[1], volume.size[2]);
      const edges = new THREE.EdgesGeometry(box);
      const attr = edges.getAttribute('position');

      for (let i = 0; i < attr.count; i += 1) {
        positions.push(
          attr.getX(i) + volume.center[0],
          attr.getY(i) + volume.center[1],
          attr.getZ(i) + volume.center[2],
        );
        offsets.push(volume.offset[0], volume.offset[1], volume.offset[2]);
        delays.push(volume.delay);
      }

      box.dispose();
      edges.dispose();
    });

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 3));
    merged.setAttribute('aDelay', new THREE.Float32BufferAttribute(delays, 1));
    return merged;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDuration: { value: ASSEMBLY.duration },
      uColor: { value: new THREE.Color(INK) },
      uOpacity: { value: BASE_OPACITY },
      uNear: { value: 30 },
      uFar: { value: -30 },
    }),
    [],
  );

  useFrame((state, delta) => {
    elapsed.current += delta;

    if (material.current) {
      material.current.uniforms.uTime.value = elapsed.current;
    }

    if (spinGroup.current) {
      spinGroup.current.rotation.y += delta * SPIN;
    }

    // Scroll response, read every frame rather than triggered, so it is
    // linked to position rather than fired at a threshold.
    const heroHeight = window.innerHeight || 1;
    const progress = Math.min(1, Math.max(0, window.scrollY / heroHeight));

    if (tiltGroup.current) {
      // Parallax at 0.4x. Orthographic zoom converts pixels to world units.
      const zoom = (camera as THREE.OrthographicCamera).zoom || 1;
      tiltGroup.current.position.x = BASE_X;
      tiltGroup.current.position.y = (window.scrollY * 0.4) / zoom;

      // Damped cursor tilt, capped at two degrees, returning to rest.
      const targetX = -pointer.current.y * TILT;
      const targetY = pointer.current.x * TILT;
      tiltGroup.current.rotation.x += (targetX - tiltGroup.current.rotation.x) * 0.05;
      tiltGroup.current.rotation.z += (targetY - tiltGroup.current.rotation.z) * 0.05;
    }

    if (material.current) {
      // Fully faded by the time the positioning section pins, which is one
      // hero height of scroll.
      material.current.uniforms.uOpacity.value = BASE_OPACITY * (1 - progress);
    }

    // Pointer is read from r3f state rather than a window listener, so it
    // stays inside the canvas lifecycle and needs no cleanup.
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
  });

  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        <lineSegments geometry={geometry} frustumCulled={false}>
          <shaderMaterial
            ref={material}
            vertexShader={VERTEX}
            fragmentShader={FRAGMENT}
            uniforms={uniforms}
            transparent
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </group>
  );
}
