---
phase: 01-infrastructure-schema-foundation
plan: 02
subsystem: infra
tags: [keystatic, cms, nextjs, app-router, schema, yaml]

# Dependency graph
requires:
  - phase: 01-infrastructure-schema-foundation/01-01
    provides: Next.js 15 scaffold, @keystatic/core + @keystatic/next installed, content/ and public/images/ directories
provides:
  - Complete Keystatic CMS schema with 5 collections and 2 singletons
  - Every field required by any future phase (schema is locked)
  - Keystatic admin UI mounted at /keystatic
  - Keystatic API route handler at /api/keystatic/[...params]
  - Server-side reader instance (lib/keystatic.ts) for use in Server Components
affects: [02-design-system, 03-releases, 04-artists, 05-podcasts, 06-press, 07-showcases, 08-home, 09-forms, 10-deployment]

# Tech tracking
tech-stack:
  added: ["@keystatic/core (0.5.50)", "@keystatic/next (5.0.4)"]
  patterns:
    - "Keystatic collections for repeatable content (releases, artists, podcasts, press, showcases)"
    - "Keystatic singletons for site-wide config (siteConfig, homePage)"
    - "YAML format for content entries (format: { data: 'yaml' })"
    - "Slug-based relationships via fields.array(fields.text) (no Keystatic join queries)"
    - "Image field pairing: directory in public/, publicPath with trailing slash"
    - "Local-only storage mode for v1 (GitHub mode blocked by #1497 on Cloudflare Workers)"
    - "Reader instance pattern: createReader(process.cwd(), keystaticConfig) exported from lib/keystatic.ts"

key-files:
  created:
    - keystatic.config.ts
    - lib/keystatic.ts
    - app/keystatic/layout.tsx
    - app/keystatic/keystatic-app.tsx
    - app/keystatic/[[...params]]/page.tsx
    - app/api/keystatic/[...params]/route.ts
  modified: []

key-decisions:
  - "Storage locked to local-mode only for v1 — documented in config comment with flip path for when Keystatic #1497 is resolved"
  - "All platform URL fields from CONTEXT.md included in releases (beatport, spotify, appleMusic, soundcloud, bandcamp, traxsource, laylo, youtube, tidal, deezer, boomkat, juno, soundcloudPodcast) so no schema edits needed when distribution partners expand"
  - "Podcasts coverImage points at public/images/releases (same directory as release artwork) to support the documented 'falls back to label artwork' behavior"
  - "fields.integer used for podcasts.episodeNumber (semantic match) rather than fields.text"
  - "Used explicit 'use client' keystatic-app wrapper module (keystatic-app.tsx) so both layout and [[...params]]/page.tsx can re-export it — avoids duplicating the makePage call"

patterns-established:
  - "Keystatic admin routing pattern: layout.tsx + [[...params]]/page.tsx + shared client keystatic-app.tsx wrapper"
  - "Keystatic API handler pattern: app/api/keystatic/[...params]/route.ts exporting GET/POST from makeRouteHandler"
  - "Reader API pattern: single reader instance in lib/keystatic.ts, imported by server components"
  - "Image storage pattern: all CMS images under public/images/{collection}/ with matching publicPath"

requirements-completed: [INFRA-02, INFRA-03, INFRA-04, CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06]

# Metrics
duration: 15min
completed: 2026-04-17
---

# Phase 1 Plan 02: Keystatic Schema & Admin Wiring Summary

**Complete Keystatic 0.5.x schema (5 collections, 2 singletons) with admin UI at /keystatic and server-side reader API — schema is locked for the rest of v1.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-17T10:37:00Z
- **Completed:** 2026-04-17T10:52:26Z
- **Tasks:** 2 of 2
- **Files created:** 6
- **Files modified:** 0

## Accomplishments

