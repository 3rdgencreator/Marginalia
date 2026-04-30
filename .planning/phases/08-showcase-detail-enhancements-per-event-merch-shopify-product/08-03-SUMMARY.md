---
phase: "08"
plan: "03"
subsystem: "public-render"
tags: ["showcase", "soundcloud", "merch", "shopify", "server-components", "client-components"]
dependency_graph:
  requires:
    - "08-01 (showcase_recordings table + merch_handles/links columns)"
    - "08-02 (getShowcaseRecordings query + server actions)"
  provides:
    - "RecordingsList component (client, pre-computed embedUrls)"
    - "ShowcaseMerchSection component (server, MerchGrid wrapper)"
    - "ShowcaseLinksList component (server, lime-hover external links)"
    - "Updated showcase detail page with Links + Merch + Listen sections in correct order"
  affects:
    - "components/showcases/RecordingsList.tsx"
    - "components/showcases/ShowcaseMerchSection.tsx"
    - "components/showcases/ShowcaseLinksList.tsx"
    - "app/showcases/[slug]/page.tsx"
tech_stack:
  added: []
  patterns:
    - "Server-side embedUrl pre-computation to preserve server-only boundary"
    - "Conditional fetchShopifyProducts (only when merch_handles non-empty)"
    - "Null-coalesce cast for jsonb columns (links/merchHandles) to prevent crash on empty"
key_files:
  created:
    - "components/showcases/RecordingsList.tsx"
    - "components/showcases/ShowcaseMerchSection.tsx"
    - "components/showcases/ShowcaseLinksList.tsx"
  modified:
    - "app/showcases/[slug]/page.tsx"
decisions:
  - "RecordingsList is 'use client' (SoundCloudEmbed uses dynamic import); embedUrls pre-computed server-side in page.tsx"
  - "ShowcaseMerchSection receives resolved ShopifyProduct[] from parent page, not handles — keeps Shopify API call server-side"
  - "fetchShopifyProducts called only when showcaseMerchHandles.length > 0 to avoid unnecessary API calls"
  - "jsonb casts use null-coalesce (??[]) so malformed DB data degrades to empty section, never crashes (T-08-03-02)"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-30"
  tasks_completed: 2
  files_modified: 4
  commits: 2
requirements:
  - D-10
  - D-11
  - D-12
  - D-13
  - D-14
  - D-15
---

# Phase 08 Plan 03: Public Render Layer — Showcase Detail Enhancements

**One-liner:** Created RecordingsList (client), ShowcaseMerchSection (server), ShowcaseLinksList (server) components and wired all three into the showcase detail page with correct section order (Links → Merch → Listen → Aftermovie → Gallery) and visibility rules (Links/Merch always; Listen/Aftermovie/Gallery isPast only).

---

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Create RecordingsList, ShowcaseMerchSection, ShowcaseLinksList components | `a0d389f` | Done |
| 2 | Update app/showcases/[slug]/page.tsx — wire all three sections | `6887f98` | Done |

---

## Deviations from Plan

None — plan executed exactly as written. The plan's note about `buildSoundCloudEmbedUrl` coming from `lib/releases.ts` (not `lib/shopify.ts`) was a self-correction in the plan itself; no deviation occurred during implementation.

---

## Known Stubs

None. All sections are fully wired:
- `RecordingsList` receives real `getShowcaseRecordings()` data pre-mapped to embedUrls
- `ShowcaseMerchSection` receives real Shopify products filtered by `merch_handles`
- `ShowcaseLinksList` receives real `s.links` jsonb data

---

## Threat Surface Scan

No new network endpoints introduced. All Shopify API calls remain server-side. The `rel="noopener noreferrer"` mitigation for T-08-03-04 (tab-napping) is in place on all ShowcaseLinksList anchors. The jsonb null-coalesce cast for T-08-03-02 is applied to both `s.links` and `s.merchHandles`.

---

## Self-Check: PASSED

- components/showcases/RecordingsList.tsx: FOUND
- components/showcases/ShowcaseMerchSection.tsx: FOUND
- components/showcases/ShowcaseLinksList.tsx: FOUND
- 'use client' in RecordingsList: FOUND
- No 'use client' in ShowcaseMerchSection / ShowcaseLinksList: CONFIRMED
- No buildSoundCloudEmbedUrl or server-only in RecordingsList: CONFIRMED (PASS)
- underline-offset-4 in ShowcaseLinksList: FOUND
- mb-(--space-2xl) in all three components: FOUND (3 matches)
- soundcloudSetUrl / scUrl in page.tsx: NONE (PASS)
- getShowcaseRecordings in page.tsx: FOUND
- fetchShopifyProducts in page.tsx: FOUND
- buildSoundCloudEmbedUrl in page.tsx: FOUND
- recordingsWithEmbed / showcaseLinks / merchProducts in page.tsx: FOUND
- npx tsc --noEmit: EXIT 0
- npm run build: EXIT 0
- commit a0d389f: FOUND
- commit 6887f98: FOUND
