---
phase: 05-secondary-content-pages
fixed_at: 2026-04-23T00:00:00Z
review_path: .planning/phases/05-secondary-content-pages/05-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 05: Code Review Fix Report

**Fixed at:** 2026-04-23
**Source review:** .planning/phases/05-secondary-content-pages/05-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: `entry.artistSlugs` Does Not Exist in Releases Schema

**Files modified:** `app/page.tsx`
**Commit:** 2bf432c
**Applied fix:** Removed `artistSlugs: entry.artistSlugs` from the featured releases map shape. `ReleaseCard` uses `artistName?: string` (optional), not `artistSlugs`, so the field was both non-existent in the schema and unused by the component. The mapped shape now contains only `title` and `coverArt`.

---

### CR-02: Unvalidated CMS URLs in ShowcaseCard `href` (XSS via `javascript:`)

**Files modified:** `components/showcases/ShowcaseCard.tsx`
**Commit:** 655bde1
**Applied fix:** Added `safeHref(url)` helper function at the top of the file that returns `null` for any URL not starting with `https://` or `http://`. Both the ticket button and aftermovie anchor now gate on `safeHref(entry.ticketUrl)` / `safeHref(entry.aftermovieUrl)` for the conditional render and use the safe value in `href`.

---

### WR-01: Unvalidated CMS URL in PressEntry `href`

**Files modified:** `components/press/PressEntry.tsx`
**Commit:** ce5e7f7
**Applied fix:** Added `safeUrl` constant at the top of the component using the same `startsWith('https://') || startsWith('http://')` scheme check. Both anchor elements (headline link and "Read article" link) now use `safeUrl` for both the conditional and the `href` value.

---

### WR-02: `role="list"` on `<div>` in PodcastAccordion

**Files modified:** `components/podcasts/PodcastAccordion.tsx`
**Commit:** 8ecaeeb
**Applied fix:** Removed `role="list"` from the `<div>` container (Option B — remove the invalid role, keep the `<div>`). `PodcastRow` renders a `<div>` root, not `<li>`, so changing to `<ul>` would have required touching PodcastRow as well.

---

### WR-03: Raw `artistSlug` Displayed Instead of Resolved Name in PodcastRow

**Files modified:** `app/podcasts/page.tsx`, `components/podcasts/PodcastAccordion.tsx`, `components/podcasts/PodcastRow.tsx`
**Commit:** 15f1019
**Applied fix:** In `app/podcasts/page.tsx`, the episodes mapping was changed from `sorted.map(...)` to `await Promise.all(sorted.map(async ...))` and uses `resolveArtistNames([entry.artistSlug])` (imported from `lib/releases.ts`) to resolve the display name server-side, falling back to the raw slug if lookup fails. The field passed to `PodcastAccordion` is now `artistName` (resolved string). Both `PodcastAccordion` and `PodcastRow` had their `Episode` type updated from `artistSlug: string | null` to `artistName: string | null`, and `PodcastRow`'s JSX render was updated to reference `episode.artistName`.

---

### WR-04: `entry.date` Rendered Without Null Guard in ShowcaseCard

**Files modified:** `components/showcases/ShowcaseCard.tsx`
**Commit:** ce8c8b3
**Applied fix:** Wrapped the date `<p>` element in `{entry.date && (...)}` so the paragraph is omitted entirely when `date` is null, preventing a visible but empty paragraph with unwanted layout spacing.

---

### WR-05: Merch iframe Missing `sandbox` Attribute

**Files modified:** `app/merch/page.tsx`
**Commit:** b8e3276
**Applied fix:** Added `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"` to the Shopify iframe. This restricts the embedded page to the minimum permissions needed for a checkout flow while preventing top-frame navigation and other unrestricted capabilities.

---

_Fixed: 2026-04-23_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
