import * as THREE from 'three';
import { createInterior, createSignatureAssembly } from './SignatureAssembly';
import { type CameraSample, type ExperienceMode, documentProgress, readChapterOffsets, sampleCamera, smoothstep } from '@/lib/scene-path';

export interface ExperienceRendererOptions {
  canvas: HTMLCanvasElement;
  mode: Exclude<ExperienceMode, 'static'>;
  onReady: () => void;
  onFailure: () => void;
}

/** No network lighting assets: broad photographic softboxes baked into an IBL. */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const source = document.createElement('canvas');
  source.width = 1024;
  source.height = 512;
  const context = source.getContext('2d');
  if (!context) return null;
  const base = context.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#b8b9b3');
  base.addColorStop(.47, '#444c53');
  base.addColorStop(.53, '#171d22');
  base.addColorStop(1, '#83847e');
  context.fillStyle = base;
  context.fillRect(0, 0, 1024, 512);
  const softbox = (x: number, y: number, width: number, height: number, color: string) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };
  softbox(30, 75, 220, 210, '#f9f7eb');
  softbox(270, 35, 55, 295, '#e4e9e7');
  softbox(640, 80, 170, 270, '#d3e1e8');
  softbox(830, 95, 25, 290, '#ffffff');
  softbox(370, 395, 240, 26, '#c5a078');
  const texture = new THREE.CanvasTexture(source);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const generator = new THREE.PMREMGenerator(renderer);
  const map = generator.fromEquirectangular(texture);
  generator.dispose();
  texture.dispose();
  return map;
}

