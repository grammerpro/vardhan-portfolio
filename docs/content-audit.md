# Content and public-source audit

Reviewed September 27, 2026. This is an implementation-evidence review, not an employment verification, security certification, or production benchmark. The master brief is a requested design direction; its suggested project descriptions were checked against current source before publication.

## Preserved identity and destinations

`src/config/site.ts` is the authoritative current identity configuration:

| Item | Preserved value | Evidence / treatment |
| --- | --- | --- |
| Name / role | Vardhan / Full stack engineer | Current owner-maintained configuration; no inflated title |
| Location | Cincinnati, Ohio | Configuration and `location-availability.md`; existing self-description |
| Email | vardhana1209@gmail.com | Configuration; contact remains directly accessible |
| LinkedIn | https://www.linkedin.com/in/sri-vardhan-7b5853184/ | Exact existing destination |
| GitHub | https://github.com/grammerpro | Exact existing destination |
| LeetCode | https://leetcode.com/u/sudovardhan/ | Exact existing destination |
| Résumé | `/resume`, `/resume.pdf` | Existing route and owner-supplied PDF retained |
| Fit Check | Existing Gemini-backed integration | Preserved with corrected disclosure and stale evidence excluded; see `integrations.md` |
| Contact | Existing Resend-backed server route | Preserved; delivery is not certified by this content review |

Employer names remain anonymized in the website copy, following the existing explicit comment in `src/config/site.ts` and corpus README. The original résumé PDF remains the owner-provided detailed document. No company code, client screenshots, or private work was copied into this redesign.

The redesigned `/resume` overview is server-rendered from the existing owner data, with exact role titles/date ranges, anonymized employer contexts, and selected implementation bullets. The existing “January 2025 to Present” wording is preserved as owner-maintained content, not independently confirmed current employment. The undergraduate year, age, expired/current certification claims, and unsupported numerical outcome claims are omitted from the new overview. PDF download and in-page reading remain available.

## Claim classes

- **Source-confirmed implementation:** a behavior found in inspected public code. This does not automatically establish that a deployment works.
- **Existing self-description:** identity, professional experience, dates, education, or availability supplied by the owner. Preserve without increasing years or inventing outcomes.
- **Needs owner verification:** stale or conflicting statements, current availability/certification status, authorship beyond the public project attribution, and measurable outcomes without evidence.

`public/data/resume.json` and the hand-maintained corpus contain “five years” of experience and “three years” of AEM. These are retained as existing owner wording, not automatically recomputed from dates. Current employment/availability and duration still need owner review. The résumé includes an undergraduate completion year of 2013; the redesign does not infer a corrected year. It lists DP-203 validity through July 2025, so the old corpus statement implying a currently valid certification is withheld. “AWS certification in progress” is not an awarded certification. The résumé and old gaps entry also disagree about Kubernetes; the redesign makes no new proficiency claim.

## Public repositories: exact destinations and revisions

All six links remain available through typed content and `/work/[slug]`. GitHub pages and current repository source were inspected. Read-only shallow clones were placed outside the portfolio in the Windows temporary directory. No public project source was modified, pushed, or deployed.

The `/projects` archive always starts from the same six audited records. The legacy Sanity connection is preserved for additional links with a bounded timeout and fallback. Known titles, aliases, and source repositories are deduplicated so remote legacy descriptions cannot replace the corrected local claims. Additional CMS descriptions and screenshots are not republished as evidence: those entries show neutral scope text and an unaudited label. Eight offline catalog checks cover the destination mapping, unavailable/malformed CMS data, URL safety, duplicate records, and suppression of unsupported descriptions. Production Chromium checks passed on October 1, 2026 at 1440 × 900, 390 × 844, and 360 × 800: all six projects, canonical URL, search, technology filter, reset, case navigation, browser back, and no horizontal overflow or page exceptions. All work and native search submission also worked with JavaScript disabled. Evidence: `docs/screenshots/archive/results.json`.

| Project | Preserved destination | Inspected commit |
| --- | --- | --- |
| Java Native RAG | https://github.com/grammerpro/Java-Native-RAG-System | `0c4a253fcb5a2006f9cbf3b2303e32ad1f036bcd` |
| Chroma Loop | https://github.com/grammerpro/Chroma-Loop | `90283a900cb7006c86d4957cfeea32f94bc1ff0b` |
| ANON Dapp | https://github.com/grammerpro/ANON-Dapp | `afed41e96364cbc5e1299d0576c0b4d828efc253` |
| Aura Landing | https://github.com/grammerpro/aura-landing | `e66b9cd06e30fca24bfdf443b3f0c6765ac475a2` |
| PDF Editor Tool | https://github.com/grammerpro/pdf-editor-tool | `0780bc239bdc0570904c80c52b36ab323d7719f1` |
| Blockchain Storage | https://github.com/grammerpro/BlockchainFileStorage | `726f7b47dc1543dd3e77b382a820771b86b197a4` |

