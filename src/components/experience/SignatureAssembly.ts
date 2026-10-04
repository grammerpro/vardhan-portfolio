import * as THREE from 'three';

type Vertex = readonly [number, number];

function cutPlate(points: readonly Vertex[], depth = .35, bevel = .045) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth, steps: 1, bevelEnabled: true, bevelSegments: 3,
    bevelSize: bevel, bevelThickness: bevel, curveSegments: 1,
  });
}

function filament(points: THREE.Vector3[], material: THREE.Material, radius = .016) {
  return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 6, false), material);
}

function plate(points: readonly Vertex[], material: THREE.Material, depth = .35, bevel = .045) {
  return new THREE.Mesh(cutPlate(points, depth, bevel), material);
}

export function createSignatureAssembly() {
  const group = new THREE.Group();
  const left = new THREE.Group();
  const right = new THREE.Group();
  const spine = new THREE.Group();
  const silver = new THREE.MeshPhysicalMaterial({ color: '#bac3c7', metalness: .96, roughness: .28, clearcoat: .18, clearcoatRoughness: .3, envMapIntensity: 1.5 });
  const silverEdge = new THREE.MeshStandardMaterial({ color: '#e2e5df', metalness: .86, roughness: .22, envMapIntensity: 1.35 });
  const graphite = new THREE.MeshStandardMaterial({ color: '#192229', metalness: .68, roughness: .32 });
  const recess = new THREE.MeshStandardMaterial({ color: '#39454e', metalness: .8, roughness: .36 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#9ac6d4', metalness: .1, roughness: .15, transparent: true, opacity: .5, depthWrite: false, side: THREE.DoubleSide, clearcoat: .9 });
  const signal = new THREE.MeshStandardMaterial({ color: '#d39a58', emissive: '#eea65a', emissiveIntensity: .7, metalness: .4, roughness: .32 });

  // The asymmetric profiles are authored in the face plane. Bevels reveal depth
  // under the rectangular studio lights; the aperture remains physically empty.
  const leftFace: Vertex[] = [[-2.18, 2.36], [-1.16, 2.45], [.4, -1.93], [-.03, -2.42], [-.5, -2.17]];
  const rightFace: Vertex[] = [[1.39, 2.73], [2.07, 2.48], [.51, -1.96], [-.03, -2.42], [.04, -1.61]];
  const l = plate(leftFace, silver, .52, .065);
  const r = plate(rightFace, silverEdge, .43, .055);
  right.add(r);
  left.add(l);
  r.position.z = -.16;

  // A inset milled channel with an independent inner surface and bright lip.
  const leftChannel: Vertex[] = [[-1.88, 2.08], [-1.63, 2.1], [-.2, -1.8], [-.35, -1.99]];
  const channel = plate(leftChannel, graphite, .016, .012);
  channel.position.z = .59;
  left.add(channel);
  const leftInlay = plate([[-1.8, 2.02], [-1.67, 2.04], [-.26, -1.8], [-.32, -1.88]], recess, .025, .009);
  leftInlay.position.z = .61;
  left.add(leftInlay);
  const rightChannel = plate([[1.52, 2.35], [1.76, 2.25], [.39, -1.64], [.2, -1.94]], graphite, .019, .012);
  rightChannel.position.z = .34;
  right.add(rightChannel);
  const insert = plate([[1.57, 2.27], [1.71, 2.21], [.38, -1.61], [.27, -1.78]], glass, .09, .014);
  insert.position.z = .37;
  right.add(insert);

  const ceramicLeft = plate([[-1.84, 2.15], [-1.03, 2.21], [.43, -1.85], [-.01, -2.45], [-.39, -2.13]], graphite, .58, .07);
  const ceramicRight = plate([[1.43, 2.52], [1.92, 2.28], [.44, -1.92], [-.01, -2.45]], graphite, .58, .07);
  ceramicLeft.position.set(.12, -.08, -.7);
  ceramicRight.position.set(.12, -.08, -.7);
  spine.add(ceramicLeft, ceramicRight);

  const signalPoints = [
    new THREE.Vector3(-1.22, 2.21, .6), new THREE.Vector3(-.81, 1.12, .61),
    new THREE.Vector3(-.29, -.36, .61), new THREE.Vector3(.23, -1.84, .6),
  ];
  const leftSignal = filament(signalPoints, signal);
  left.add(leftSignal);
  const signalCurve = new THREE.CatmullRomCurve3(signalPoints);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffe2a6' }));
  left.add(pulse);
  right.add(filament([
    new THREE.Vector3(1.38, 2.35, .4), new THREE.Vector3(.98, 1.18, .4),
    new THREE.Vector3(.5, -.22, .4), new THREE.Vector3(.07, -1.58, .4),
  ], signal, .012));

  // Tiny repeated fasteners are instanced once per moving wing.
  const boltGeometry = new THREE.CylinderGeometry(.047, .047, .023, 8);
  boltGeometry.rotateX(Math.PI / 2);
  const boltMatrix = new THREE.Matrix4();
  const fasteners = (owner: THREE.Group, positions: readonly [number, number, number][]) => {
    const bolts = new THREE.InstancedMesh(boltGeometry, graphite, positions.length);
    positions.forEach(([x, y, z], index) => {
      boltMatrix.makeTranslation(x, y, z);
      bolts.setMatrixAt(index, boltMatrix);
    });
    owner.add(bolts);
  };
  fasteners(left, [[-1.98, 2.15, .61], [-1.3, .42, .61], [-.45, -1.81, .61], [-1.35, 2.2, .61]]);
  fasteners(right, [[1.89, 2.26, .37], [1.2, .3, .37], [.43, -1.74, .37]]);

  // Short silver cross connectors become visible when the sculpture unfolds.
  const connectorGeometry = new THREE.CylinderGeometry(.048, .048, .85, 8);
  connectorGeometry.rotateX(Math.PI / 2);
  const connectors = new THREE.InstancedMesh(connectorGeometry, silverEdge, 4);
  [[-1.32, 1.23], [-.42, -1.28], [1.2, 1.3], [.45, -.95]].forEach(([x, y], i) => {
    boltMatrix.makeTranslation(x, y, -.18);
    connectors.setMatrixAt(i, boltMatrix);
  });
  spine.add(connectors);
  group.add(spine, left, right);

  return {
    group, signal,
    update(explosion: number, scale: number, rotation: number) {
      left.position.set(-explosion * 1.17, explosion * .2, explosion * .32);
      left.rotation.y = -explosion * .1;
      right.position.set(explosion * 1.04, explosion * .3, -explosion * .17);
      right.rotation.y = explosion * .09;
      spine.position.z = -explosion * .7;
      group.scale.setScalar(scale);
      group.rotation.set(-.12, -.32 + rotation, -.11);
      signal.emissiveIntensity = .65 + explosion * .45;
      // A restrained scroll-linked pulse; no timer keeps the GPU awake at rest.
      signalCurve.getPoint(.16 + explosion * .72, pulse.position);
    },
  };
}

export function createInterior() {
  const group = new THREE.Group();
  const frameMaterial = new THREE.MeshStandardMaterial({ color: '#798b93', metalness: .9, roughness: .38, transparent: true, depthWrite: false });
  const railMaterial = new THREE.MeshStandardMaterial({ color: '#697b83', metalness: .8, roughness: .43, transparent: true, depthWrite: false });
  const signalMaterial = new THREE.MeshBasicMaterial({ color: '#c58a48', transparent: true, opacity: .48 });
  const railGeometry = new THREE.BoxGeometry(.075, .075, 19);
  const crossGeometry = new THREE.BoxGeometry(5.6, .1, .15);
  const uprightGeometry = new THREE.BoxGeometry(.1, 4.2, .15);
  const frames: THREE.Group[] = [];
  for (let i = 0; i < 3; i += 1) {
    const frame = new THREE.Group();
    const top = new THREE.Mesh(crossGeometry, frameMaterial);
    const bottom = new THREE.Mesh(crossGeometry, frameMaterial);
    const l = new THREE.Mesh(uprightGeometry, frameMaterial);
    const r = new THREE.Mesh(uprightGeometry, frameMaterial);
    top.position.y = 2.1;
    bottom.position.y = -2.1;
    l.position.x = -2.8;
    r.position.x = 2.8;
    frame.add(top, bottom, l, r);
    frame.position.set((i - 1) * .35, .1, -9 - i * 5.7);
    frame.rotation.z = (i - 1) * .025;
    group.add(frame);
    frames.push(frame);
  }
  for (const x of [-2.8, 2.8]) {
    for (const y of [-2.1, 2.1]) {
      const rail = new THREE.Mesh(railGeometry, railMaterial);
      rail.position.set(x, y, -13);
      group.add(rail);
    }
  }
  const nodes = new THREE.Group();
  const nodeGeometry = new THREE.OctahedronGeometry(.12, 0);
  const nodePoints = [new THREE.Vector3(-2.2, 1.3, -11), new THREE.Vector3(1.9, 1.3, -12), new THREE.Vector3(-2.2, -1.2, -13), new THREE.Vector3(1.9, -1.2, -14)];
  nodePoints.forEach((point) => {
    const mesh = new THREE.Mesh(nodeGeometry, signalMaterial);
    mesh.position.copy(point);
    nodes.add(mesh);
  });
  [[0, 1], [0, 2], [1, 3], [2, 3]].forEach(([a, b]) => {
    nodes.add(filament([nodePoints[a], nodePoints[a].clone().lerp(nodePoints[b], .5), nodePoints[b]], signalMaterial, .01));
  });
  group.add(nodes);
  return {
    group,
    update(progress: number) {
      group.visible = progress > .75 && progress < 4.15;
      const reading = THREE.MathUtils.smoothstep(progress, 1.7, 2);
      frameMaterial.opacity = 1 - reading * .8;
      railMaterial.opacity = 1 - reading * .85;
      const systems = Math.max(0, 1 - Math.abs(progress - 3) * 2.7);
      nodes.visible = systems > .01;
      signalMaterial.opacity = systems * .65;
      frames.forEach((frame, i) => {
        frame.position.x = (i - 1) * (.35 + systems * 1.9);
        frame.rotation.y = (i - 1) * systems * .16;
      });
    },
  };
}
