---
plan: 05-05
phase: 05-secondary-content-pages
status: complete
type: execute
---

## Summary

Replaced the placeholder `app/page.tsx` with the full Marginalia homepage.

## What Was Built

**app/page.tsx** — Async server component homepage with four sections:

1. **YouTube Hero** — Full-viewport (`h-[100dvh]`) section with desktop (16:9, `hidden md:block`) and mobile (9:16, `block md:hidden`) iframe backgrounds. `buildYouTubeEmbedUrl` helper extracts 11-char video ID via regex — raw CMS URL never reaches iframe src. Includes `playlist: match[1]` for loop=1 compatibility. Dark overlay (`bg-black/30`) ensures Logo legibility.

2. **Beatport Accolade Badge** — Rendered only when `homePage.beatportAccolade` is non-empty (per D-06). Shows `HYPE LABEL OF THE MONTH` label and accolade text with violet left border treatment.

3. **Featured Releases Grid** — Filters `releases` collection by `entry.featured === true` (per D-07). Uses own grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4`) — NOT ReleaseGrid component (which has catalog density). Section omitted entirely when no featured releases.

4. **Artist Roster Teaser** — Reads all artists; filters by `featuredArtistSlugs` when non-empty (per D-08 guard: `Array.isArray && length > 0`), otherwise shows all artists. Same grid density as releases.

## Key Decisions

- `.read()` used (not `.readOrThrow()`) — home.yaml seeded but may be empty
- `buildYouTubeEmbedUrl` is file-scoped function (not imported) — no server-only boundary concerns
- ReleaseGrid explicitly excluded — homepage grid has different column count than catalog

## Self-Check: PASSED

- ✓ No `"use client"` directive
- ✓ `reader.singletons.homePage.read()` (not readOrThrow)
- ✓ `buildYouTubeEmbedUrl` with regex video ID extraction
- ✓ `playlist: match[1]` in YouTube params
- ✓ `hidden md:block` / `block md:hidden` on iframes
- ✓ `{beatportAccolade && (` conditional
- ✓ `entry.featured === true` filter
- ✓ `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` own grid
- ✓ `Array.isArray(featuredArtistSlugs) && featuredArtistSlugs.length > 0` guard
- ✓ No ReleaseGrid import
- ✓ Tailwind v4 syntax throughout (no `bg-[--` or `text-[--`)
