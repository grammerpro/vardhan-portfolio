# Redesign baseline

Captured September 27, 2026 before implementation changes. The original source remains in git. No messages, fit requests, or external mutations were submitted during this audit.

## Environment and build

- Windows 11 Home 10.0.26200; Snapdragon X Elite X1E80100 CPU; Qualcomm Adreno X1-85 GPU.
- Existing Next.js 15.4.10 / React 19.1.0 / TypeScript / npm project.
- `npm run build` passed. Existing warnings: four unused variables in `ScrollToTopRocket.tsx`, old Browserslist dataset, parent and project package lockfiles.
- Existing homepage build report: 14.4 kB route; 167 kB first-load JS. These are Next build estimates, not measured transfer or performance results.
- Existing routes: `/`, `/projects`, `/resume`, `/api/contact`, `/api/fit`, `/robots.txt`, `/sitemap.xml`.
- Local production server: `node node_modules/next/dist/bin/next start -p 3100`.

## Actual browser captures

Playwright Chromium 151.0.7922.34, headless, fresh contexts, device scale 1, reduced motion, no network/CPU throttling; 1440 × 900 and 390 × 844. Both local production and `https://vardhansudo.me` returned 200 and had no page exceptions in these captures. Browser emulation does not establish real phone GPU behavior. Timing and FPS were not measured.

Capture script: `scripts/capture-baseline.mjs`; detailed links, sections, browser version and timestamps: `docs/evidence/baseline/local-capture.json` and `live-capture.json`.

| View | Local before | Live before |
| --- | --- | --- |
| Desktop hero | [Image](evidence/baseline/local-desktop-hero.png) | [Image](evidence/baseline/live-desktop-hero.png) |
| Phone hero | [Image](evidence/baseline/local-mobile-hero.png) | [Image](evidence/baseline/live-mobile-hero.png) |
| Desktop work | [Image](evidence/baseline/local-desktop-work.png) | [Image](evidence/baseline/live-desktop-work.png) |
| Phone work | [Image](evidence/baseline/local-mobile-work.png) | [Image](evidence/baseline/live-mobile-work.png) |
| Desktop contact | [Image](evidence/baseline/local-desktop-contact.png) | [Image](evidence/baseline/live-desktop-contact.png) |
| Phone contact | [Image](evidence/baseline/local-mobile-contact.png) | [Image](evidence/baseline/live-mobile-contact.png) |

Full-page and fit captures are in the same evidence directory. Actual local hero includes a wireframe block structure with oversized Vardhan typography on warm paper; phone layout stacks structure, positioning, name, and work link. Navigation switches to a Menu button. Existing work has a horizontal presentation, while fit and contact use conventional labeled forms. Reduced-motion captures retain complete text and links. This is the observed current repository, beyond the older typographic-only description in the brief.

## Preservation checklist

- Identity and exact email `vardhana1209@gmail.com`; location Cincinnati, Ohio; existing full stack engineer positioning.
- LinkedIn `https://www.linkedin.com/in/sri-vardhan-7b5853184/`, GitHub `https://github.com/grammerpro`, LeetCode `https://leetcode.com/u/sudovardhan/`.
- All six repository destinations from the existing work gallery and `/projects` listing.
- Existing direct links `#hero`, `#positioning`, `#work`, `#capability`, `#fit`, `#about`, `#contact`, plus `/resume`.
- Résumé route and print behavior; source-controlled résumé document(s) where present.
- Contact endpoint sends through Resend; preserve provider, sender/recipient configuration, reply-to, input limits, bot trap, truthful acceptance/failure states, and typed content on failures.
- Fit endpoint sends pasted descriptions to Google Gemini for embedding and generation, using a committed evidence corpus and local similarity retrieval. Preserve provider, 6000-character input limit, evidence display, gaps, errors, and résumé/work fallback.
- Preserve employer anonymization; audit stale project descriptions before carrying them forward.

## Integration audit and limitations

Configuration names `GEMINI_API_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` were found locally; their values were not printed or copied. Presence does not prove provider validity or successful delivery.

Contact already waits for the Resend result before success, retains fields on failure, and offers direct email. Existing copy button silently fails if clipboard access is denied. Null JSON could throw in the contact route; request bodies were not bounded before parsing, provider errors could enter logs, and overlapping requests could bypass completion-only rate controls. These are local hardening candidates.

Fit originally displayed “Not logged, not stored” despite remote Gemini processing. The application does not intentionally persist submitted descriptions, but provider retention is not audited; the redesign should disclose remote processing without making an absolute provider storage promise. Existing source/corpus accuracy is being reviewed separately. No live provider calls were made to certify model availability, retrieval quality, quota, or email delivery.

Chromium is runnable. The cached Firefox/WebKit revisions were incompatible with installed Playwright. WebKit 26.5 was subsequently installed and successfully opened the baseline; Firefox remains unavailable without installing its matching revision. Real Safari/iOS hardware is unavailable in this environment.
