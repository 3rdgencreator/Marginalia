---
phase: 05-secondary-content-pages
fixed_at: 2026-04-23T18:28:34Z
review_path: .planning/phases/05-secondary-content-pages/05-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 2
skipped: 5
status: partial
---

# Phase 05: Code Review Fix Report

**Fixed at:** 2026-04-23T18:28:34Z
**Source review:** `.planning/phases/05-secondary-content-pages/05-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (CR-01, CR-02, WR-01, WR-02, WR-03, WR-04, WR-05)
- Fixed: 2
- Skipped: 5

---

## Fixed Issues

### WR-04: `entry.date` Rendered Without Null Guard in ShowcaseCard

**Files modified:** `components/showcases/ShowcaseCard.tsx`
**Commit:** `ce8c8b3`
**Applied fix:** Wrapped the date `<p>` element in a `{entry.date && (...)}` conditional so the paragraph is not rendered (and does not produce layout spacing) when `date` is `null`.

### WR-05: Merch iframe Missing `sandbox` Attribute

**Files modified:** `app/merch/page.tsx`
**Commit:** `b8e3276`
**Applied fix:** Added `sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"` to the Shopify iframe, restricting default permissions while permitting the minimum required for a Shopify checkout flow including 3DS payment popups.

---

## Skipped Issues

### CR-01: `entry.artistSlugs` Does Not Exist in Releases Schema

**File:** `app/page.tsx:54`
**Reason:** Already fixed — code context differs from review. The `featured` map at lines 50-56 of `app/page.tsx` does not reference `entry.artistSlugs` at all; it only maps `title` and `coverArt`. The field was removed before this fix pass ran. `ReleaseCard` uses the optional `artistName?: string` prop, which is not populated by the homepage (intentional — no artist attribution on homepage featured releases grid).
**Original issue:** `entry.artistSlugs` read from releases schema but field does not exist, always returns `undefined`.

### CR-02: Unvalidated CMS URLs Used as `href` in ShowcaseCard (XSS via `javascript:`)

**File:** `components/showcases/ShowcaseCard.tsx:62` and `:75`
**Reason:** Already fixed — code context differs from review. `ShowcaseCard.tsx` already contains a `safeHref` function (lines 3-6) that guards both `ticketUrl` and `aftermovieUrl` with `startsWith('https://')` / `startsWith('http://')` checks. Both anchor tags use `safeHref()` as a guard condition and as the `href` value.
**Original issue:** `ticketUrl` and `aftermovieUrl` passed directly to `href` without scheme validation.

### WR-01: Unvalidated CMS URL Used as `href` in PressEntry

**File:** `components/press/PressEntry.tsx:37` and `:68`
**Reason:** Already fixed — code context differs from review. `PressEntry.tsx` already computes a `safeUrl` variable (lines 22-25) with the `startsWith('https://')` / `startsWith('http://')` guard. Both anchor tags in the component use `safeUrl` rather than `entry.url`.
**Original issue:** `entry.url` passed directly to `href` on two anchor elements without scheme validation.

### WR-02: `role="list"` on a `<div>` Is Incorrect

**File:** `components/podcasts/PodcastAccordion.tsx:24`
**Reason:** Already fixed — code context differs from review. `PodcastAccordion.tsx` line 24 now reads `<div className="divide-y divide-(--color-surface)">` with no `role` attribute. The invalid `role="list"` was removed before this fix pass ran.
**Original issue:** `<div role="list">` is not a valid ARIA pattern when children are not `role="listitem"` elements.

### WR-03: Raw `artistSlug` Displayed in PodcastRow Instead of Display Name

**File:** `components/podcasts/PodcastRow.tsx:43-46`
**Reason:** Intentionally skipped per task instructions — marked as skip if complex. This fix requires: (1) calling `resolveArtistNames` async server-side in `app/podcasts/page.tsx`, (2) updating the `Episode` type in both `PodcastAccordion.tsx` and `PodcastRow.tsx` from `artistSlug: string | null` to `artistName: string | null`, and (3) updating the render site in `PodcastRow`. The cross-file type change touches the client/server boundary and warrants human review before applying.
**Original issue:** `episode.artistSlug` (e.g., `"elif-koz"`) rendered as visible text instead of the resolved display name (e.g., `"Elif Koz"`).

---

_Fixed: 2026-04-23T18:28:34Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
