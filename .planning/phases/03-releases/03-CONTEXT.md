# Phase 3: Releases - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the full releases catalog experience:
- `/releases` — full artwork-led catalog grid of all releases
- `/releases/[slug]` — individual release detail page with metadata, SoundCloud embed, and buy/stream links
- Release pages have correct Open Graph metadata and JSON-LD structured data (REL-06, REL-07)
- Featured releases flag powers homepage surfacing (REL-05 — implementation deferred to Phase 5, but `featured` field must be respected)

This phase does NOT implement the homepage (Phase 5) or artist profile linking from release pages (Phase 4). Artist names on release pages can link to `/artists/[slug]` route strings, but those pages are built in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Catalog Grid (/releases)
- **D-01:** Artwork-only cards — NO text on any viewport. Pure visual grid. No title, no artist name, no catalog number on the card itself.
- **D-02:** Grid breakpoints: `grid-cols-3` mobile → `grid-cols-4` tablet (md+) → `grid-cols-5` desktop (lg+)
- **D-03:** Desktop hover: subtle dark overlay on hover reveals title + artist name (transition, not static). The overlay is informational — primary navigation is via click.
- **D-04:** Mobile/touch: no tap-to-reveal overlay. Tapping goes straight to the release detail page. Title and artist are only seen on the detail page.
- **D-05:** Cards are square (1:1 aspect ratio) — cover art fills the card with `object-cover`.
- **D-06:** Sort order: release date descending (newest first). No filtering in Phase 3.

