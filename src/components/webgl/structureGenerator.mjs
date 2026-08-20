/**
 * The Index: deterministic generator for the hero structure.
 *
 * A content architecture seen in the abstract. The structure is produced by
 * recursive subdivision rather than by scattering boxes, because subdivision
 * is literally what a content hierarchy is, and because randomly placed boxes
 * read as a wireframe city.
 *
 * Written as .mjs with JSDoc types rather than .ts so that both the React
 * component and scripts/build-index-svg.mjs can import the exact same code.
 * The filename deliberately does not match IndexStructure.tsx even in case:
 * on a case-insensitive filesystem webpack resolved `./IndexStructure` to the
 * .mjs, which has no default export, and the whole page failed to render.
 * The mobile SVG has to be the same object as the WebGL version, and the only
 * way to guarantee that is to have one generator.
 *
 * Everything here is integer-snapped and axis-aligned. No module is ever
 * rotated off-axis.
 */

/** Root volume, in grid units. */
export const ROOT = { x: 48, y: 30, z: 20 };

/** A cell is never split below this on any axis, so insets leave something. */
const MIN_CELL = 4;

/** Every emitted module is inset from its cell by this many whole units. */
const INSET = 1;

/** Distance a module travels in from off-frame during assembly. */
export const ENTRY_DISTANCE = 46;

/** Assembly timing, mirrored from --dur-* and the brief's 25ms stagger. */
export const ASSEMBLY = { duration: 0.9, stagger: 0.025 };

/**
 * mulberry32. Small, fast, and deterministic, which is the only property that
 * matters here: the build-time SVG must match the runtime geometry exactly.
 * @param {number} seed
 */
