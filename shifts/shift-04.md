# Marginalia Web Site — Shift 4

## Shift 4 — April 22, 2026

**Duration:** ~3–4 hours
**Status:** Phase 2 fully planned ✓ / Ready to execute

---

### Starting State

- Phase 2 context captured (Shift 3) but plans not yet created
- Nimbus Sans fonts not yet placed in `public/fonts/`
- Marginalia logo file not yet provided
- Phase 2 planning queued: `/gsd-plan-phase 2`

---

### What Was Done

#### 1. Nimbus Sans Fonts — Converted and Placed

Fonts delivered as `.otf` files. Converted to `.woff2` via `fonttools` (better web performance, smaller payload than OTF):

```
public/fonts/NimbusSans-Regular.woff2   46 KB
public/fonts/NimbusSans-Bold.woff2      47 KB
```

Self-hosted — no external font CDN. Matches UI-SPEC Tier 1 `@font-face` declarations.

#### 2. Marginalia Logo — PNG Path Adopted (Not Inline SVG)

Logo delivered as PNG (transparent background + dark-background variant). **Original decision from Shift 3 (inline SVG with `currentColor`) was reversed** — with a PNG source file, `next/image` is the correct primitive:

- Better compression, lazy loading, priority hints, automatic `width`/`height`
- No SVG body to inline
- Consistent with how other project images are served (via `next/image`)

Files placed:

```
public/logo.png           Main logo, transparent bg
public/logo-icon.png      Graphic icon variant (for general use)
app/icon.png              Favicon (Next.js convention — picked up automatically)
```

CONTEXT.md D-01/D-02/D-03 updated to reflect the pivot (commit `9b6910b`).

#### 3. Phase 2 Research — `02-RESEARCH.md`

`gsd-phase-researcher` investigated Phase 2 domain:

- Tailwind v4 CSS-first tokens (`@theme {}` in `globals.css`, no `tailwind.config.js`)
- Self-hosted `@font-face` with `font-display: swap` + `preload` in `app/layout.tsx`
- Next.js 15 Server Component nav pattern with `"use client"` boundary only for `NavLinks` (`usePathname`) and `MobileMenu` (state)
- `reader.singletons.siteConfig` access pattern — surfaced a critical issue: **`readOrThrow()` will crash at build time because `content/site-config.yaml` does not exist yet** (Phase 2 does not create content). Researcher recommended `read()` + hardcoded fallback.
- Tokens inventory: 9 color + 11 tag palette + spacing + type sizes (all mapped from Shift 3 brand extract)

Commit: `9cb41c7`.

#### 4. Validation Strategy — `02-VALIDATION.md`

Nyquist validation document added for the phase (commit `dd59cef`). Defines automated verify commands for each expected artifact before plans were written.

#### 5. Phase 2 Plans — 4 Plans Across 3 Waves

`gsd-planner` produced the full plan set (commit `908d59c`):

| Plan | Wave | Scope | Files |
|------|------|-------|-------|
| **02-01** | 1 | Design tokens + fonts — `globals.css @theme {}` block, `@font-face` for Nimbus Sans, `public/fonts/.gitkeep` | `app/globals.css`, `public/fonts/.gitkeep` |
| **02-02** | 1 | UI primitives — `Container`, `Logo` (next/image), `SocialIcon` (6 Simple Icons paths inlined) | `components/layout/Container.tsx`, `components/ui/Logo.tsx`, `components/ui/SocialIcon.tsx` |
| **02-03** | 2 | Navigation — `SiteNav` (Server Component) + `NavLinks` (`"use client"` wrapper for `usePathname`) + `MobileMenu` | `components/layout/SiteNav.tsx`, `components/layout/NavLinks.tsx`, `components/layout/MobileMenu.tsx` |
| **02-04** | 3 | Shell wiring — `SiteFooter` (async reader with `read()` + fallback, AMENDMENT 1 override of D-14) + `app/layout.tsx` update | `components/layout/SiteFooter.tsx`, `app/layout.tsx` |

`02-PATTERNS.md` (800 lines) — pattern map extracted during planning, documents reusable conventions for downstream phases.