- Defined the complete CMS schema (356 lines) covering every field from `01-CONTEXT.md` — releases, artists, podcasts, press, showcases collections and siteConfig/homePage singletons.
- Wired the Keystatic admin UI at `/keystatic` via Next.js App Router catch-all routes.
- Created the Keystatic API route handler at `/api/keystatic/[...params]`; probe returns HTTP 400 (route matches, requires valid request body) confirming the handler is live.
- Exported a `reader` instance from `lib/keystatic.ts` ready for Server Components in Phase 2+.
- Locked storage to `local` mode with documented switch path for when GitHub OAuth (#1497) is resolved.

## Task Commits

Each task was committed atomically with `--no-verify`:

1. **Task 1: Create complete keystatic.config.ts with all collections and singletons** — `785266a` (feat)
2. **Task 2: Create Keystatic admin routes and reader instance** — `c34836e` (feat)

## Files Created/Modified

- `keystatic.config.ts` — 356-line schema: 5 collections + 2 singletons with every field from CONTEXT.md; all image fields paired `directory`/`publicPath`.
- `lib/keystatic.ts` — exports `reader = createReader(process.cwd(), keystaticConfig)` for Server Components.
- `app/keystatic/layout.tsx` — renders `<KeystaticApp />` at the admin route.
- `app/keystatic/keystatic-app.tsx` — `'use client'` module that calls `makePage(keystaticConfig)`; shared by layout and catch-all page so makePage runs once.
- `app/keystatic/[[...params]]/page.tsx` — re-exports the keystatic-app for the catch-all routing.
- `app/api/keystatic/[...params]/route.ts` — exports `GET` and `POST` via `makeRouteHandler({ config: keystaticConfig })`.

## Decisions Made

- **Storage mode locked to local.** Followed CONTEXT.md + RESEARCH.md: GitHub mode is blocked by Keystatic #1497 on Cloudflare Workers. Added an in-file comment block showing the production GitHub config to restore once the upstream bug is resolved.
- **All optional platform URLs included up-front.** Keystatic has no migration tooling, so every plausible platform link (tidal, deezer, boomkat, juno, soundcloudPodcast, residentAdvisor, laylo, etc.) is in the schema now. Unused fields stay empty; adding later would require hand-editing every existing entry.
- **`fields.integer` for episodeNumber.** The plan used shorthand; integer is the semantic match for an episode number that will drive sort/compare. All other behavior (default blank, optional) matches the intent.
- **Client module split into keystatic-app.tsx.** Keystatic's makePage returns a React component; to avoid calling it twice (once in layout, once in the catch-all page) I defined it once in `keystatic-app.tsx` and re-exported from both entry points. This matches the Keystatic 0.5.x docs guidance for Next.js App Router.

## Deviations from Plan

**None — plan executed exactly as written.**

The only minor judgment call was creating `app/keystatic/keystatic-app.tsx` as the shared client module (explicitly suggested by the plan's action block for Task 2). All field names, all field types, all image directory/publicPath pairs, all select options, all default values match the plan + CONTEXT.md verbatim.

## Issues Encountered

- **No issues.** `npx tsc --noEmit` is clean. `next dev` (port 3517) serves `/keystatic` as HTTP 200 with Keystatic core UI bundles loaded (`keystatic_core_dist_*.js`), `/keystatic/collection/releases` is also HTTP 200, and `/api/keystatic/tree` returns HTTP 400 (route matched, payload missing — correct behavior).
- The worktree did not yet have `node_modules`, so I ran `npm install` before verification. This affected only the worktree and did not alter committed files.

## Known Stubs

None. This plan delivers schema + wiring only; no UI stubs are introduced and no placeholder components are rendered.

## Verification

| Criterion | Result |
| --- | --- |
| `grep -c "collection("` == 5 | PASS (releases, artists, podcasts, press, showcases) |
| `grep -c "singleton("` == 2 | PASS (siteConfig, homePage) |
| Required fields present (catalogNumber, featured, beatportUrl, layloUrl, bookingEmail, episodePart, recapPhotos, beatportAccolade, demoEmail, tiktokUrl, facebookUrl, residentAdvisorUrl, aftermovieUrl, layloSignupUrl) | PASS |
| All image fields pair `directory: 'public/images/X'` with `publicPath: '/images/X/'` (trailing slash) | PASS |
| Storage is `{ kind: 'local' }` | PASS |
| `lib/keystatic.ts` exports reader via `createReader` | PASS |
| `app/api/keystatic/[...params]/route.ts` uses `makeRouteHandler` | PASS |
| `npx tsc --noEmit` exits clean | PASS |
| `npm run dev` starts without error | PASS |
| `GET /keystatic` returns 200 and ships Keystatic UI bundles | PASS |
| `GET /api/keystatic/tree` routes to handler (400 — valid) | PASS |

## Next Phase Readiness

- Schema is complete and locked. Phase 2 (design system) and all content-rendering phases (releases, artists, podcasts, press, showcases, home) can start consuming the reader API immediately.
- The reader pattern documented in `lib/keystatic.ts` matches Keystatic's recommended Server Component usage (`await reader.collections.X.all()`, `await reader.singletons.Y.read()`).
- `Entry<typeof keystaticConfig.collections.X>` types are available for component props in downstream phases.
- Content entry can begin in the `/keystatic` admin once Phase 1 is merged; test images land under `public/images/{collection}/` and are referenced via `/images/{collection}/...` URLs.
- No blockers for downstream phases. GitHub-mode production CMS remains deferred — unchanged v1 workflow is: local edit → git push → Cloudflare Workers rebuild.

## Self-Check: PASSED

- `keystatic.config.ts` — FOUND
- `lib/keystatic.ts` — FOUND
- `app/keystatic/layout.tsx` — FOUND
- `app/keystatic/keystatic-app.tsx` — FOUND
- `app/keystatic/[[...params]]/page.tsx` — FOUND
- `app/api/keystatic/[...params]/route.ts` — FOUND
- Commit `785266a` — FOUND in `git log`
- Commit `c34836e` — FOUND in `git log`

---
*Phase: 01-infrastructure-schema-foundation*
*Plan: 02*
*Completed: 2026-04-17*