function makeRandom(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @typedef {{ min: number[], max: number[] }} Cell
 * @typedef {{ min: number[], max: number[], center: number[], size: number[],
 *             offset: number[], delay: number }} Module
 */

/** @param {Cell} c */
const sizeOf = (c) => [c.max[0] - c.min[0], c.max[1] - c.min[1], c.max[2] - c.min[2]];

/** @param {Cell} c */
const volumeOf = (c) => {
  const s = sizeOf(c);
  return s[0] * s[1] * s[2];
};

/**
 * Split the largest cell repeatedly. Splitting largest-first keeps the
 * partition balanced, which is what makes it read as nesting rather than as
 * a pile.
 *
 * @param {{ seed?: number, target?: number, prune?: number }} [options]
 * @returns {Module[]}
 */
export function generateIndexStructure(options = {}) {
  const seed = options.seed ?? 20260819;
  const target = options.target ?? 44;
  const prune = options.prune ?? 0.42;
  const random = makeRandom(seed);

  // Generate enough cells that pruning lands on the target.
  const cellTarget = Math.round(target / (1 - prune));

  /** @type {Cell[]} */
  let cells = [
    {
      min: [-ROOT.x / 2, -ROOT.y / 2, -ROOT.z / 2],
      max: [ROOT.x / 2, ROOT.y / 2, ROOT.z / 2],
    },
  ];

  let guard = 0;
  while (cells.length < cellTarget && guard < 2000) {
    guard += 1;

    // Largest splittable cell.
    let index = -1;
    let best = -1;
    for (let i = 0; i < cells.length; i += 1) {
      const s = sizeOf(cells[i]);
      if (Math.max(s[0], s[1], s[2]) < MIN_CELL * 2) continue;
      const v = volumeOf(cells[i]);
      if (v > best) {
        best = v;
        index = i;
      }
    }
    if (index < 0) break;

    const cell = cells[index];
    const s = sizeOf(cell);

    // Split the longest axis that can actually take a split.
    const order = [0, 1, 2].sort((a, b) => s[b] - s[a]);
    const axis = order.find((a) => s[a] >= MIN_CELL * 2);
    if (axis === undefined) break;

    // Integer split position between 1/3 and 2/3, so the grid holds.
    const low = cell.min[axis] + MIN_CELL;
    const high = cell.max[axis] - MIN_CELL;
    const cut = Math.round(low + random() * (high - low));

    const a = { min: [...cell.min], max: [...cell.max] };
    const b = { min: [...cell.min], max: [...cell.max] };
    a.max[axis] = cut;
    b.min[axis] = cut;

    cells.splice(index, 1, a, b);
  }

  // Prune to leave negative space. Without this the partition is space
  // filling and reads as a solid block.
  cells = cells.filter(() => random() > prune);

  /** @type {Module[]} */
  const modules = cells
    .map((cell) => {
      const min = cell.min.map((v) => v + INSET);
      const max = cell.max.map((v) => v - INSET);
      return { min, max };
    })
    .filter((m) => m.max[0] > m.min[0] && m.max[1] > m.min[1] && m.max[2] > m.min[2])
    .map((m) => {
      const center = [
        (m.min[0] + m.max[0]) / 2,
        (m.min[1] + m.max[1]) / 2,
        (m.min[2] + m.max[2]) / 2,
      ];
      const size = [m.max[0] - m.min[0], m.max[1] - m.min[1], m.max[2] - m.min[2]];

      // Each module arrives along one axis only: the one it already sits
      // furthest along, so the assembly reads as things sliding into place
      // rather than converging on a point.
      const dominant = center.map(Math.abs).indexOf(Math.max(...center.map(Math.abs)));
      const offset = [0, 0, 0];
      offset[dominant] = Math.sign(center[dominant] || 1) * ENTRY_DISTANCE;

      return { ...m, center, size, offset, delay: 0 };
    });

  // Spatial assembly order, bottom to top.
  modules.sort((p, q) => p.min[1] - q.min[1]);
  modules.forEach((m, i) => {
    m.delay = i * ASSEMBLY.stagger;
  });

  return modules;
}

/** Total assembly time in seconds, for checking against the brief's 2.5s cap. */
export function assemblyDuration(modules) {
  if (!modules.length) return 0;
  return modules[modules.length - 1].delay + ASSEMBLY.duration;
}

/**
 * Orthographic projection to a single SVG path.
 *
 * Used by the non-WebGL fallback. It returns one `d` string rather than a list
 * of lines for two reasons: 576 <line> elements is 576 DOM nodes, and more
 * importantly an <img> pointing at an SVG file is a Largest Contentful Paint
 * candidate. The decorative structure became the LCP element on mobile with a
 * 6.8s load delay, which is a straight violation of the performance budget.
 * Inline <svg> content is not an LCP candidate at all, and computing it here
 * costs one request less than fetching a 32kB file.
 *
 * The camera parameters must match SceneLayer's.
 *
 * @param {{ width?: number, height?: number, zoom?: number, camera?: number[] }} [view]
 */
export function projectToPath(view = {}) {
  const width = view.width ?? 1440;
  const height = view.height ?? 900;
  const zoom = view.zoom ?? 14;
  const eye = view.camera ?? [26, 18, 30];

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const norm = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };

  // Camera basis, looking at the origin with world up.
  const forward = norm(sub([0, 0, 0], eye));
  const right = norm(cross(forward, [0, 1, 0]));
  const up = cross(right, forward);

  const project = (p) => {
    const d = sub(p, eye);
    return [
      width / 2 + dot(d, right) * zoom,
      height / 2 - dot(d, up) * zoom,
    ];
  };

  const EDGES = [
    [0, 1], [1, 3], [3, 2], [2, 0],
    [4, 5], [5, 7], [7, 6], [6, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  const parts = [];

  for (const volume of generateIndexStructure()) {
    const [x0, y0, z0] = volume.min;
    const [x1, y1, z1] = volume.max;
    const corners = [
      [x0, y0, z0], [x1, y0, z0], [x0, y1, z0], [x1, y1, z0],
      [x0, y0, z1], [x1, y0, z1], [x0, y1, z1], [x1, y1, z1],
    ].map(project);

    for (const [a, b] of EDGES) {
      parts.push(
        `M${corners[a][0].toFixed(1)} ${corners[a][1].toFixed(1)}` +
          `L${corners[b][0].toFixed(1)} ${corners[b][1].toFixed(1)}`,
      );
    }
  }

  return { d: parts.join(''), width, height };
}
