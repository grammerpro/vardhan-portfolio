# Preserved integrations

## Contact

`POST /api/contact` still uses Resend. Required server-only environment names are `RESEND_API_KEY` and `CONTACT_TO_EMAIL`; optional `CONTACT_FROM_EMAIL` selects a verified sender. The existing `Portfolio <onboarding@resend.dev>` fallback is retained and subject to Resend account restrictions. Local variable names exist, but credentials, domain verification, quotas, and actual email delivery were not certified. No test emails were sent.

The form only reports acceptance after a successful provider result and `{ "ok": true }` server response. Accepted means the provider accepted the request, not proof of delivery or a reply. Invalid input is blocked by native form validation and server validation; failures preserve typed content for retry. Direct email and all original social destinations remain available. Clipboard failure selects the address and announces instructions.

Name/email/message limits remain 100/200/5000 characters. The server bounds the raw request at 32 KiB, rejects non-object JSON and multi-line names, uses plain-text email bodies, filters a honeypot, and blocks overlapping requests per IP. Successful submissions consume a one-minute per-process window. Provider failures are logged only as generic events, without message bodies or raw provider errors.

## Fit Check

`POST /api/fit` preserves Google Gemini processing: the request text is sent for an embedding, compared with a committed local evidence corpus, then sent with selected evidence for a generated assessment. The provider was not changed. `GEMINI_API_KEY` stays server-side. The current generation model remains `gemini-2.5-flash`; the embedding model remains the one recorded in the generated corpus. Service/model availability was not tested against a live provider.

The UI explicitly discloses remote Google processing. This app does not intentionally persist job descriptions or log their bodies; this statement does not certify infrastructure/provider retention. The form asks visitors to omit confidential and personal information. There is no added telemetry.

The 6000-character limit remains, plus a 32 KiB raw request bound and strict string input. Empty, unrelated, unavailable, timeout, malformed upstream, interrupted stream, and retry states are handled. Partial/empty generation is never marked complete. Retrieved titles and identifiers remain visible; similarity is explained as an evidence ranking, not a fit percentage. The prompt requires evidence-backed matches and explicit gaps. AI output still requires human review.

Requests are limited to one active request per IP, with a 20-second completion window and a per-process daily ceiling of 300 attempts, including failed embedding attempts. A 15-second upstream timeout remains. These are best-effort in-memory controls; they reset on restart and do not coordinate serverless instances. They are not a durable billing cap. A production proxy or provider limit is needed for coordinated abuse control at scale. Client IP accuracy depends on the hosting proxy's trusted forwarding headers.

The evidence audit excludes 10 obsolete generated entries (all six projects plus retrieval, graphics, gaps, and education) where current evidence contradicts the old body. Their corrected source bodies await owner review and embedding regeneration; existing body/vector pairs are never mixed with revised bodies. No paid embedding regeneration was performed. See [content audit](content-audit.md) for exact evidence limitations.

## Verification

`node scripts/test-integrations.mjs` runs 36 offline checks by compiling actual route modules with isolated provider stubs. It uses fake environment variables, never imports `.env.local`, and makes no external requests. Coverage includes bounded/malformed/null input, missing configuration, successful provider contract, rejection/exception behavior, privacy of logs, concurrent requests, retry windows, out-of-scope retrieval, stream metadata, all content parts, last-line parsing, provider timeout, empty output, and stream errors.

`node scripts/test-integrations.mjs http://localhost:3200` additionally runs browser tests against the chosen local server. Every contact and fit API request is intercepted. It verifies invalid native submission, failure preserving content, successful retry, clipboard-denied fallback, fit error recovery, streamed evidence/answer, and empty-stream failure. Use a production build for final verification; no provider traffic is necessary.

The same browser pass checks that the preserved `/#fit` deep link opens its disclosure and focuses the content. It also checks résumé metadata, server-rendered content with JavaScript disabled, PDF availability, the embedded viewer, and print CSS. `/resume.pdf` remains the original owner-provided file. The HTML résumé uses existing owner-maintained experience and education; employer names remain anonymized and the conflicting undergraduate year/expired certification claims are not repeated.

Append `webkit` to run the same mocked UI checks in WebKit 26.5. Chromium 151 and WebKit 26.5 are available locally; this does not substitute for actual Safari/iOS device testing.

### Recorded development pass — September 29, 2026

- All 36 offline route checks passed.
- Browser assertions above passed in Chromium 151.0.7922.34 and WebKit 26.5 against the Next.js development server at `http://localhost:3200`. They used a 1280 × 800 viewport and reduced motion. All form API traffic was intercepted; no emails or Gemini calls were made.
- Résumé captures at 1440 × 900, 390 × 844, and 360 × 800 reported no horizontal overflow or page exceptions. The actual two-page A4 overview print was inspected; experience, skill groups, and education remain together without orphaned headings.
- Captures and print pages: `docs/evidence/resume/`. Their manifest labels development mode; final production verification should recapture after building.
- Live provider credentials/delivery, provider retention policy, model availability, real phone GPU performance, and real Safari/iOS remain unverified.
