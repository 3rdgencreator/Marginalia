---
phase: "08"
plan: "02"
subsystem: "server-actions"
tags: ["drizzle", "server-actions", "queries", "recordings", "merch", "links"]
dependency_graph:
  requires:
    - "08-01 (showcase_recordings table + merch_handles/links columns on showcases)"
  provides:
    - "addShowcaseRecording / updateShowcaseRecording / deleteShowcaseRecording server actions"
    - "createShowcase / updateShowcase write merch_handles and links"
    - "getShowcaseRecordings(showcaseId) query sorted by sort_order ASC"
  affects:
    - "lib/db/actions/showcases.ts"
    - "lib/db/queries.ts"
tech_stack:
  added: []
  patterns:
    - "formData.getAll() for multi-value merch_handles checkboxes"
    - "Parallel form array parsing (link_label[] + link_url[]) via parseLinks helper"
    - "Blank-row insert pattern for recording add (matches addShowcasePhoto)"
key_files:
  created: []
  modified:
    - "lib/db/actions/showcases.ts"
    - "lib/db/queries.ts"
decisions:
  - "addShowcaseRecording inserts a blank row (url='', title='') matching the addShowcasePhoto pattern; admin edits in-place via updateShowcaseRecording"
  - "parseLinks reads parallel link_label[]/link_url[] arrays and zips them into {label,url}[] — order preserved as per D-07"
  - "formInt imported from utils (already existed) for sortOrder parsing in updateShowcaseRecording"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-30"
  tasks_completed: 2
  files_modified: 2
  commits: 1
requirements:
  - D-07
  - D-09
  - D-10
---

# Phase 08 Plan 02: Server Actions + Queries — Recordings, Merch Handles, Links

**One-liner:** Extended showcase server actions with recording CRUD (addShowcaseRecording/updateShowcaseRecording/deleteShowcaseRecording) and merch_handles/links write support; added getShowcaseRecordings query sorted by sort_order ASC.

---

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Update lib/db/actions/showcases.ts — recordings CRUD + links/merch in create/update | `110a031` | Done |
| 2 | Add getShowcaseRecordings to lib/db/queries.ts | `110a031` | Done |

---

## Deviations from Plan

None — plan executed exactly as written. Both tasks were straightforward additions to existing patterns with no blocking issues or bugs encountered.

---

## Known Stubs

None. All new functions are fully wired to the DB. Recording rows created via `addShowcaseRecording` start with empty url/title strings — this is intentional (admin edits in-place), not a data stub.

---

## Threat Surface Scan

No new network endpoints or auth paths introduced. All new server actions (`'use server'`) are accessible only from admin UI routes protected by auth middleware, consistent with T-08-02-01 mitigation. No PII handled — merch handles are public Shopify product handles (T-08-02-03 accepted).

---

## Self-Check: PASSED

- lib/db/actions/showcases.ts: FOUND
- lib/db/queries.ts: FOUND
- `addShowcaseRecording` exported: FOUND
- `updateShowcaseRecording` exported: FOUND
- `deleteShowcaseRecording` exported: FOUND
- `merch_handles` in createShowcase/updateShowcase: FOUND
- `parseLinks` helper: FOUND
- `soundcloudSetUrl` references: NONE (PASS)
- `getShowcaseRecordings` in queries.ts: FOUND
- `showcaseRecordings` in import + function body: FOUND
- `orderBy sortOrder` count >= 2: FOUND (2 matches)
- commit 110a031: FOUND
- npx tsc --noEmit: EXIT 0