### Release Detail Page (/releases/[slug])
- **D-07:** Two-column layout at desktop (md+): left column = sticky cover artwork; right column = metadata + embed + description scrolls.
- **D-08:** On mobile: artwork full-width at top, content stacks below.
- **D-09:** Metadata header (minimal): title, artist name(s), release date. Catalog number, genres, and release type are NOT in the prominent header area. (Claude's discretion on whether to show catalog number/genres in a secondary area lower on the page.)
- **D-10:** Artist names on the detail page should link to `/artists/[slug]` — but those pages don't exist yet. Render as links regardless; they'll 404 until Phase 4 builds them.
- **D-11:** SoundCloud embed: positioned BELOW the metadata header, ABOVE the description. Uses `next/dynamic({ ssr: false })` — renders skeleton placeholder while loading. No exceptions to this rule (STATE.md embed pattern).
- **D-12:** SoundCloud embed source: the schema's `soundcloudUrl` field stores a standard premiere URL (e.g. `https://soundcloud.com/artist/track`). Construct the iframe embed URL from this: `https://w.soundcloud.com/player/?url={encodeURIComponent(soundcloudUrl)}&...`. No separate embed URL field needed.
- **D-13:** If `soundcloudUrl` is empty/null, the embed section is omitted entirely (no empty iframe, no broken placeholder).
- **D-14:** Description field is a Keystatic rich-text document — render using `@keystatic/core/renderer` `DocumentRenderer` component.

### Platform Links
- **D-15:** Primary platforms (icon-only row, same style as footer SocialIcon): Beatport, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp. Rendered only when URL is present.
- **D-16:** Laylo (presave/subscribe link) gets a separate accent-colored CTA button — visually distinct from the icon row. Positioned above the icon row. Exact color: Claude's discretion (lime `--color-accent-lime` or violet `--color-accent-violet`).
- **D-17:** Secondary platforms — all remaining URL fields (Tidal, Traxsource, Juno, Boomkat, Amazon, YouTube, Anghami, MixCloud, NetEase, Pandora, Saavn, Facebook, Bandcamp if not in primary) — shown in a collapsible "More Platforms" section. Rendered only when at least one secondary URL is present.
- **D-18:** All platform icon paths: use Simple Icons (same approach as Phase 2 SocialIcon). All anchors use `target="_blank" rel="noopener noreferrer"`.
- **D-19:** Platform icons for primary row: reuse the `SocialIcon` component style from Phase 2 or create a `ReleaseLink` component following the same pattern.

### Open Graph & Structured Data
- **D-20:** OG image = cover art (`/images/releases/[filename]`). Use Next.js `generateMetadata` function on the release page route.
- **D-21:** JSON-LD type: `MusicAlbum`. Required fields: `name` (title), `byArtist` (artist name(s)), `datePublished` (releaseDate). Additional fields at Claude's discretion (image, description, url).
- **D-22:** JSON-LD rendered as an inline `<script type="application/ld+json">` via Next.js. Not a separate API endpoint.

### Claude's Discretion
- Hover overlay exact style (opacity level, gradient vs solid, transition duration)
- Whether catalog number and genres appear in a secondary section below the embed/description
- Loading skeleton design for SoundCloud embed (height, background color)
- Exact Laylo button color (lime vs violet) and label text ("Pre-save" / "Subscribe" / "Follow")
- "More Platforms" expand/collapse implementation (`<details><summary>` vs `useState`)
- Genre chip rendering in secondary section (if shown)
- Exact SoundCloud iframe parameters (color, auto_play, hide_related, show_comments, visual mode)
- Whether to use `next/image` with `sizes` prop or `fill` for cover art in detail page left column

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Keystatic Schema (source of truth for field names)
- `keystatic.config.ts` — `releases` collection schema: all field names, types, image directory (`public/images/releases`), publicPath (`/images/releases/`)

### Keystatic Reader Pattern
- `lib/keystatic.ts` — `reader` export pattern (same as Phase 2 SiteFooter)

### Design System (tokens and components to reuse)
- `app/globals.css` — All `--color-*`, `--space-*`, `--text-*`, `--nav-height-*` tokens
- `components/layout/Container.tsx` — Max-width wrapper (reuse on all new pages)
- `components/ui/SocialIcon.tsx` — Icon anchor pattern to replicate for platform links

### Phase 2 Layout Shell
- `components/layout/SiteNav.tsx` — already wired in root layout, no changes needed
- `components/layout/SiteFooter.tsx` — already wired in root layout, no changes needed
- `app/layout.tsx` — root layout, no changes needed in Phase 3

### Project State
- `.planning/STATE.md` — Critical: `next/dynamic({ ssr: false })` for ALL embeds; `"use client"` leaf-only rule; image path pairing rule

### Requirements
- `.planning/REQUIREMENTS.md` §Releases — REL-01 through REL-07

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/layout/Container.tsx` — max-width wrapper, use on /releases and /releases/[slug]
- `components/ui/SocialIcon.tsx` — icon anchor pattern with null-on-empty; replicate for platform link icons
- `app/globals.css` — `--color-surface`, `--color-bg`, `--color-text-primary`, `--color-accent-lime`, `--color-accent-violet` — all available for release pages
- `lib/keystatic.ts` — `reader` export, use `reader.collections.releases.all()` and `reader.collections.releases.read(slug)`

### Established Patterns
- `next/dynamic({ ssr: false })` — embed wrapper pattern (established in STATE.md, not yet used in code but locked decision)
- `next/image` with `priority` for above-the-fold images — established in Logo.tsx
- `generateMetadata` export from Next.js App Router — use for OG tags on release detail page
- No `tailwind.config.js` — all token references use `bg-[--color-*]`, `text-[--color-*]` arbitrary value syntax

### Integration Points
- `app/releases/page.tsx` — new file (catalog grid)
- `app/releases/[slug]/page.tsx` — new file (detail page)
- `app/releases/[slug]/page.tsx` exports `generateStaticParams` for static generation of known slugs
- Cover art served from `/images/releases/[filename]` — Keystatic writes to `public/images/releases/`

</code_context>

<specifics>
## Specific Ideas

- Platform link icon row uses the same Simple Icons source as Phase 2 SocialIcon — fetch paths at planning/execution time from `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/<slug>.svg`
- SoundCloud iframe URL construction: `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&color=%239EFF0A&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true` — visual mode looks best with dark backgrounds
- "More Platforms" section label could be "More" or "Also available on" — Claude's discretion
- The Laylo presave button is only shown when `layloUrl` is present (same null-check pattern as SocialIcon)

</specifics>

<deferred>
## Deferred Ideas

- Genre and release-type filtering on /releases — noted for Phase 7 Polish
- Sorting controls (user-selectable sort) — not in Phase 3
- Artist cross-linking from release cards — deferred to Phase 4 (artist pages don't exist yet)
- Persistent audio player across page navigation — v2 requirement (AUDIO-01/02/03)

</deferred>

---

*Phase: 03-releases*
*Context gathered: 2026-04-22*
