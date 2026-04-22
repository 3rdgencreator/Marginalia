# Phase 3: Releases — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 03-releases
**Areas discussed:** Grid & card design, Release detail page layout, Platform links, Sort order & filtering

---

## Grid & Card Design

| Option | Description | Selected |
|--------|-------------|----------|
| Artwork + text overlay (always) | Cards always show title/artist over artwork | |
| Artwork only — hover reveals title/artist | Pure visual grid; desktop hover reveals info | ✓ |
| Artwork + text below | Image card with text beneath | |

**User's choice:** Artwork-only cards. Desktop hover reveals title + artist name. Mobile/touch taps go directly to release detail page — no tap-to-reveal.

**Grid columns:** 3 mobile → 4 tablet (md+) → 5 desktop (lg+)

**Notes:** User said "change desktop to 5 and re arrange others" — confirmed as 3→4→5. Cards are square 1:1 aspect ratio.

---

## Release Detail Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single column (stacked) | All content stacks vertically | |
| Two-column: left artwork sticky | Left: sticky cover art; Right: metadata + embed + description scrolls | ✓ |
| Two-column: right artwork sticky | Right: sticky cover art; Left: metadata scrolls | |

**SoundCloud embed position:**
- Above the metadata header | |
- Below the metadata, above the description | ✓ |
- Below the description | |

**Metadata header content:**
- Full: title + artist + date + catalog number + genres + release type | |
- Minimal: title + artist + date only | ✓ |
- Ultra-minimal: title + artist only | |

**User's choice:** Two-column at desktop (left sticky artwork, right scrolls). Mobile stacks artwork full-width at top. SoundCloud embed below metadata, above description. Metadata header: title + artist + date only.

**Notes:** Catalog number and genres may appear in a secondary section lower on the page (Claude's discretion).

---

## Platform Links

| Option | Description | Selected |
|--------|-------------|----------|
| All platforms in one list | Single flat list of all platform links | |
| Primary icons + secondary list | Icon row for key platforms, text list for the rest | |
| Icon row + Laylo CTA + collapsible "More Platforms" | Primary icon row + accent Laylo button + collapsible secondary section | ✓ |

**Primary platforms (icon-only row):** Beatport, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp

**Laylo:** Separate accent-colored CTA button ("Pre-save" / "Subscribe") — visually distinct from icon row

**Secondary platforms:** All remaining URL fields shown in "More Platforms" collapsible section

**Icon style:**
- Text + icon | |
- Icon-only (like SocialIcon in footer) | ✓ |

**User's choice:** Primary icon-only row (same pattern as SiteFooter SocialIcon). Laylo gets accent-colored standalone button. All other platforms collapsed under "More Platforms".

**Notes:** User originally described in mixed Turkish/English: "beatport spotify soundcloud apple music dezeer bandcamp bunlar önemli laylo subbscribe button da önemli release page de onun dışında kalan platformları more platforms diye mi koysak" — translated: these platforms are important, Laylo subscribe button is important too on the release page, should we put the rest under "more platforms"?

---

## Sort Order & Filtering

| Option | Description | Selected |
|--------|-------------|----------|
| Newest first (release date descending) | Sort by releaseDate desc | ✓ |
| Oldest first | Sort by releaseDate asc | |
| Manual order (Keystatic field) | Editor-controlled sort order field | |

**Filtering:**
- Genre/type filter chips | |
- No filtering in Phase 3 | ✓ |

**User's choice:** Release date descending (newest first). No filtering in Phase 3.

---

## Claude's Discretion

- Hover overlay exact style (opacity level, gradient vs solid, transition duration)
- Whether catalog number and genres appear in a secondary section below the embed/description
- Loading skeleton design for SoundCloud embed
- Exact Laylo button color (lime vs violet) and label text
- "More Platforms" expand/collapse implementation (`<details><summary>` vs `useState`)
- Genre chip rendering in secondary section (if shown)
- Exact SoundCloud iframe parameters
- Whether to use `next/image` with `sizes` prop or `fill` for cover art in detail page left column

---

## Deferred Ideas

- Genre and release-type filtering on /releases — noted for Phase 7 Polish
- Sorting controls (user-selectable sort) — not in Phase 3
- Artist cross-linking from release cards — deferred to Phase 4 (artist pages don't exist yet)
- Persistent audio player across page navigation — v2 requirement (AUDIO-01/02/03)
