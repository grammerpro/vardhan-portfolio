# Inside the System — design system

The central object is an original asymmetric V assembly: two beveled aluminum wings, recessed dark spine, glass insert, fine amber line, selective fasteners. The same geometry separates on approach, reveals an open passage, becomes a structure around the exhibits, and returns beside contact. Camera coordinates and measured chapter offsets live separately from rendering in `src/lib/scene-path.ts`.

## Type and colour

Archivo is the existing open-license display face, now also used for body copy. Geist Mono is reserved for annotations. Both are self-hosted by Next/font; no browser request goes to Google Fonts. OFL notices are in `public/licenses/`. Body measure is kept near 55–70 characters, with 16px minimum primary mobile prose. The name remains the principal identity.

| Role | Token |
| --- | --- |
| Warm paper | `#E9E6DF` |
| Dark text | `#151719` |
| Scene | `#111315` |
| Recessed surface | `#1A1E22` |
| Light text | `#F4F1EA` |
| Supporting dark-surface text | `#ADB3B8` |
| Signal accent on dark | `#EEAE62` |
| Signal text/focus on paper | `#99571E` / `#96511A` |
| Secondary annotation | `#92BCCB` |

Amber is used as an accent on dark surfaces, not small text on paper. Focus uses the dark amber on paper and light amber on dark. Muted text is kept distinct from purely decorative low-contrast rules.

## Composition

The desktop opening places readable editorial content at left and the sculpture at right. At 1000px and below the composition stacks: content and links first, sculpture below. Projects form three distinct exhibits with inspectable source-based diagrams and a bounded colour/ring interaction. The archive is an editorial list. The systems view uses a deliberate four-node diagram with a stable detail panel and a full text disclosure. About returns to paper; contact returns to the quiet dark scene.

The layout uses fluid 4.5vw outer margins capped at 86px and 22px on phones, thin rules, and restrained rectangular controls. High-contrast HTML text stays separate from graphics. The main header remains readable on its own paper surface. Native scrolling, normal anchor links, browser history and direct case routes remain authoritative.

## Motion and controls

No entry gate, autoplay audio, custom pointer, kinetic type, or FPS overlay. The canvas renders only while changing or settling, pauses when hidden, and disposes on route teardown. Hover feedback lasts roughly 180ms; the graphics appearance uses a short fade. A visible Reduce motion action and experience selector support Full, Balanced, Static and reset-to-device settings. Storage failure keeps preferences usable for the session.

Static mode and missing WebGL retain the exact renderer-captured hero plate, all content and routes, and an accessible separate/reassemble illustration. Default reduced motion is checked before loading the renderer. Selecting a mode explicitly can override the device default; resetting reinstates it.

Primary implementation: `src/app/portfolio.css`, `src/app/responsive.css`, `src/components/portfolio/`, `src/components/experience/`. Case studies, archive and résumé keep scoped styles. Measurements, browser coverage, contrast review and remaining limitations are in `verification.md`.