All 5 requirements DSYS-01 through DSYS-05 covered. Every task has `<read_first>`, grep-verifiable `<acceptance_criteria>`, and concrete `<action>` values.

#### 6. Repo Sync — Forced Update From Remote

Local `master` was 6 commits ahead of `origin/master` (the 6 initial setup commits). Remote had been force-pushed with a complete history rewrite (35 commits, new root, plus a new `main` branch). `git pull` refused — unrelated histories.

Inspection confirmed: all of the local commits' content was already represented on the remote under different SHAs. Decision: `git reset --hard origin/master` to adopt the remote state.

Local is now clean at `origin/master` tip (`908d59c`).

#### 7. Plan Checker — Audit Pass

`gsd-plan-checker` reviewed all 4 plans. Result: **plans structurally sound, but documentation drift flagged.**

| # | Severity | Issue |
|---|----------|-------|
| 1 | Blocker | `02-CONTEXT.md` D-14 still says `readOrThrow()`; plan 02-04 uses `read()` + fallback (AMENDMENT 1, correct). CONTEXT needs to catch up. |
| 2 | Warning | `02-RESEARCH.md` lines 22-29 still describe inline SVG logo; CONTEXT/plans already on PNG + next/image. |
| 3 | Warning | `02-02-PLAN.md` `must_haves.artifacts` + `key_links` for `Logo.tsx` still reference inline SVG + `logo.svg`. |
| 4 | Warning | `02-03-PLAN.md` `depends_on: [02-02]` should include `02-01` (runtime CSS tokens). Wave enforcement saves it in practice. |
| 5 | Info | `02-VALIDATION.md` frontmatter still shows `nyquist_compliant: false` / `wave_0_complete: false` — both actually met. |
| 6 | Info | `02-VALIDATION.md` Per-Task Verification Map pre-dates the 4-plan structure — 02-03/02-04 unrepresented. |

**Nature of issues:** Mostly doc drift from late-shift decision changes (SVG → PNG logo, `readOrThrow` → `read`+fallback). Plans themselves produce correct code.

---

### Commit History (this shift)

```
908d59c  docs(02): add Phase 2 plans (02-01 through 02-04) and pattern map
c2f8ac4  feat: add Marginalia graphic icon — favicon + general use
9b6910b  docs(02): update logo decision — PNG + next/image (was inline SVG)
bad3981  feat: add Marginalia logo PNG (transparent + dark variant)
23b78b7  feat: add Nimbus Sans woff2 fonts (converted from OTF via fonttools)
dd59cef  docs(02): add validation strategy
9cb41c7  docs(02): research phase 2 design system and layout shell
```

---

### Pending / Outstanding

- **Doc drift fixes:** 1 blocker + 3 warnings from plan checker — small edits, ~5–10 lines total. Not required for runtime correctness but should be resolved before `/gsd-execute-phase 2` to avoid confusing the executor with stale CONTEXT/RESEARCH entries.
- **Phase 2 execution:** all artifacts (fonts, logo, tokens mapped, plans written) in place — ready to run.

### Resolved This Shift

- **Font pipeline:** Nimbus Sans OTF → woff2 conversion complete, self-hosted
- **Logo pipeline:** PNG + next/image adopted (simpler, more performant than inline SVG)
- **Favicon:** `app/icon.png` placed — Next.js picks up automatically
- **Phase 2 research:** domain fully investigated, including the `siteConfig.read()` vs `readOrThrow()` gotcha that would have crashed the build
- **Phase 2 planning:** 4 plans across 3 waves, all DSYS requirements covered
- **Remote sync:** local reset to `origin/master` after force-pushed history rewrite

---

### Next Session — Resume Command

Phase 2: Design System & Layout Shell — ready to execute.

**Before executing:**

1. Reconcile plan-checker doc drift (CONTEXT.md D-14, RESEARCH.md D-01/D-02/D-03, 02-02 must_haves, 02-03 depends_on, VALIDATION.md frontmatter). Or accept as-is — plans compile correct code.

```
/gsd-execute-phase 2
```

→ Design tokens, font wiring, Container + Logo + SocialIcon, SiteNav + NavLinks + MobileMenu, SiteFooter + `app/layout.tsx` update.

---

*Shift 4 recorded: 2026-04-22*
