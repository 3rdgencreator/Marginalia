# Marginalia Web Site — Shift 10

## Shift 10 — April 30, 2026 (continued from shift-09)

**Duration:** ~3 hours
**Status:** Phase 8 (Showcase Detail Enhancements) shipped end-to-end via full GSD pipeline (discuss → ui → plan → execute → verify); Vercel deploy fixed and Shopify cart wired up on production; misc bug fixes ✓

---

### Starting State

- Phase 7 closed in shift-08, on-site cart and pre-save schema overhaul shipped in shift-09
- Production alias `marginalia-ecru.vercel.app` was serving the cart UI but `Add to Cart` was returning `Could not add to cart. Shopify checkout unavailable.` because Vercel had no Shopify env vars
- Pre-save buttons on release detail pages were silently swallowing left clicks; right-click "open in new tab" worked
- Showcase listing page lost its flyer because the DB row pointed at `flyer.png` but the file on disk was `flyer.jpg`
- Roadmap had no Phase 8 — patron's request for "merch + variable links + 1+ SoundCloud recordings on showcase pages" was not yet captured

---

### What Was Done

#### 1. Cart drawer pointer-events bug (cross-page click swallowing)

The closed `CartDrawer` `<aside>` was `fixed top-0 right-0 z-[10001] h-full w-full sm:w-[420px]` with only `translate-x-full` to hide it. Without `pointer-events-none`, the off-screen drawer kept hit-testing across the page on viewports where `w-full` applied, silently swallowing left clicks on links/buttons. Right-click context menus reached the underlying anchor differently in some Safari versions, which matched the user-reported "right-click works, left-click doesn't" symptom on pre-save pages.

```tsx
// before
className={`... ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}