### Java Native RAG

**Confirmed:** `backend/.../service/DataIngestionService.java` reads MedQuAD JSON into Spring AI Documents and adds them to `VectorStore`. `RAGService.java` requests the nearest four documents, joins their text as context, deduplicates source metadata, calls `ChatClient`, and returns an answer and source labels. `application.properties` configures OpenAI chat/embedding models and pgvector with PostgreSQL. A React/TypeScript frontend, Docker configuration, and Python RAGAS evaluation path are present.

**Corrected:** the former portfolio’s “fast local LLM” and documents-never-leave-the-machine claims are contradicted by the OpenAI provider configuration. It is an independent research prototype. The source contains a retrieval pipeline; it does not establish production readiness, clinical accuracy, measured latency, or improved quality.

**Limit:** `research/evaluate.py` passes returned source labels as RAGAS contexts, rather than retrieved text. Benchmark UI and scripts are not evidence of valid benchmark results. No paid model call, live ingestion, database deployment, or medical answer evaluation was performed for this redesign.

### Chroma Loop

**Confirmed:** `src/main.ts` requests a Canvas 2D context. `game.ts`, `ring.ts`, `drop.ts`, `input.ts`, `rng.ts`, `storage.ts`, `audio.ts`, and `ui.ts` implement an arcade game with a rotating colored ring, falling orbs, scoring, keyboard/pointer control, seeded sequences, local scores, and synthesized audio. Source and existing unit tests were reviewed.

**Corrected:** it is not the Three.js/GLSL ribbon experience described by the old gallery. The source date seed uses a fixed UTC−5 boundary; README wording about midnight UTC is not repeated. Scores are local, not a shared leaderboard.

**Local validation:** `npm ci --ignore-scripts`, `npm run build`, and `node node_modules/vitest/vitest.mjs run` succeeded in the isolated clone. Six test files / seventeen tests passed. The game-scoring tests report jsdom’s unimplemented Canvas warning and use their existing stub context. This is rule-level validation, not a renderer benchmark. The local production preview opened in Chromium and supplied the authentic screenshot. The README’s GitHub Pages URL failed DNS resolution in this environment, so the portfolio does not claim a verified public demo.

### ANON Dapp

**Confirmed:** `cryptoHelper.js` uses native AES-GCM encryption/decryption. `UploadPortal.jsx` reads files, encrypts, calls a Pinata helper or receives a simulated identifier, saves a local record, and constructs a URL-fragment share link. `SharePortal.jsx` parses the link, retrieves ciphertext, decrypts, and creates a downloadable Blob. `ipfsHelper.js` includes IndexedDB plus optional Pinata/gateway paths. `blockchainHelper.js` demonstrates a locally stored SHA-256 proof-of-work chain.

**Corrected:** there is no inspected Solidity contract, Ethereum transaction path, or zero-knowledge proof framework. The shard destinations and network dashboard are demonstrations. They are not distributed storage, peer measurements, or consensus evidence. The portfolio diagram names the local and optional remote paths explicitly.

**Limits:** local records contain an exported key alongside ciphertext. The optional Pinata token is stored in local storage, and upload metadata includes file information. A Pinata failure can fall back to local simulation. None of this establishes a secure production vault or confidentiality guarantees. Public source with crypto APIs does not certify application security.

**Local validation:** isolated dependency installation and production build succeeded. The installed dependency graph produced engine warnings for some lint packages under Node 22.12; no dependency changes were made to the public project. A Chromium local preview rendered without page exceptions. A disposable text fixture was used to exercise browser encryption and local persistence; exact round-trip results are recorded in `project-evidence-captures.json`. No wallet was connected, token configured, or public IPFS upload performed.

### Aura Landing

**Confirmed:** a single `index.html` implements the hero, feature grid, inline SVG icons, and newsletter form with Tailwind’s CDN script.

**Corrected:** no Next.js app is present. Product language is concept copy, not evidence of manufactured eyewear, AI functionality, weight, battery performance, or customers. No form delivery integration was found. No newsletter submission was made. The documented GitHub Pages demo could not resolve in the local environment.

