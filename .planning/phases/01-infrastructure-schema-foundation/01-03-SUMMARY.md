---
phase: 01-infrastructure-schema-foundation
plan: 03
subsystem: infra
tags: [opennextjs, cloudflare-workers, build-pipeline, keystatic, cms-docs]

# Dependency graph
requires:
  - phase: 01-infrastructure-schema-foundation/01-02
    provides: Keystatic schema + admin routes, Next.js 15 scaffold
provides:
  - "OpenNext Cloudflare build verified (.open-next/worker.js + assets/)"
  - "open-next.config.ts with correct cloudflare-node wrapper and dummy caches"
  - "Image path end-to-end confirmed: public/images/releases/ -> /images/releases/ (HTTP 200)"
  - "CMS workflow documentation for content managers (Fabio and ELIF)"
  - "Updated app/page.tsx placeholder: Marginalia / Coming soon"
affects: [02-design-system, all-content-phases]

# Tech tracking
tech-stack:
  added: ["open-next.config.ts (cloudflare-node wrapper, edge converter, dummy caches)"]
  patterns:
    - "OpenNext config: cloudflare-node wrapper + edge converter + proxyExternalRequest fetch + dummy caches"
    - "edgeExternals: [node:crypto] required by @opennextjs/cloudflare validation"

key-files:
  created:
    - open-next.config.ts
    - CMS-WORKFLOW.md
  modified:
    - app/page.tsx

key-decisions:
  - "open-next.config.ts is required (not optional) for @opennextjs/cloudflare build — missing file causes exit code 13"
  - "Validation in ensure-cf-config.js requires exactly: cloudflare-node wrapper, edge converter, proxyExternalRequest fetch, dummy caches for all three (incrementalCache, tagCache, queue), edgeExternals with node:crypto, and external middleware"
  - "Image path verification done via live dev server: test-image placed at public/images/releases/, curl to /images/releases/ returned HTTP 200, then cleaned up"

requirements-completed: [INFRA-01, INFRA-04, INFRA-05]

# Metrics
duration: ~12min
completed: 2026-04-17
---

# Phase 1 Plan 03: OpenNext Build Verify + CMS Documentation Summary

**OpenNext Cloudflare build pipeline verified end-to-end with open-next.config.ts; image path pairing confirmed HTTP 200; CMS workflow documented for content managers.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-17T13:08:00Z
- **Completed:** 2026-04-17T13:20:00Z
- **Tasks completed:** 2 of 3 (Task 3 is checkpoint:human-verify — awaiting approval)
- **Files created:** 2
- **Files modified:** 1

## Accomplishments

- OpenNext Cloudflare build runs successfully: `npx @opennextjs/cloudflare build` exits 0, producing `.open-next/worker.js` and `.open-next/assets/`.
- Image path pairing verified: test PNG placed at `public/images/releases/test-image.png`, confirmed accessible at `http://localhost:3000/images/releases/test-image.png` (HTTP 200), then removed.
- Updated `app/page.tsx` to the Phase 1 final placeholder: "Marginalia / Coming soon" with Tailwind layout.
- Created `CMS-WORKFLOW.md` (78 lines) documenting the full local-mode Keystatic workflow for Fabio and ELIF: prerequisites, daily edit/publish cycle, all 5 collections and 2 singletons, image guidelines, and troubleshooting table.

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| Task 1 | OpenNext build verified, image paths confirmed, page.tsx updated | `1652039` |
| Task 2 | CMS-WORKFLOW.md created for content managers | `6e15307` |

## Files Created/Modified

- `open-next.config.ts` — OpenNext config with cloudflare-node wrapper, edge converter, dummy caches, edgeExternals node:crypto; required for `@opennextjs/cloudflare build` to succeed.
- `app/page.tsx` — Updated placeholder: `<h1>Marginalia</h1><p>Coming soon</p>` with Tailwind flex layout.
- `CMS-WORKFLOW.md` — 78-line workflow doc covering: prerequisites, start server, edit content (all 5 collections + 2 singletons), git commit/push publish, image guidelines (1200x1200, JPEG/WebP, 500KB), important notes, troubleshooting table.

## Decisions Made

- `open-next.config.ts` was not in the original project files (Wave 1/2 did not create it). The `@opennextjs/cloudflare build` CLI requires it — auto-created as Rule 3 (blocking issue).
- The config validation in `ensure-cf-config.js` is strict: requires `proxyExternalRequest: "fetch"` in `default.override` (not just middleware), `edgeExternals: ["node:crypto"]`, and all three cache fields set to `"dummy"`. Config iterated twice to match all requirements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Missing open-next.config.ts**
- **Found during:** Task 1 (OpenNext build)
- **Issue:** `npx @opennextjs/cloudflare build` exited with code 13 — `open-next.config.ts` required but not present.
- **Fix:** Created `open-next.config.ts` with the exact config shape required by `ensure-cf-config.js` validation: `cloudflare-node` wrapper, `edge` converter, `proxyExternalRequest: "fetch"`, `incrementalCache/tagCache/queue: "dummy"`, `edgeExternals: ["node:crypto"]`, external middleware.
- **Files modified:** `open-next.config.ts` (created)
- **Iterations:** 2 (first attempt missing `proxyExternalRequest` in default.override and `edgeExternals`)
- **Commit:** `1652039`

## Checkpoint Status

Task 3 is `type="checkpoint:human-verify"` — execution paused. Human verification of the full Phase 1 stack is required before this plan is marked complete.

## Known Stubs

None. `app/page.tsx` shows "Coming soon" which is the intentional Phase 1 placeholder — not a data stub.

## Threat Flags

None. No new network endpoints, auth paths, or trust boundaries introduced in this plan beyond what was already in the threat model.

## Self-Check

- `open-next.config.ts` — FOUND
- `CMS-WORKFLOW.md` — FOUND
- `app/page.tsx` — updated (FOUND)
- `.open-next/worker.js` — FOUND (build output, not committed)
- `.open-next/assets/` — FOUND (build output, not committed)
- Commit `1652039` — FOUND in git log
- Commit `6e15307` — FOUND in git log

## Self-Check: PASSED

---
*Phase: 01-infrastructure-schema-foundation*
*Plan: 03*
*Completed (partial — checkpoint pending): 2026-04-17*
