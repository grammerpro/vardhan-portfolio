# Signature scene

## Implementation

`src/components/experience/ExperienceBoundary.tsx` server-renders a transparent, composition-matched poster. Once the readable page has painted, full and balanced modes load `ExperienceRenderer.ts` with a dynamic import. Static mode never constructs a WebGL renderer. Graphics initialization or context loss returns to the poster and exposes an explicit retry button; it does not reload automatically.

The renderer uses the installed Three.js r178 directly. This keeps the graphics dependency isolated and gives one owner responsibility for the camera, mesh transforms, animation frame requests, and disposal. The existing Fiber packages remain available elsewhere in the repository; the new scene does not require them or a postprocessing stack.

`SignatureAssembly.ts` constructs two different beveled wing profiles, a dark inner spine, milled inset channels, a small translucent insert, instanced fasteners, connectors, and an amber spline. The pulse follows scroll, so it settles when the reader stops. Interior rails become three exhibit frames; the systems chapter separates these frames and reveals fixed connection nodes. The sculpture reassembles near contact.

The studio environment is generated from a 1024 × 512 canvas containing broad softboxes and converted through Three's PMREM generator. A 128 × 128 procedural gradient provides a grounding shadow. No model, HDR, external texture, generated photograph, paid art, or third-party artwork is downloaded.

## Camera and layout contract

`src/lib/scene-path.ts` owns the typed keyframes. The native document sections `hero`, `unfold`, `work`, `capability`, `about`, and `contact` map to chapter coordinates 0 through 5. Measurements refresh after fonts, resize, body layout changes, history restoration, and hash navigation.

The camera begins at approximately `[0.6, 0.65, 10.8]`, approaches the widening opening, crosses the assembly's z plane between chapter coordinates 1.45 and 1.75, then reaches `[0.9, 0.45, -4.7]` in the gallery. The aperture crossing uses y = 0.65 and x = 0. The camera physically passes through empty space; the effect is not a scaled poster.

Small changes use time-based exponential damping with delta bounded to 50 ms. A change greater than 0.48 chapter units reconciles immediately to the new native scroll position, keeping large navigation jumps predictable. Reverse scrolling uses the same path. Camera roll remains zero. Pointer displacement is bounded, limited to fine pointers in the desktop hero, and cleared on blur or visibility changes.

At widths through 1000 px the sculpture occupies the lower center of the hero, with a scale factor of 0.675 and a camera/target y offset of 2.98 in the opening composition. Desktop uses the right side. Interior frames fade to 20% opacity and rails to 15% as the work reading stage begins; the aperture approach retains the stronger foreground construction. The scene is a fixed, transparent, noninteractive layer at z-index 0; readable content must sit above it. The unfold copy has a dark backing where the close-up metal surfaces pass behind it. The contact backdrop leaves the closing assembly visible at a quieter contrast.

## Modes and resource ownership

- Full: DPR capped at 1.75, complete geometry and lighting, full path.
- Balanced: DPR capped at 1.25, smaller pointer offset, the same low-complexity geometry. Narrow layouts use a wider lens and lower hero composition.
- Static: matched hero poster and ordinary document navigation. The assembly inspector offers direct assembled/separated SVG states with explanatory text.

An active full-mode renderer can downgrade once after a window of 120 measured active frames contains more than 70 frames longer than 35 ms. The first 25 active frames are excluded, as are frame gaps of 120 ms or more. There is no automatic upgrade loop. This is conservative adaptation, not a claim about achieved frame rate.

Rendering stops when progress and pointer damping settle. Hidden documents cancel the queued frame; showing the document reconciles to current scroll. Cleanup removes all listeners and the resize observer, cancels animation frames, disposes unique geometries/materials/textures and the environment render target, disposes the renderer, and releases a live WebGL context. A partially failed initialization also releases its context. Disposal is idempotent.

The canvas exposes `data-quality`, `data-draw-calls`, `data-triangles`, `data-chapter-progress`, and `data-render-frames` for verification. There is no visible production frame-rate counter. Three's frame number includes environment precomputation; it should be compared across intervals rather than interpreted as the number of displayed frames since page load.

## Reproducing the standalone checks

Run from the repository root:

```sh
node scripts/verify-scene.mjs
node scripts/verify-scene.mjs --capture
node scripts/verify-scene.mjs --write-posters
```

The harness serves only the scene modules and fixed-height test sections on an ephemeral loopback port. It transpiles the local TypeScript using the installed compiler, serves the installed Three.js ES modules, and opens bundled Playwright Chromium. It does not start Next, submit forms, or request an external service.

