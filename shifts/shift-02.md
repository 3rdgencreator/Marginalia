# Marginalia Web Site — Shift 2

## Shift 2 — April 17, 2026

**Duration:** ~2–3 hours
**Status:** Phase 1 complete ✓ / Phase 2 queued

---

### Starting State

- Wave 2 worktree (`worktree-agent-a41d5f17`) had not been merged — merged at session start
- Wave 3 had not been executed yet

---

### What Was Done

#### 1. Wave 2 Worktree Merged

6 Keystatic files created in Wave 2 merged into main:

```
keystatic.config.ts          356 lines — full schema: 5 collections + 2 singletons
lib/keystatic.ts             createReader export
app/keystatic/layout.tsx
app/keystatic/keystatic-app.tsx
app/keystatic/[[...params]]/page.tsx
app/api/keystatic/[...params]/route.ts
```

#### 2. Wave 3 Executed — COMPLETE ✓

Executor agent ran in a worktree. What was done:

- `npx @opennextjs/cloudflare build` completed successfully → `open-next.config.ts` created (required but missing from plan — deviation handled)
- Test image (`public/images/releases/test-image.png`) created → served at `/images/releases/test-image.png` with HTTP 200 → cleaned up
- `app/page.tsx` updated: "Marginalia / Coming soon" placeholder
- `CMS-WORKFLOW.md` created (78 lines): daily workflow guide for Fabio and ELIF

#### 3. Human Checkpoint — PASSED ✓

Verified in Safari:

- `http://localhost:3000` → "Marginalia" (Coming soon not yet visible — merge was pending, normal)
- `http://localhost:3000/keystatic` → CMS admin fully working
- Dashboard showed all sections:
  - Collections: Releases, Artists, Podcasts, Press, Showcases
  - Singletons: Site Config, Home Page
- Releases and Artists fields verified ✓

#### 4. RecapPhotos Bug Fix

**Issue:** Adding a second photo in Showcases > Create > Recap Photos replaced the first one.

**Root cause:** `fields.array(fields.image(...))` causes item key collision in Keystatic.

**Fix (2 stages):**
1. Wrapped image in `fields.object` → partial fix (one image addable)
2. Added `caption` text field → provides a unique key per item

**Final state:** Single photo per item for now (user decision). Multi-image deferred to a later phase.

#### 5. Package Name Fix

`package.json` `"name"` corrected from `"tmp-scaffold"` → `"marginalia-label"`.

#### 6. Phase 1 Verification — PASSED ✓

`gsd-verifier` confirmed all must-haves:

| Criterion | Result |
|-----------|--------|
| 5 collections + 2 singletons, full schema | ✓ |
| Image directory/publicPath pairing correct | ✓ |
| wrangler.jsonc — marginalia-label, nodejs_compat | ✓ |
| next.config.ts — no output:export | ✓ |
| lib/keystatic.ts reader export | ✓ |
| Keystatic API route | ✓ |
| CMS-WORKFLOW.md (78 lines) | ✓ |
| Tailwind v4 CSS-first (no tailwind.config file) | ✓ |
| OpenNext build (.open-next/worker.js exists) | ✓ |

**Phase 1: COMPLETE** ✓

---

### Commit History (this shift)

```
e91caa0  fix: rename package from tmp-scaffold to marginalia-label
1fcb885  fix: add caption key field to recapPhotos array
88f8a32  docs(phase-01): update tracking after Wave 3 complete
143f2e5  docs(phase-01): complete Phase 1
d440d9e  fix(01-03): wrap recapPhotos image in object for array compatibility
695639c  feat(01-02): merge Wave 2 — Keystatic schema and admin routes
```

---

### Pending Decisions

- **Waiting on Ozge:** Color palette, typography, logo files and brand guidelines
- **Waiting on Fabio:** HypeEdit account status (platform list received — see below)
- **RecapPhotos:** Multi-image deferred — single photo per item is sufficient for now

### Resolved This Shift

- **Fabio — Proton Distribution platform list received (2026-04-17):**

  Full store list delivered via Proton dashboard screenshot:

  | Platform | Type | In Schema |
  |----------|------|-----------|
  | Amazon | Store | ✓ Added |
  | Anghami | Store | ✓ Added |
  | Audible Magic | Metadata/fingerprinting | — (no URL) |
  | Beatport | Store | ✓ Already present |
  | Deezer | Store | ✓ Already present |
  | Facebook | Social/store | ✓ Added |
  | iTunes / Apple Music | Store | ✓ Already present |
  | Juno | Store | ✓ Already present |
  | MixCloud | Store | ✓ Added |
  | Music Reports International | Royalty reporting | — (no URL) |
  | NetEase | Store | ✓ Added |
  | Pandora | Store | ✓ Added |
  | Saavn | Store | ✓ Added |
  | SoundCloud | Store | ✓ Already present |
  | Spotify | Store | ✓ Already present |

  Keystatic `releases` schema updated with 7 new URL fields. Content entry not yet started — schema change is safe.

---

### Next Session — Resume Command

Phase 2: Design System — to begin once Ozge's brand files arrive.

```
/gsd-plan-phase 2
```

→ Typography, color system, component library (Tailwind v4).

---

*Shift 2 recorded: 2026-04-17*