// after
className={`... ${isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`}
```

Also added `aria-hidden={!isOpen}`.

Commit: `22d703b fix(cart): pointer-events-none on closed drawer + log Shopify errors`

#### 2. Shopify cart on Vercel — env vars + diagnostic logging

`Add to Cart` was returning the generic "Shopify checkout unavailable" toast on the deployed alias. Verified the Storefront API token in `.env.local` worked locally (cartCreate returned a valid checkout URL), so the issue was missing env vars on Vercel.

- Added `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN` to Vercel project `marginalia` (Production + Preview) via `vercel env add`
- Improved `lib/shopify.ts > shopifyCartCall` to log specific failure causes (missing env, HTTP status, GraphQL `errors[]`) so future regressions surface in Vercel function logs instead of silently returning `null`

#### 3. Vercel build fix — exclude cron-worker from Next.js typecheck

After pushing the cart fix, the Vercel build failed because `tsc` was picking up `cron-worker/src/index.ts` and complaining about Cloudflare Workers ambient types (`ScheduledEvent`, `ExecutionContext`, `ExportedHandler`) that only exist in the cron-worker's own tsconfig.

```json
// tsconfig.json
"exclude": ["node_modules", "cron-worker"]
```

Commit: `dd038f5 fix(build): exclude cron-worker from Next.js typecheck`

#### 4. Showcase flyer 404 — DB ↔ filesystem mismatch

`/showcases` was rendering an empty grid because `getAllShowcases().filter(s => s.flyer)` returned the row but the image 404'd. DB pointed at `flyer.png`, file on disk was `flyer.jpg`. Fixed by updating the row in-place via Neon, then triggering a production redeploy so the statically-built page picked up the new value.

```sql
UPDATE showcases SET flyer = '/images/showcases/sxm-and-marginalia-showcase-ade-2025/flyer.jpg'
WHERE slug = 'sxm-and-marginalia-showcase-ade-2025';
```

#### 5. Phase 8 — Showcase Detail Enhancements (full GSD pipeline)

Roadmap addition: per-event merch (Shopify product handles), variable optional links (jsonb array), and multi-recording SoundCloud support. The patron wanted showcase pages to support 1-N audio recordings plus event-specific merch and free-form links — none of which the current schema or page handled.

**Pipeline:** `/gsd-add-phase` → `/gsd-discuss-phase 8` → `/gsd-ui-phase 8` → `/gsd-plan-phase 8` → `/gsd-execute-phase 8`. 4 plans across 3 waves, all 19 CONTEXT.md decisions implemented and verified.

**Schema (Wave 1 — `61c3e65`, `cfce912`):**

- New `showcase_recordings` join table — `id`, `showcase_id` (FK cascade), `url` NOT NULL, `title` NOT NULL, `dj_label` nullable, `sort_order` default 0. Pattern mirrors the existing `showcase_photos` table.
- New `showcases.merch_handles jsonb` — `string[]` of Shopify product handles.
- New `showcases.links jsonb` — `Array<{label, url}>`. No type/category — patron preferred maximum flexibility over a typed schema (sponsor / lineup / venue).
- Dropped `showcases.soundcloud_set_url` after migrating any populated values into `showcase_recordings` (`title='Set'`, `sort_order=0`).

`drizzle-kit push` requires a TTY for the `promptColumnsConflicts` interactive prompt, so the executor applied the diff via raw SQL through the Neon driver instead — `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP COLUMN IF EXISTS`. Idempotent. The migration script (`lib/db/migrate-showcase-recordings.ts`) was run twice to verify the no-op second run.

**Server layer (Wave 2 — `110a031`):**

- `lib/db/actions/showcases.ts` — `createShowcase` / `updateShowcase` now write `merch_handles` (`formData.getAll('merch_handles')`) and `links` (parsed from parallel `link_label[]` + `link_url[]` arrays via a new `parseLinks` helper). All `soundcloudSetUrl` references removed.
- `addShowcaseRecording` / `updateShowcaseRecording` / `deleteShowcaseRecording` — full CRUD for the join table.
- `lib/db/queries.ts > getShowcaseRecordings(showcaseId)` — returns rows ordered by `sort_order ASC`.

**Public render (Wave 3a — `a0d389f`, `6887f98`):**

- `components/showcases/RecordingsList.tsx` — `'use client'` boundary because `SoundCloudEmbed` is client-only. The parent server page pre-computes `embedUrl` via `buildSoundCloudEmbedUrl` (which imports `'server-only'`), so no boundary violation.
- `components/showcases/ShowcaseMerchSection.tsx` — server component that takes resolved `ShopifyProduct[]`, renders an existing `MerchGrid` wrapper. Empty state: don't render the section.
- `components/showcases/ShowcaseLinksList.tsx` — server component, vertical list of `target="_blank" rel="noopener noreferrer"` anchors with `underline-offset-4` + lime hover state per UI-SPEC.
- `app/showcases/[slug]/page.tsx` — section order is now Links → Merch → Listen → Aftermovie → Gallery. Links and Merch are visible whenever populated (upcoming + past). Listen, Aftermovie, Gallery remain past-only per the existing `isPast` flag.

**Admin form (Wave 3b — `07f5a60`, `513c12e`):**

- `components/admin/ShowcaseMerchPicker.tsx` — `'use client'` component. On mount fetches `/api/admin/shopify-products`, renders a checkbox list. Selected handles emit hidden checkbox inputs `name="merch_handles"` so the existing form action picks them up via `getAll`.
- `app/api/admin/shopify-products/route.ts` — auth-guarded GET endpoint matching the existing `fetch-release` pattern. Returns `{handle, title}[]` via `fetchShopifyProducts()`. The auth guard was a planner-flagged threat-model deviation (Rule 2 — required by T-08-04-01) that the executor added on top of the plan action.
- `app/admin/(protected)/showcases/[slug]/page.tsx` — Recordings manager (per-row form with save + delete actions, plus an `+ Add Recording` form below), Links repeater (parallel `link_label[]` + `link_url[]` arrays in the main form, always one empty row), Merch picker section. Old `soundcloud_set_url` field removed.
- `app/admin/(protected)/showcases/new/page.tsx` — Links + Merch sections only (Recordings can only be added after the showcase exists). Old `soundcloud_set_url` field removed.

**Verification (`c2b3768`):** 10/10 must-haves passed against the live codebase via grep, not just SUMMARY claims. TypeScript clean. Section ordering matches UI-SPEC. All `soundcloud_set_url` references gone (schema, actions, public page, admin edit, admin new — 0 matches).

#### 6. UI-SPEC quality gate iterations

The first UI-SPEC pass blocked on a 12px (`gap-3`) value in the admin repeater spec — outside the standard `{4, 8, 16, 24, 32, 48, 64}` token set. Fix was trivial: `gap-3` → `gap-(--space-sm)` (8px). The two non-blocking flags (focal-point declaration, color-percentage labels in the role table) were also addressed in the same pass.

#### 7. Misc

- `marginalia-ecru.vercel.app` redeployed twice — once for the env vars, once after the Phase 8 push.
- Cart error logging surfaced in Vercel function logs now distinguishes "missing env" from "HTTP error" from "GraphQL errors[]".

---

### Files Changed This Shift

```
.planning/ROADMAP.md                                                            — Phase 8 added
.planning/STATE.md                                                              — Roadmap evolution + planning-complete records
.planning/phases/08-showcase-detail-enhancements-.../                           — NEW phase directory
  08-CONTEXT.md, 08-DISCUSSION-LOG.md, 08-UI-SPEC.md
  08-01-PLAN.md, 08-02-PLAN.md, 08-03-PLAN.md, 08-04-PLAN.md
  08-01..04-SUMMARY.md
  08-VERIFICATION.md
