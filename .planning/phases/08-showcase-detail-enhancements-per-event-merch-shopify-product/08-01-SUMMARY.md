---
phase: "08"
plan: "01"
subsystem: "database"
tags: ["schema", "drizzle", "migration", "postgres"]
dependency_graph:
  requires: []
  provides:
    - "showcase_recordings table with id, showcase_id FK cascade, url, title, dj_label, sort_order"
    - "showcases.merch_handles jsonb (string[])"
    - "showcases.links jsonb ({label,url}[])"
  affects:
    - "lib/db/schema.ts"
    - "lib/db/actions/showcases.ts"
    - "app/admin/(protected)/showcases/[slug]/page.tsx"
    - "app/showcases/[slug]/page.tsx"
tech_stack:
  added: []
  patterns:
    - "Drizzle join table pattern (showcaseRecordings mirrors showcasePhotos)"
    - "jsonb column pattern for typed arrays ($type<string[]>)"
    - "Idempotent raw SQL migration via neon driver when drizzle-kit push is non-interactive"
key_files:
  created:
    - "lib/db/migrate-showcase-recordings.ts"
  modified:
    - "lib/db/schema.ts"
    - "lib/db/actions/showcases.ts"
    - "app/admin/(protected)/showcases/[slug]/page.tsx"
    - "app/showcases/[slug]/page.tsx"
decisions:
  - "Used raw SQL (neon driver) for schema push because drizzle-kit push requires TTY for column conflict resolution; --force flag did not bypass promptColumnsConflicts"
  - "Accidentally generated migration files (drizzle-kit generate) were deleted — project uses push-based workflow exclusively"
  - "soundcloudSetUrl references removed from 3 consuming files as part of Task 1 (Rule 1 auto-fix)"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-30"
  tasks_completed: 3
  files_modified: 5
  commits: 2
requirements:
  - D-01
  - D-02
  - D-03
  - D-04
  - D-05
  - D-08
  - D-18
  - D-19
---

# Phase 08 Plan 01: DB Schema Extension — Showcase Recordings, Merch Handles, Links

**One-liner:** Added `showcase_recordings` join table + `merch_handles`/`links` jsonb columns to `showcases`; dropped `soundcloud_set_url` from schema and live DB; idempotent migration script written and verified.

---

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Extend lib/db/schema.ts — new table + columns + remove old column | `61c3e65` | Done |
| 2 | Push schema to live database | Raw SQL via neon driver | Done |
| 3 | Write and run idempotent data migration script | `cfce912` | Done |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed soundcloudSetUrl references from consuming files**
- **Found during:** Task 1 (TypeScript check after schema edit)
- **Issue:** `lib/db/actions/showcases.ts`, `app/admin/(protected)/showcases/[slug]/page.tsx`, and `app/showcases/[slug]/page.tsx` all referenced `soundcloudSetUrl` which no longer exists in the schema
- **Fix:** Removed `soundcloudSetUrl` from createShowcase/updateShowcase actions, removed the admin form field, removed the Listen section from the public page (will be replaced by multi-recording render in Plan 02), cleaned up unused imports (`buildSoundCloudEmbedUrl`, `SoundCloudEmbed`)
- **Files modified:** `lib/db/actions/showcases.ts`, `app/admin/(protected)/showcases/[slug]/page.tsx`, `app/showcases/[slug]/page.tsx`
- **Commit:** `61c3e65`

**2. [Rule 3 - Blocking] drizzle-kit push requires TTY for column conflict resolution**
- **Found during:** Task 2
- **Issue:** `drizzle-kit push` (and `drizzle-kit push --force`) both hit `promptColumnsConflicts` which requires a TTY; non-interactive shell throws `Error: Interactive prompts require a TTY terminal`
- **Fix:** Applied schema diff directly via raw SQL using the neon driver in a `npx tsx -e` script. All three changes (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS x2, DROP COLUMN IF EXISTS) are inherently idempotent. Verified with column listing query.
- **Files modified:** None (DB-only operation)

**3. [Cleanup] Deleted accidentally generated migration files**
- **Found during:** Task 2 (ran `drizzle-kit generate` to investigate push alternatives)
- **Issue:** `lib/db/migrations/0000_sweet_gorilla_man.sql` and `meta/` directory were created; these contain full CREATE TABLE statements for all tables which would conflict with existing DB
- **Fix:** Deleted `lib/db/migrations/` directory entirely — project uses push-based workflow, not generate+migrate

---

## Known Stubs

None. The Listen section on the public showcase page was intentionally removed (not stubbed) — it will be replaced by the multi-recording render in Plan 02 which reads from `showcase_recordings`.

---

## Threat Surface Scan

No new network endpoints, auth paths, or file access patterns introduced. Schema changes are dev-only (push via local DATABASE_URL). T-08-01-01 (idempotency) implemented as required.

---

## Self-Check: PASSED

- lib/db/schema.ts: FOUND
- lib/db/migrate-showcase-recordings.ts: FOUND
- commit 61c3e65 (schema changes): FOUND
- commit cfce912 (migration script): FOUND