function createGroundingShadow() {
  const source = document.createElement('canvas');
  source.width = source.height = 128;
  const context = source.getContext('2d');
  if (!context) return null;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(20,23,25,.2)');
  gradient.addColorStop(.45, 'rgba(20,23,25,.1)');
  gradient.addColorStop(1, 'rgba(20,23,25,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(source);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(.2, -2.9, .3);
  return mesh;
}

/** Own the context even if setup fails before the normal disposer exists. */
export function createExperienceRenderer(options: ExperienceRendererOptions) {
  const renderer = new THREE.WebGLRenderer({ canvas: options.canvas, alpha: true, antialias: true, powerPreference: 'default' });
  try {
    return initializeExperienceRenderer(options, renderer);
  } catch (error) {
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    throw error;
  }
}

/** A demand-driven renderer; scroll and pointer events request only settling frames. */
function initializeExperienceRenderer({ canvas, mode, onReady, onFailure }: ExperienceRendererOptions, renderer: THREE.WebGLRenderer) {
  let disposed = false;
  let failed = false;
  let frame = 0;
  let previousTime = 0;
  let frameSamples = 0;
  let slowSamples = 0;
  let quality: 'full' | 'balanced' = mode;
  let offsets = readChapterOffsets();
  let targetProgress = documentProgress(window.scrollY, offsets);
  let progress = targetProgress;
  let pointerX = 0;
  let pointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;
  let mobile = window.innerWidth <= 1000;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#111315', .018);
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, .08, 65);
  const environment = studioEnvironment(renderer);
  if (environment) scene.environment = environment.texture;
  const ambient = new THREE.HemisphereLight('#f8f6ec', '#5d6772', 2.1);
  const key = new THREE.DirectionalLight('#fff6e5', 4.2);
  key.position.set(-4, 6, 5);
  const fill = new THREE.DirectionalLight('#b8d7e8', 2.8);
  fill.position.set(5, 2, -2);
  const rim = new THREE.DirectionalLight('#ffffff', 2.2);
  rim.position.set(1, -1, 6);
  scene.add(ambient, key, fill, rim);
  const assembly = createSignatureAssembly();
  const interior = createInterior();
  const shadow = createGroundingShadow();
  scene.add(assembly.group, interior.group);
  if (shadow) scene.add(shadow);
  const lookAt = new THREE.Vector3();
  const sample: CameraSample = { position: [0, 0, 0], target: [0, 0, 0], fov: 38, explosion: 0, assemblyScale: 1 };
  let firstFrame = true;

  const applySize = () => {
    mobile = window.innerWidth <= 1000;
    const cap = quality === 'balanced' ? 1.25 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    canvas.dataset.quality = quality;
  };

  const reportFailure = () => {
    if (failed || disposed) return;
    failed = true;
    cancelAnimationFrame(frame);
    frame = 0;
    onFailure();
  };

  const render = (time: number) => {
    frame = 0;
    if (disposed || failed || document.hidden) return;
    const elapsed = previousTime ? time - previousTime : 16.67;
    const delta = Math.min(.05, Math.max(.001, elapsed / 1000));
    previousTime = time;
    const easing = 1 - Math.exp(-13 * delta);
    progress += (targetProgress - progress) * easing;
    currentPointerX += (pointerX - currentPointerX) * easing;
    currentPointerY += (pointerY - currentPointerY) * easing;
    const unsettled = Math.abs(targetProgress - progress) > .0003 || Math.abs(pointerX - currentPointerX) > .0005 || Math.abs(pointerY - currentPointerY) > .0005;
    if (!unsettled) {
      progress = targetProgress;
      currentPointerX = pointerX;
      currentPointerY = pointerY;
    }
    sampleCamera(progress, mobile, sample);
    const pointerStrength = (1 - smoothstep(progress / .9)) * (quality === 'full' ? .12 : .07);
    camera.position.set(sample.position[0] + currentPointerX * pointerStrength, sample.position[1] + currentPointerY * pointerStrength, sample.position[2]);
    lookAt.set(...sample.target);
    camera.lookAt(lookAt);
    if (Math.abs(camera.fov - sample.fov) > .001) {
      camera.fov = sample.fov;
      camera.updateProjectionMatrix();
    }
    assembly.update(sample.explosion, sample.assemblyScale, smoothstep(progress) * .26);
    assembly.group.visible = progress < 2.15 || progress > 3.45;
    interior.update(progress);
    if (shadow) {
      shadow.visible = progress < .8 || progress > 4;
      shadow.scale.setScalar(sample.assemblyScale);
    }
    const dark = smoothstep((progress - .5) / .9) * (1 - smoothstep((progress - 3.5) / 1));
    ambient.intensity = 2.1 - dark * .9;
    key.intensity = 4.2 - dark * 2.5;
    fill.intensity = 2.8 - dark * 1.7;
    rim.intensity = 2.2 - dark * 1.3;
    scene.environmentIntensity = 1 - dark * .6;
    renderer.toneMappingExposure = 1.18 - dark * .12;
    try {
      renderer.render(scene, camera);
    } catch {
      reportFailure();
      return;
    }
    // Inspectable measurements, deliberately not a production FPS overlay.
    canvas.dataset.drawCalls = String(renderer.info.render.calls);
    canvas.dataset.triangles = String(renderer.info.render.triangles);
    canvas.dataset.chapterProgress = progress.toFixed(3);
    canvas.dataset.renderFrames = String(renderer.info.render.frame);
    if (firstFrame) {
      firstFrame = false;
      onReady();
    }
    // Only consecutive active frames count. Exclude shader compilation and
    // long gaps between interactions; downgrade once to avoid oscillation.
    if (quality === 'full' && unsettled && elapsed < 120) {
      frameSamples += 1;
      if (frameSamples > 25 && elapsed > 35) slowSamples += 1;
      if (frameSamples >= 145) {
        if (slowSamples > 70) {
          quality = 'balanced';
          applySize();
        }
        frameSamples = 25;
        slowSamples = 0;
      }
    }
    if (unsettled) frame = requestAnimationFrame(render);
    else previousTime = 0;
  };
  const requestFrame = () => {
    if (!frame && !disposed && !failed && !document.hidden) frame = requestAnimationFrame(render);
  };
  const syncScroll = () => {
    targetProgress = documentProgress(window.scrollY, offsets);
    // Scrollbar drags and section links reconcile immediately, without
    // flying through every skipped chapter.
    if (Math.abs(targetProgress - progress) > .48) progress = targetProgress;
    requestFrame();
  };
  const remeasure = () => {
    offsets = readChapterOffsets();
    targetProgress = documentProgress(window.scrollY, offsets);
    progress = targetProgress;
    applySize();
    requestFrame();
  };
  const pointer = (event: PointerEvent) => {
    if (!finePointer.matches || mobile || progress > .9) return;
    pointerX = (event.clientX / window.innerWidth - .5) * 2;
    pointerY = -(event.clientY / window.innerHeight - .5) * 2;
    requestFrame();
  };
  const clearPointer = () => {
    pointerX = pointerY = 0;
    requestFrame();
  };
  const visibility = () => {
    pointerX = pointerY = currentPointerX = currentPointerY = 0;
    previousTime = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      progress = targetProgress = documentProgress(window.scrollY, offsets);
      requestFrame();
    }
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    reportFailure();
  };
  const observer = new ResizeObserver(remeasure);
  observer.observe(document.body);
  window.addEventListener('scroll', syncScroll, { passive: true });
  window.addEventListener('resize', remeasure, { passive: true });
  window.addEventListener('hashchange', remeasure);
  window.addEventListener('pageshow', remeasure);
  window.addEventListener('pointermove', pointer, { passive: true });
  window.addEventListener('blur', clearPointer);
  document.documentElement.addEventListener('pointerleave', clearPointer);
  document.addEventListener('visibilitychange', visibility);
  canvas.addEventListener('webglcontextlost', contextLost);
  void document.fonts.ready.then(() => { if (!disposed) remeasure(); });
  applySize();
  requestFrame();

  return () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('scroll', syncScroll);
    window.removeEventListener('resize', remeasure);
    window.removeEventListener('hashchange', remeasure);
    window.removeEventListener('pageshow', remeasure);
    window.removeEventListener('pointermove', pointer);
    window.removeEventListener('blur', clearPointer);
    document.documentElement.removeEventListener('pointerleave', clearPointer);
    document.removeEventListener('visibilitychange', visibility);
    canvas.removeEventListener('webglcontextlost', contextLost);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh.material) {
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => {
          materials.add(material);
          Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
        });
      }
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    textures.forEach((texture) => texture.dispose());
    environment?.dispose();
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
  };
}
