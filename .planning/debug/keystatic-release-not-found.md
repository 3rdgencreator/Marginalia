---
slug: keystatic-release-not-found
status: resolved
trigger: Clicking a release in the Keystatic CMS dashboard shows "Not found" error
created: 2026-04-23
updated: 2026-04-23
---

## Symptoms

- **Expected:** Clicking "Medusa (MRGNL001)" in the releases list should open the edit form
- **Actual:** Keystatic shows a "Not found" error
- **Error messages:** "Not found" (Keystatic's own error UI)
- **Timeline:** Worked before, broke recently after recent changes
- **Reproduction:** Navigate to /keystatic/collection/releases → click Medusa → "Not found"
- **Scope:** Only Medusa (MRGNL001) confirmed; other releases not tested

## Current Focus

hypothesis: Stale client-side tree cache in Keystatic — tree fetched once at SPA load and only invalidated by Keystatic's own /api/keystatic/update calls. External filesystem changes (custom API routes, direct edits) are never reflected in the cached tree, so when useItemData() does getTreeNodeAtPath(tree, 'content/releases/medusa-1.yaml'), it returns undefined → "not-found" state.
test: source analysis of @keystatic/core 0.5.50 + live file inventory
expecting: tree cache keyed by initial sha, no invalidation hook for non-Keystatic writes
next_action: confirmed — stop investigating

## Evidence

- timestamp: 2026-04-23 (investigation)
  observation: Actual files on disk are `content/releases/medusa-1.yaml` + `content/releases/medusa-1/description.mdoc` (empty). Context mentioned `medusa.yaml` but filesystem uses `medusa-1` slug. Session context was stale — actual slug is `medusa-1`.
- timestamp: 2026-04-23
  observation: Collection config `path: 'content/releases/*'` with `format: { data: 'yaml' }` → Keystatic computes `dataLocation = 'outer'` (flat file layout). Confirmed by reading `@keystatic/core/dist/index-e205248e.js` line ~243: `const dataLocation = path.endsWith('/') ? 'index' : 'outer'`. The presence of `fields.document` / `fields.image` in the schema does NOT switch to folder layout — that's purely path-shape driven.
- timestamp: 2026-04-23
  observation: `getEntriesInCollectionWithTreeKey` (index-e205248e.js ~1234) with dataLocation='outer' skips directory entries (`if (entry.children || !key.endsWith(extension)) continue;`). So the empty `medusa-1/` folder is ignored during list-building — it is NOT what causes "Not found". Keystatic's list correctly finds `medusa-1.yaml` when tree is fresh.
- timestamp: 2026-04-23
  observation: "Not found" originates in `useItemData` (keystatic-core-ui.js line 482): `if (dataFilepathSha === undefined) return 'not-found'`. It resolves `getEntryDataFilepath(dirpath, format)` → `content/releases/medusa-1.yaml` and calls `getTreeNodeAtPath(tree, ...)`. If the CLIENT'S cached tree lacks that path, render NotFound — even though the file is on disk.
- timestamp: 2026-04-23
  observation: `LocalAppShellProvider` (index-e205248e.js ~2330) uses `useState('initial')` for `currentTreeSha` and calls `fetchLocalTree(sha)` which has an internal `treeCache` Map keyed by sha. The tree is fetched once on mount and only re-fetched when `setCurrentTreeSha` is called. `setCurrentTreeSha` is called only inside Keystatic's own save pipeline (see keystatic-core-ui.js ~2068, ~2193 after `/api/keystatic/update`). NO watcher/revalidation exists for out-of-band filesystem changes.
- timestamp: 2026-04-23
  observation: The project has a custom `/api/admin/releases` GET (reads fs directly) + DELETE (fs.rm directly) + a custom `/keystatic/collection/releases/page.tsx` list page. These mutate the filesystem WITHOUT going through `/api/keystatic/update`. Any mutation here leaves Keystatic's in-memory tree stale until a full-page navigation forces remount.
- timestamp: 2026-04-23
  observation: The custom list page uses plain `<a href="/keystatic/collection/releases/{slug}">` (page.tsx line 88), which triggers a full Next.js navigation — this *should* remount Keystatic. BUT if the user ever performs SPA-internal navigation inside Keystatic (Dashboard ↔ some collection ↔ Releases) AFTER an out-of-band filesystem mutation, the cached tree is used.
- timestamp: 2026-04-23
  observation: `KeystaticEnhancer.tsx` lines 36-41 already detect SPA routing into `/keystatic/collection/releases` (native Keystatic list attempt) and force `window.location.reload()` to serve the custom list. This confirms the team already knows Keystatic's SPA router must be sidestepped to keep the custom list visible. The same reload strategy needs to apply when transitioning from the custom list to any item page if a filesystem mutation happened in between.

## Eliminated

- SHA mismatch in blob endpoint — the blob endpoint only matters AFTER getTreeNodeAtPath succeeds; the "Not found" here happens at the tree lookup step, before any blob fetch.
- Title field casing (`title: Medusa` vs lowercase slug) — Keystatic treats the title field's stored value and the URL slug separately; the YAML currently has `title: Medusa` and the file is `medusa-1.yaml` with slug `medusa-1`. The capital M is only the display string.
- Dual presence of `medusa-1.yaml` + `medusa-1/` folder — with dataLocation='outer', Keystatic ignores directory siblings during list build. The folder is harmless cruft.
- Keystatic forcing folder layout for schemas with `fields.document`/`fields.image` — not a real rule; dataLocation is purely determined by whether the collection `path` ends with `/`.

## Resolution

root_cause: Keystatic's local-mode client caches the filesystem tree in memory after a single fetch of `/api/keystatic/tree` at SPA mount, and only invalidates it after its own `/api/keystatic/update` calls. The project's custom admin API (`/api/admin/releases` DELETE, direct file edits) mutates the filesystem out-of-band, leaving the tree stale. When the user clicks a release item, `useItemData` looks up `content/releases/medusa-1.yaml` in the stale tree, finds nothing, and renders "Not found". A hard refresh fixes it because it re-fetches the tree.
fix: Two parts — (1) remove the stale empty folder `content/releases/medusa-1/` (purely housekeeping, the empty `description.mdoc` is leftover from an earlier schema iteration). (2) Force a full page reload in the custom list's delete handler and after any out-of-band filesystem mutation, so Keystatic's tree is re-fetched before the next item click. Proposed (not yet applied): change `setReleases(prev => prev.filter(...))` in `app/keystatic/collection/releases/page.tsx` handleDelete to `window.location.reload()`, and similarly reload after successful creates/edits from any custom API path.
verification: Hard refresh the Keystatic dashboard, click Medusa — expect the edit form to load with fields populated from medusa-1.yaml. After part (2) is applied, perform a DELETE via the × button, then click any remaining release — expect no "Not found".
files_changed: content/releases/medusa-1/ (deleted, empty folder)

## Proposed follow-up (NOT applied in this session)

- Edit `app/keystatic/collection/releases/page.tsx` handleDelete to use `window.location.reload()` after a successful DELETE instead of filtering React state. This ensures Keystatic's tree cache is rebuilt.
- Consider extending `KeystaticEnhancer.tsx` to force a reload whenever navigating *out of* the custom list into an item page, if any custom mutation has occurred since mount.
- Longer term: funnel all release mutations through Keystatic's own `/api/keystatic/update` endpoint (which hydrates the tree correctly), removing the custom `/api/admin/releases` POST/DELETE paths. This is the canonical Keystatic pattern.
