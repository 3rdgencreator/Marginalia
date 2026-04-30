---
phase: "08"
plan: "04"
subsystem: admin-forms
tags: [admin, showcases, shopify, recordings, links, merch]
requirements: [D-07, D-09, D-16, D-17]

dependency_graph:
  requires:
    - "08-02 (server actions: addShowcaseRecording, updateShowcaseRecording, deleteShowcaseRecording, updateShowcase with merch_handles + links)"
    - "08-01 (schema: showcase_recordings table, links jsonb, merch_handles jsonb)"
  provides:
    - "Admin UI for managing recordings, custom links, and event merch per showcase"
    - "ShowcaseMerchPicker client component (reusable)"
    - "/api/admin/shopify-products internal route"
  affects:
    - "app/admin/(protected)/showcases/[slug]/page.tsx"
    - "app/admin/(protected)/showcases/new/page.tsx"

tech_stack:
  added: []
  patterns:
    - "Client component fetching internal admin API on mount (async checkbox list)"
    - "Parallel form arrays: link_label[] + link_url[] submitted with main form"
    - "Separate per-row forms for recordings (update + delete) outside main form"
    - "auth() guard on admin API routes matching fetch-release pattern"

key_files:
  created:
    - components/admin/ShowcaseMerchPicker.tsx
    - app/api/admin/shopify-products/route.ts
  modified:
    - app/admin/(protected)/showcases/[slug]/page.tsx
    - app/admin/(protected)/showcases/new/page.tsx

decisions:
  - "Links repeater uses static 'always one empty row' approach rather than dynamic client-side add/remove — avoids client component complexity in server-component admin page while honoring D-07 (label+url parallel arrays)"
  - "Recordings save/delete use separate per-row forms outside main <form action={update}> — mirrors existing photo gallery pattern"
  - "Links + Merch sections placed inside main <form action={update}> so they submit with Save Changes"
  - "Auth guard added to /api/admin/shopify-products per T-08-04-01 threat — mirrors fetch-release pattern"

metrics:
  duration: "~15 minutes"
  completed: "2026-04-30"
  tasks_completed: 2
  files_modified: 4
---

# Phase 08 Plan 04: Admin Form Layer (Recordings + Links + Merch) Summary

**One-liner:** Admin showcase edit form now has Recordings manager (per-row save/delete forms), custom Links repeater (parallel arrays in main form), and Event Merch picker (async Shopify checkbox list) — soundcloudSetUrl removed from both edit and new forms.

---

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ShowcaseMerchPicker + API route | 07f5a60 | components/admin/ShowcaseMerchPicker.tsx, app/api/admin/shopify-products/route.ts |
| 2 | Update admin edit + new pages | 07f5a60 | app/admin/(protected)/showcases/[slug]/page.tsx, app/admin/(protected)/showcases/new/page.tsx |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Security] Added auth guard to /api/admin/shopify-products**
- **Found during:** Task 1 — threat model T-08-04-01 called out elevation of privilege risk
- **Issue:** Plan action spec showed the route without auth check, but the existing /api/admin/fetch-release pattern includes `auth()` guard returning 401 for unauthenticated requests; the (protected) layout auth only covers /admin/* UI pages, not /api/admin/* routes
- **Fix:** Added `import { auth } from '@/auth'` and session check before returning product list
- **Files modified:** app/api/admin/shopify-products/route.ts
- **Commit:** 513c12e

---

## Known Stubs

None — all sections are wired to live server actions and real data queries.

---

## Threat Flags

None beyond those already in the plan's threat model. T-08-04-01 was mitigated (auth guard added). T-08-04-02, T-08-04-03, T-08-04-04 accepted per plan.

---

## Self-Check: PASSED

- FOUND: components/admin/ShowcaseMerchPicker.tsx
- FOUND: app/api/admin/shopify-products/route.ts
- FOUND: commit 07f5a60
- FOUND: commit 513c12e
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0 (1 pre-existing Turbopack warning, no errors)
