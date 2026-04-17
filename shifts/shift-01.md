# Marginalia Web Site — Shift 1

## Shift 1 — April 16, 2026

**Duration:** ~3–4 hours
**Status:** Wave 1 complete ✓ / Waves 2–3 queued

---

### Starting State

- Empty git repo (`/Users/koz/Documents/Marginalia Web Site`)
- `.planning/` directory cloned from MRGNL GitHub repo (souchefsoul/MRGNL)
- Placeholder files present: `index.html`, `css/style.css`, `js/main.js`
- No code whatsoever

---

### What Was Done

#### 1. Project Research Read and Digested
5 research files under `.planning/research/` reviewed:
- `STACK.md` — Next.js 15, Tailwind v4, Keystatic 0.5.x, @opennextjs/cloudflare decisions
- `ARCHITECTURE.md` — Project structure, route table, Keystatic patterns
- `FEATURES.md` — Content model definitions, feature prioritization
- `PITFALLS.md` — Critical pitfalls (Vercel commercial restriction, Keystatic image path, static export ban, etc.)
- `SUMMARY.md` — General project overview

#### 2. Q&A Reviewed
Elif's `Marginalia Website Q&A` (dated 2026-04-04) reviewed in full. Key decisions extracted:

- **Releases:** Always multiple artists. Catalog number (MRGNL001 format). Types: Single/EP/Album/Compilation/Edit. Platforms: Proton Distribution + Bandcamp + SoundCloud + Laylo.
- **Artists:** Roster includes ELIF, Liminal, Predex. Per artist: Bio, Photo, SoundCloud, Spotify, Beatport, Instagram, RA, YouTube, Laylo, Booking email.
- **Podcasts:** "Marginalia Podcasts" on SoundCloud. Linked per release (some like 035 have none). A/B/C variants possible.
- **Demo form:** SC link only (download-enabled private track). Sends to elif@marginalialabel.com.
- **Nav structure:** Home · About · Releases · Free Downloads · Merch · Podcasts · Showcases · Demo · Subscribe · Press + Incubation: Management · Mix&Master · Production · Mentoring
- **CMS management:** Fabio (day-to-day), ELIF (approval)
- **Domain:** marginalialabel.com (replacing Squarespace)
- **Stack:** Confirmed — Next.js 15 + Keystatic + Cloudflare Workers (free tier)

#### 3. Memory Files Created
2 memory files written to `.claude/projects/.../memory/`:
- `project_marginalia.md` — Stack, roadmap, critical decisions
- `project_qa_notes.md` — All content decisions extracted from Q&A

#### 4. Phase 1 Context and Research Created
`.planning/phases/01-infrastructure-schema-foundation/` directory created.

- `01-CONTEXT.md` — Derived from Q&A. Full field list per collection, singleton definitions, nav structure, CMS workflow, placeholder file info.
- `01-RESEARCH.md` — Compiled from global research, scoped to Phase 1. Stack table, critical pitfalls, project structure, Keystatic route pattern, build commands, validation checkpoints.

#### 5. Phase 1 Planned (via gsd-planner)
3 plans created, passed through plan checker (0 blockers, 2 warnings fixed):

| Plan | Wave | Content |
|------|------|---------|
| 01-01 | 1 | Next.js 15 scaffold + all dependencies + wrangler.jsonc + content/image directories |
| 01-02 | 2 | Keystatic schema (5 collections + 2 singletons) + admin routes + reader |
| 01-03 | 3 | OpenNext build verify + image path test + CMS workflow documentation |

Plan checker warnings:
- `app/keystatic/keystatic-app.tsx` missing from `files_modified` list → added
- `01-VALIDATION.md` missing → created with 14 checkpoints

#### 6. Wave 1 Executed — COMPLETE ✓
`gsd-executor` agent ran in a worktree. One deviation:
- `create-next-app` rejected non-empty directory → scaffolded in temp dir, files moved over
- Result identical, no issue

**Files merged to main after Wave 1:**

```
package.json             Next.js 15 + 20+ dependencies
tsconfig.json
next.config.ts           No output: 'export' (critical)
wrangler.jsonc           Cloudflare Workers config (marginalia-label)
app/layout.tsx           Root layout
app/page.tsx             "Marginalia" placeholder homepage
app/globals.css          Tailwind v4 CSS-first (@import "tailwindcss")
eslint.config.mjs
postcss.config.mjs
README.md
content/releases/        .gitkeep
content/artists/         .gitkeep
content/podcasts/        .gitkeep
content/press/           .gitkeep
content/showcases/       .gitkeep
public/images/releases/  .gitkeep
public/images/artists/   .gitkeep
public/images/showcases/ .gitkeep
package-lock.json
```

---

### Installed Dependencies

```
# Core
next@15.x, react@19.x, typescript@5.x

# CMS
@keystatic/core, @keystatic/next

# Deployment
@opennextjs/cloudflare, wrangler (dev)

# Forms
react-hook-form, zod, zod-form-data

# Email
resend

# UI / Embeds
react-lite-youtube-embed, sonner, server-only

# Dev Tools
prettier, prettier-plugin-tailwindcss, @next/bundle-analyzer
```

---

### Commit History (this shift)

```
68138c2  docs(01-01): complete project scaffold and cloudflare config plan
02d666b  feat(01-01): add wrangler.jsonc and content directory structure
5802d66  feat(01-01): scaffold Next.js 15 project with all dependencies
4ceb598  docs(phase-1): plan Infrastructure & Schema Foundation (3 plans, 3 waves)
f32f791  docs(01): create phase 1 execution plans
```

---

### Pending Decisions

- **Waiting on Ozge:**
  - Color palette (fixed background vs. artwork-adaptive?)
  - Typography / font selection
  - Logo files and brand guidelines (to be uploaded via Keystatic)

- **Waiting on Fabio:**
  - Full platform list distributed by Proton Distribution (Tidal, Deezer, Boomkat, Juno, etc.)
  - HypeEdit account status (transfer from old label manager or set up fresh?)

---

### Next Session — Resume Command

```
/gsd-execute-phase 1 --wave 2
```
→ Keystatic schema will be defined. Estimated 10–15 min.

Then:
```
/gsd-execute-phase 1 --wave 3
```
→ Build verify + **you will upload a test image** via `/keystatic` admin (a few clicks). Then workflow documentation will be written.

Once Wave 3 is done, Phase 1 is complete. Move to Phase 2: Design System (after Ozge's brand files arrive).

---

*Shift 1 recorded: 2026-04-16*
