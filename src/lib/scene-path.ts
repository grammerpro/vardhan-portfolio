/** Native document chapters are the clock for the scene. No independent timeline. */
export const SCENE_CHAPTERS = ['hero', 'unfold', 'work', 'capability', 'about', 'contact'] as const;
export type SceneChapter = (typeof SCENE_CHAPTERS)[number];
export type ExperienceMode = 'full' | 'balanced' | 'static';
export type Point3 = readonly [number, number, number];

export interface CameraKeyframe {
  at: number;
  position: Point3;
  target: Point3;
  fov: number;
  explosion: number;
  assemblyScale: number;
}

/** The opening is at [0, .65, 0]. The camera crosses its z plane at 1.55. */
export const CAMERA_PATH: readonly CameraKeyframe[] = [
  { at: 0, position: [.6, .65, 10.8], target: [-2.1, .05, 0], fov: 38, explosion: 0, assemblyScale: 1 },
  { at: .72, position: [.25, .8, 8.5], target: [-.8, .35, -.5], fov: 38, explosion: .38, assemblyScale: 1 },
  { at: 1, position: [.12, .75, 6], target: [0, .65, -2], fov: 39, explosion: 1, assemblyScale: 1 },
  { at: 1.45, position: [0, .65, 1.35], target: [0, .65, -5], fov: 40, explosion: 1, assemblyScale: 1 },
  { at: 1.75, position: [0, .65, -2], target: [.2, .35, -9], fov: 40, explosion: 1, assemblyScale: 1 },
  { at: 2, position: [.9, .45, -4.7], target: [0, .3, -11], fov: 40, explosion: 1, assemblyScale: 1 },
  { at: 2.85, position: [-.8, .45, -7], target: [0, .1, -16], fov: 40, explosion: 1, assemblyScale: 1 },
  { at: 3, position: [2.1, 1.4, -3.5], target: [0, .3, -12], fov: 38, explosion: 1, assemblyScale: 1 },
  { at: 4, position: [.5, .8, 9.5], target: [-2.2, .05, 0], fov: 38, explosion: .4, assemblyScale: .7 },
  { at: 5, position: [.6, .65, 10.8], target: [-2.25, .2, 0], fov: 38, explosion: 0, assemblyScale: .64 },
];

export interface CameraSample {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  explosion: number;
  assemblyScale: number;
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Writes into a reusable sample; no vectors are allocated inside the render loop. */
export function sampleCamera(progress: number, mobile: boolean, out: CameraSample): void {
  let right = 1;
  while (right < CAMERA_PATH.length - 1 && CAMERA_PATH[right].at < progress) right += 1;
  const a = CAMERA_PATH[right - 1];
  const b = CAMERA_PATH[right];
  const t = smoothstep((progress - a.at) / (b.at - a.at));
  for (let axis = 0; axis < 3; axis += 1) {
    out.position[axis] = mix(a.position[axis], b.position[axis], t);
    out.target[axis] = mix(a.target[axis], b.target[axis], t);
  }
  out.fov = mix(a.fov, b.fov, t);
  out.explosion = mix(a.explosion, b.explosion, t);
  out.assemblyScale = mix(a.assemblyScale, b.assemblyScale, t);
  if (mobile) {
    // The phone has an intentional lower hero composition and a wider lens.
    const hero = 1 - smoothstep(progress / .9);
    const contact = smoothstep((progress - 4) / .8);
    const quiet = Math.max(hero, contact);
    out.position[0] = mix(out.position[0], .4, quiet);
    out.position[1] += 2.98 * quiet;
    out.position[2] += 3.2 * quiet;
    out.target[0] = mix(out.target[0], 0, quiet);
    out.target[1] += 2.98 * quiet;
    out.fov += 7;
    out.assemblyScale *= mix(.675, .7, contact);
  }
}

export function readChapterOffsets(): number[] {
  return SCENE_CHAPTERS.map((id, index) => {
    const element = document.getElementById(id);
    return element ? element.getBoundingClientRect().top + window.scrollY : index * window.innerHeight;
  });
}

export function documentProgress(scrollY: number, offsets: readonly number[]): number {
  const y = Math.max(0, scrollY);
  for (let i = 0; i < offsets.length - 1; i += 1) {
    if (y < offsets[i + 1]) return i + clamp01((y - offsets[i]) / Math.max(1, offsets[i + 1] - offsets[i]));
  }
  return offsets.length - 1;
}