### PDF Editor Tool

**Confirmed:** `edit_pdf.py` defines `argparse` subcommands and dispatches to merge/watermark/sign functions. Every operation function only prints a `[PLACEHOLDER]` message. No PDF read/write library is imported.

**Corrected:** the README’s editing claims and old portfolio React/PDF.js/WebCrypto claims overstate the code. It is now explicitly presented as an early Python CLI scaffold. An intended signature image is not a cryptographic signature or certificate validation.

**Local validation:** `python -X utf8 edit_pdf.py merge audit-a.pdf audit-b.pdf -o audit-merged.pdf` printed the placeholder; `Test-Path audit-merged.pdf` returned false. Running without UTF-8 first exposed a Windows cp1252 stdout error for the arrow character. The source was not edited. No working PDF editor or digital-signature result is claimed.

### Blockchain Storage

**Confirmed:** `app/views.py` saves uploads to a local directory and posts a metadata transaction to a local Flask peer. `Block.py` hashes block fields. `Blockchain.py` contains pending transactions, mining, predecessor checks, and random/incrementing nonce variants. `peer.py` exposes queue, chain, mining, and block endpoints.

**Corrected:** this is Python/Flask, not the old gallery’s Ethereum/Solidity/React/IPFS stack. An unused peer list does not establish functioning peer consensus or replication. Storing a transaction hash does not establish file confidentiality or tamper-proof file storage. README survey and security results were not independently established and are not repeated.

**Limit:** no multi-peer deployment, production storage, throughput, security, or confidentiality test was performed.

## Evidence-based feature selection

The brief permits changing its default three featured candidates when source evidence supports a stronger choice. Java Native RAG, Chroma Loop, and ANON Dapp are featured because each has a substantive implementation that can support a meaningful case study. PDF Editor remains accessible as a clearly labeled scaffold in the archive and its own route. Aura and Blockchain Storage also retain routes, source links, scope, decisions, and limits.

## Visual provenance

The old `public/images/java-rag.png`, `chroma-loop.png`, and `pdf-editor.png` do not match the inspected implementations. The Java image includes unrelated providers and unverified dashboard numbers; the PDF image depicts an interface absent from the source. All legacy files remain on disk for preservation but are not presented as implementation screenshots.

New diagrams in `public/images/evidence/*.svg` are original code-native illustrations generated by `scripts/generate-project-diagrams.mjs`. They are explicitly labeled source-based diagrams or scaffold illustrations. Their PNG renders provide social previews; they are not runtime measurements. DOM architecture explanations in each case study give an accessible text equivalent and a second implementation detail view.

`chroma-loop-screenshot.png` and `anon-dapp-screenshot.png` were captured from local production builds of the public revisions above. `scripts/capture-project-evidence.mjs` records the browser and viewport. Chroma is MIT-licensed in its repository. ANON’s README states MIT but no standalone LICENSE was present in the inspected tree; owner confirmation remains appropriate before relicensing or distributing the application itself. The portfolio contains only the owner’s project screenshot and explanatory material. No private application imagery was used.

## Fit Check consistency

The following source entries were corrected and marked `verified: false`: all six `project-*` files, `retrieval-rag`, `webgl-graphics`, `gaps-known`, and `education`. They are source-based draft corrections, not silently asserted owner-approved interview statements. This respects the existing corpus review gate. Other professional entries remain existing self-description, not independently verified employment facts.

`src/lib/fit.ts` excludes the same ten identifiers from the committed legacy `corpus.generated.json` at runtime. A body and vector are an inseparable pair: replacing only a body would retain an embedding for false text. No paid embedding rebuild was performed. The generated file is preserved until the owner reviews revised wording and intentionally runs `scripts/build-corpus.mjs`; after that, remove the corresponding withheld IDs only when their new body/vector pairs and `verified: true` state are confirmed. The tool remains available with the remaining professional evidence, with reduced coverage of independent projects until that review.

## Outstanding owner review

- Confirm professional duration, present employment, availability, education year, and current certification status.
- Confirm public repository scope/authorship and the revised project/capability corpus wording.
- Rebuild approved embeddings deliberately if broader Fit Check project coverage is wanted; do not remove the runtime exclusions while stale vectors remain.
- Confirm rights and attribution for any legacy assets before reusing them elsewhere. The redesigned evidence views use original diagrams and inspected project captures.
- Supply verified deployment/demo destinations or measured project outcomes if they should be displayed. No placeholder destination, fabricated result, or guessed handle was added.