`--capture` writes images and measurements to `docs/screenshots/scene-harness/`. `--write-posters` deliberately replaces the two public poster assets with alpha-preserving browser captures, converted by the installed Sharp package to WebP at quality 92 and alpha quality 100. Without that flag the harness does not modify production posters.

## Measured evidence — September 28, 2026

Conditions: Node 22.12.0 on Windows; host CPU Snapdragon X Elite X1E80100; Chromium 151.0.7922.34, headless, fresh browser context, DPR 1, no CPU or network throttling. The actual WebGL renderer reported **ANGLE / Vulkan / SwiftShader**, a software renderer. The machine's Adreno GPU was not the renderer measured by this harness.

These are isolated scene measurements, not production-page results:

| Composition | Viewport | Chapter coordinate | Draw calls | Triangles |
| --- | --- | --- | --- | --- |
| Hero | 1440 × 900 | 0.000 | 16 | 2,174 |
| Aperture approach | 1440 × 900 | 1.309 | 30 | 2,284 |
| Gallery | 1440 × 900 | 2.014 | 16 | 192 |
| Reverse to hero | 1440 × 900 | 0.000 | 16 | 2,174 |
| Lower hero composition | 390 × 844 | 0.000 | 16 | 2,174 |

The harness passed these assertions:

- Abrupt scroll to the gallery and reverse to the hero reconstruct the expected chapter state.
- The frame counter remains unchanged during a 600 ms idle interval.
- A simulated `document.hidden` change plus scroll produces no frames; resuming reconciles directly to the new position.
- A raycast over 400 consecutive camera segments, in each of the desktop and narrow compositions, finds no assembly intersections during the entrance. This tests the zero-parallax path at 401 sample positions, not every mathematically possible continuous state.
- Real `WEBGL_lose_context` injection invokes the failure callback.
- Calling the disposer twice is safe.
- Balanced mode at 390 × 844 and emulated device DPR 2 caps the drawing buffer to 487 × 1055, corresponding to DPR 1.25 with integer dimensions.
- No uncaught JavaScript errors occur.

The images under `docs/screenshots/scene-harness/` show the actual scene in this isolated environment. The public posters are `public/signature/hero-desktop.webp` (1440 × 900) and `hero-mobile.webp` (390 × 844), both transparent. `SignaturePoster.tsx` is an original vector illustration used only by the assembly inspector, not a claimed product screenshot.

## Coverage limits

At this checkpoint the standalone harness does **not** establish integrated-page typography, project-frame alignment, fallback/retry button interaction, full/balanced preference persistence, browser history across routes, production bundle size, LCP/CLS/INP, or real-device GPU frame rate. It does not certify Safari or iOS, actual background-tab throttling, every viewport, prolonged memory behavior, or every point along the continuous path. Integrated visual and browser testing is tracked separately in `docs/verification.md`; do not mark those items passed on the basis of this scene harness.

## Integrated development-page checks — September 29, 2026

The assembled application was then inspected at `http://localhost:3200` using Next's development server, Chromium 151, DPR 1, no network/CPU throttling, and the same SwiftShader renderer. Screenshots and raw observations are in `docs/screenshots/scene-integrated/`. These are development-page checks; the visible Next developer indicator in these captures is not a portfolio feature or production artifact.

| Viewport | Input emulation | Selected mode | Result |
| --- | --- | --- | --- |
| 1440 × 900 | Desktop | Full | Hero, unfold, work and contact inspected; no horizontal overflow or uncaught errors |
| 390 × 844 | Touch/mobile | Balanced | Lower hero model clears actions; four chapter compositions inspected; no horizontal overflow or uncaught errors |
| 768 × 1024 | Touch/mobile | Balanced | Lower model clears hero copy; four chapter compositions inspected; no horizontal overflow or uncaught errors |

All three contexts reconciled to chapter coordinates 0, 1, 2, and 5 when the corresponding native section offsets were selected. At 390 × 844, the revised hero sculpture spans approximately y = 511–768 while the action row ends at y = 501. At 768 × 1024 the sculpture spans approximately y = 625–939, below the actions. The metal silhouette, separated wing/spine depth, and contact reassembly are visible in actual application screenshots. The work rails are now subdued behind readable content.

The desktop integration check injected real context loss, found the visible fallback status, clicked **Retry graphics**, and confirmed the new canvas rendered successfully. The recovery control sits above the experience settings control and has a 44 px minimum button height. Selecting Static removed the graphics canvas and displayed the matching still. Essential page content remained available throughout. Hero caption positioning and production-page coverage remain the responsibility of the broader layout/verification pass.