lib/db/schema.ts                                                                — showcase_recordings + merch_handles + links jsonb
lib/db/actions/showcases.ts                                                     — recordings CRUD + parseLinks + merch_handles writes
lib/db/queries.ts                                                               — getShowcaseRecordings
lib/db/migrate-showcase-recordings.ts                                           — NEW (idempotent migration)
components/showcases/RecordingsList.tsx                                         — NEW
components/showcases/ShowcaseMerchSection.tsx                                   — NEW
components/showcases/ShowcaseLinksList.tsx                                      — NEW
components/admin/ShowcaseMerchPicker.tsx                                        — NEW
app/showcases/[slug]/page.tsx                                                   — section ordering, recordingsWithEmbed pre-compute
app/admin/(protected)/showcases/[slug]/page.tsx                                 — Recordings manager, Links repeater, Merch picker
app/admin/(protected)/showcases/new/page.tsx                                    — Links + Merch sections, dropped soundcloud_set_url
app/api/admin/shopify-products/route.ts                                         — NEW (auth-guarded)
components/merch/CartDrawer.tsx                                                 — pointer-events-none on closed
lib/shopify.ts                                                                  — verbose error logging in shopifyCartCall
tsconfig.json                                                                   — exclude cron-worker
shifts/shift-10.md                                                              — this file
```

---

### Commit History (this shift)

```
c2b3768  docs(08): phase 8 verification — 10/10 must-haves passed
e1d3b78  docs(08-04): complete admin form layer plan summary and state update
513c12e  fix(08-04): add auth guard to /api/admin/shopify-products route
07f5a60  feat(08-04): admin form layer — recordings, links, merch picker
df11a5f  docs(08-03): complete public render layer plan
6887f98  feat(08-03): wire RecordingsList, ShowcaseMerchSection, ShowcaseLinksList into showcase detail page
a0d389f  feat(08-03): add RecordingsList, ShowcaseMerchSection, ShowcaseLinksList components
7e6752c  docs(08-02): complete server actions + queries plan
110a031  feat(08-02): add recording CRUD actions + merch/links to showcase actions; add getShowcaseRecordings query
9493979  docs(08-01): complete DB schema extension plan
cfce912  feat(08-01): add idempotent data migration script for showcase recordings
61c3e65  feat(08-01): extend schema with showcaseRecordings table + merch/links columns
f4fd607  docs(state): record phase 8 plan completion
52db35d  docs(08): create phase 8 execution plan — 4 plans across 3 waves
d254a12  docs(08): add UI design contract
5ea662b  docs(08): UI design contract
bcbc0aa  docs(state): record phase 8 context session
705e4b2  docs(08): capture phase context
dd038f5  fix(build): exclude cron-worker from Next.js typecheck
22d703b  fix(cart): pointer-events-none on closed drawer + log Shopify errors
```

---

### Vercel — final state

| Variable | Environment | Set |
|----------|-------------|-----|
| `SHOPIFY_STORE_DOMAIN` | Production + Preview | ✓ |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Production + Preview | ✓ |
| `DATABASE_URL` | Production + Preview | (already set) |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Production | (already set) |
| `AUTH_SECRET` | Production | (already set) |
| `BREVO_API_KEY` | Production | (already set) |
| `NEXT_PUBLIC_SITE_URL` | Production | (already set) |

`CRON_SECRET` is set on Cloudflare Workers (main + cron) but not Vercel — Vercel doesn't run the release-day cron.

---

### Known Issues / Watch Items

- `drizzle-kit push` cannot run non-interactively when the diff includes a column-rename ambiguity (`promptColumnsConflicts`). The current workaround is raw SQL via the Neon driver. Long-term: switch to drizzle-kit migrations (`generate` + `migrate`) so CI/cron paths are non-interactive by default.
- Phase 8 kept Recordings + Gallery past-only per `isPast`, but the public page does not show an empty state for upcoming events with future recordings — the section just doesn't render. If the patron wants a "set list TBA" affordance, that's a follow-up tweak.
- `ShowcaseMerchPicker` fetches the full Shopify product list on mount — fine for the current ~10-product store. Above 50 products the checkbox list becomes unwieldy and we should swap in a typeahead.
- Admin Recordings repeater uses a separate form per row (save / delete buttons hit individual server actions). This matches the existing `showcase_photos` pattern but means a single "Save Showcase" button does not persist recording edits. Slight UX wart — patron will find out the first time they try to bulk-edit.
- `recordings.url` is stored as a plain SoundCloud URL; the public page pre-computes `embedUrl` server-side via `buildSoundCloudEmbedUrl`. If a recording URL is malformed the embed silently breaks rather than failing visibly. Worth a future validation pass on the admin save path.

---

### Next Session

- Browser-verify the upcoming flow on a fresh showcase: create one with `presave/links/merch` populated and confirm the admin form save persists all three correctly.
- Add a real future showcase with recordings (e.g., post-ADE or a planned event) and confirm the past-toggle flips correctly when the date passes.
- Consider a v2 pass on the admin Recordings UX — single form, drag-reorder, instead of per-row form rows.
- Phase 9 candidate: lineup/artist linking on showcases (currently `artist_slugs jsonb`, no UI affordance to surface artist profiles from the showcase page).

---

*Shift 10 recorded: 2026-04-30*
