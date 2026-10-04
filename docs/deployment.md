# Deployment and rollback

The redesign is maintained on the `redesign/instrument` review branch. The owner authorized pushing the source to GitHub on October 4, 2026. Production promotion and DNS changes are separate actions; follow the hosting instructions when a production release is authorized.

## Existing hosting

The repository remote is `https://github.com/grammerpro/vardhan-portfolio.git`. A read-only request to `https://vardhansudo.me` returned HTTP 200 with `Server: Vercel` and an `x-vercel-id` header during this review. Preserve that existing Vercel project and domain. No local `.vercel` project-link metadata was present; the team/project identifier and production branch were not inspected, so do not create a replacement project by guessing.

The Git repository root is `my-portfolio` (it contains `.git` and `package.json`), although its parent workspace is named `Vardhan Personal Website`. For this repository the app is at the Git root. Keep the current Vercel root-directory setting unless the remote layout actually differs. The application requires a Next.js server runtime for `/api/contact` and `/api/fit`; a static export would remove those integrations.

## Prepare a review build

From the directory containing `package.json`:

```powershell
npm ci
npm run build
node node_modules/next/dist/bin/next start --port 3200
```

Use the package scripts and verification commands in the current README. The explicit Node command above avoids PowerShell/npm argument-forwarding differences. No production credentials are needed to inspect the portfolio, project routes, or résumé. API tests use mocks and must not send test email or make paid model calls without owner authorization.

Copy `.env.example` to `.env.local` for local provider configuration. Do not commit the filled file. Required server-only names are `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `GEMINI_API_KEY`; `CONTACT_FROM_EMAIL` selects the existing account’s verified sender. Credential presence does not certify quotas, provider availability, sender verification, or delivery. Configure Preview and Production values separately in the existing Vercel project. A preview should use approved test infrastructure or leave provider variables unset and show the existing unavailable states.

`next/font` self-hosts the emitted fonts, but its current Google-font imports may need network access during a fresh build. Keep the lockfile. The preserved optional Sanity connection does not introduce a new environment variable; do not invent CMS tokens. Keep the existing public project/dataset configuration. The `/projects` route always includes the audited local work and gracefully omits unavailable additional CMS records.

Before a publication decision, review `docs/verification.md`, `docs/redesign-comparison.md`, and `docs/content-audit.md`. In particular, ten stale Fit Check body/vector pairs are deliberately withheld. Do not remove that guard simply to increase evidence coverage. Approve corrected corpus text before intentionally rebuilding its provider embeddings.

## Publish through the existing project

After explicit owner authorization, use the existing repository connection to create a preview deployment in the current Vercel project. Check its diff, build log, environment scope, and visible routes before choosing a production promotion. Vercel supports Git-connected deployments and explicit preview promotion; retain the current project instead of changing DNS. See [Git deployments](https://vercel.com/docs/git) and [promoting a deployment](https://vercel.com/docs/deployments/promoting-a-deployment).

On the preview, directly refresh `/`, `/projects`, `/resume`, and every `/work/[slug]` route. Check `/resume.pdf`, the social preview images, `/sitemap.xml`, `/robots.txt`, the reduced-motion/static mode, phone layout, and keyboard navigation. Use approved mocks for form behavior. Any real email or Gemini test needs owner authorization because it sends data to an external provider. Keep the preview from being indexed using the existing Vercel preview protection/indexing settings; production canonical URLs intentionally remain `https://vardhansudo.me`.

Record the current known-good production deployment URL/ID and commit before promotion. Production must retain the existing runtime environment values. In-memory abuse controls in both APIs reset across process restarts and are not shared across serverless instances; preserve any existing platform protection, and review provider quotas before enabling public traffic. The redesign adds no new telemetry or paid provider.

## Roll back

If the authorized production release has a regression, select the prior eligible production deployment in the existing Vercel dashboard and use Instant Rollback. Confirm that `vardhansudo.me` is among the affected domains, then verify the homepage, résumé, and API configuration after routing returns. The rollback routes to an earlier build; it does not regenerate its environment or undo changes at Resend, Gemini, or a CMS. Vercel also changes automatic production-domain assignment after a rollback, so follow its documented recovery flow before the next release. See [Instant Rollback](https://vercel.com/docs/instant-rollback).

Keep the previous deployment and Git history available. Do not reset the local working tree or delete prior deployments as a rollback strategy. This redesign does not require a database migration, new external account, domain replacement, or DNS change.
