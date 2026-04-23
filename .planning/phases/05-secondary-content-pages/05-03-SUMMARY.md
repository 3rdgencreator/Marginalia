---
phase: 05-secondary-content-pages
plan: "03"
subsystem: pages
tags: [about, merch, server-component, keystatic, iframe, document-renderer]
dependency_graph:
  requires:
    - "05-01"  # about singleton + siteConfig schema with merchUrl
  provides:
    - app/about/page.tsx
    - app/merch/page.tsx
    - components/podcasts/PodcastAccordion.tsx
  affects:
    - nav-merch-link
    - nav-about-link
tech_stack:
  added:
    - "@keystatic/core/renderer DocumentRenderer (first use)"
  patterns:
    - "null-safe singleton read: reader.singletons.X.read() (never readOrThrow)"
    - "https:// security guard before iframe src assignment"
    - "Array.isArray guard before DocumentRenderer to prevent Pitfall 8"
key_files:
  created:
    - app/about/page.tsx
    - app/merch/page.tsx
    - components/podcasts/PodcastAccordion.tsx
  modified: []
decisions:
  - "Use .read() (not .readOrThrow()) for about and siteConfig singletons — YAML may be missing or empty"
  - "merch: always render 'Visit our store' link alongside iframe — Shopify X-Frame-Options may block iframe"
  - "about: Array.isArray(about.body) guard mandatory before DocumentRenderer — prevents Pitfall 8 crash on non-array input"
  - "plainTextFromDocument used only for metadata description, never as DocumentRenderer input"
  - "PodcastAccordion added as minimal accordion client component (Rule 3: pre-existing build blocker from 05-04 merge)"
metrics:
  duration: "~25 minutes"
  completed_date: "2026-04-23"
  tasks_completed: 2
  files_created: 3
---

# Phase 05 Plan 03: About and Merch Pages Summary

**One-liner:** About page with DocumentRenderer singleton rendering and merch iframe page with https:// security guard and Shopify X-Frame-Options fallback.

## Tasks Completed

### Task 1: About Page with DocumentRenderer

**Commit:** `42b4746`  
**File:** `app/about/page.tsx`

Async server component reading the `about` singleton via `reader.singletons.about.read()` (null-safe). First use of `DocumentRenderer` in the project. Renders:
- `headline` from singleton (if set)
- Optional `photo` via `next/image` (if set)
- Rich text `body` via `DocumentRenderer` with `Array.isArray` guard (Pitfall 8 prevention)
- Graceful empty state when body is `[]` — renders headline only, no filler text

`generateMetadata` uses `plainTextFromDocument(about?.body, 160)` for the description — the string result is used only for metadata, never passed to `DocumentRenderer`.

### Task 2: Merch Page with Iframe and Fallback

**Commit:** `fa1f652`  
**File:** `app/merch/page.tsx`

Async server component reading `siteConfig.merchUrl` via `reader.singletons.siteConfig.read()` (null-safe). Key behaviors:

- **Security guard:** `const safeUrl = merchUrl && merchUrl.startsWith('https://') ? merchUrl : null` — prevents arbitrary URL injection (T-05-03-01)
- **When `safeUrl` is set:** renders `<iframe src={safeUrl}>` + always-visible `"Visit our store →"` fallback link (handles Shopify X-Frame-Options blocking the iframe — D-26)
- **When `safeUrl` is null:** shows `"Merch store coming soon."` empty state
- `target="_blank" rel="noopener noreferrer"` on fallback link
- Code comment alerts maintainer to verify Shopify framing settings if iframe appears blank

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Added missing PodcastAccordion component**
- **Found during:** Build verification (Task 2)
- **Issue:** `app/podcasts/page.tsx` (from 05-04 merge at `af94d36`) imported `@/components/podcasts/PodcastAccordion` which did not exist, causing build failure
- **Fix:** Created `components/podcasts/PodcastAccordion.tsx` as a client accordion component rendering episode list with expand/collapse per episode, SoundCloud embed iframe, and date/description display
- **Files modified:** `components/podcasts/PodcastAccordion.tsx` (created)
- **Commit:** `fa1f652` (included in Task 2 commit)

## Known Stubs

None. Both pages wire real CMS data. `about` page gracefully degrades when fields are empty. `merch` page shows "coming soon" state when `merchUrl` is unset.

## Threat Surface Scan

No new network endpoints introduced beyond what is in the plan's threat model. The iframe `src` security guard (T-05-03-01) and fallback link guard (T-05-03-02) are both implemented. The DocumentRenderer guard (T-05-03-03) is implemented.

## Self-Check: PASSED

- `app/about/page.tsx` — FOUND
- `app/merch/page.tsx` — FOUND
- `components/podcasts/PodcastAccordion.tsx` — FOUND
- Task 1 commit `42b4746` — FOUND (from prior partial execution)
- Task 2 commit `fa1f652` — FOUND
- `npm run build` exits 0 — VERIFIED (routes: /, /about, /merch, /podcasts, /press, /releases all static)
