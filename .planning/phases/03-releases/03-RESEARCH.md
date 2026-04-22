# Phase 3: Releases — Research

**Researched:** 2026-04-22
**Domain:** Next.js 16 App Router dynamic routes (`app/releases/[slug]`) reading Keystatic YAML collections; artwork-led responsive grid; client-only SoundCloud iframe embed; Open Graph metadata via `generateMetadata`; inline JSON-LD `MusicAlbum` structured data; static site generation (SSG) on Cloudflare Workers via `@opennextjs/cloudflare`
**Confidence:** HIGH — all load-bearing decisions locked in CONTEXT.md and UI-SPEC.md; remaining research is prescriptive API validation against current Next.js 16 / Keystatic 0.5.50 / OpenNext behavior

---

## Summary

Phase 3 ships the releases catalog (`/releases`) and per-release detail pages (`/releases/[slug]`) against a fully-resolved UI contract (22 locked decisions in `03-CONTEXT.md`, 556-line UI-SPEC). Every load-bearing UX choice is already decided — this research is prescriptive, not exploratory.

Three hard constraints surface from current API docs that either (a) amend or (b) add precision to the UI-SPEC:

1. **`next/dynamic({ssr:false})` must be called inside a Client Component** — Next.js 16 App Router throws a build error if called from a Server Component. The UI-SPEC Component Inventory places `SoundCloudEmbed` as a "Server Component (wrapper)" calling `next/dynamic` with `ssr:false`. That's a Next.js 16 violation. The fix is a one-file change: make `SoundCloudEmbed` a Client Component (`"use client"`) that calls `next/dynamic({ssr:false})` and renders the skeleton as the `loading` prop. Server `page.tsx` passes props (soundcloudUrl) into this client boundary. Zero other changes to the UI-SPEC.

2. **Next.js 16 params are `Promise<{slug:string}>`** — in App Router 16, `params` must be `await`ed in page components and `generateMetadata`. The existing codebase has no dynamic routes yet, so no analog to copy from. Research Pattern 3 in this doc shows the canonical shape.

3. **Keystatic document fields are async functions** — `description` from `reader.collections.releases.read(slug)` returns as `description()` (a function that must be called and awaited). The fix is to pass `{resolveLinkedFiles: true}` as the second arg to `read()` — this eagerly resolves the document so you can pass it directly to `<DocumentRenderer document={entry.description} />`. Using `all()` for the catalog grid does NOT require this option (grid doesn't render description).

One blocker surfaced: **no seeded release content exists yet**. `content/releases/` has only `.gitkeep`; `public/images/releases/` is empty. The phase cannot render a catalog without at least one release entered via `/keystatic` admin. Planner must include either (a) a seed-content prerequisite (user enters ≥1 release before execution), (b) a graceful empty-state path (UI-SPEC §Copywriting already specifies this copy), or (c) both. Option (c) is safest — empty-state must exist anyway for the edge case where the label is between releases.

One Next.js 16 API change to thread through all new code: **`priority` prop on `<Image>` is deprecated in favor of `preload`** (Next.js 16.0.0 release). Existing `Logo.tsx` uses `priority`; new Phase 3 cover art should use `preload` to be forward-compatible. Non-blocking, but worth standardizing now.

**Primary recommendation:** Follow UI-SPEC.md verbatim for layout, tokens, and component inventory — with two precise amendments: (1) move `"use client"` onto `SoundCloudEmbed.tsx` itself (collapsing `SoundCloudEmbed` + `SoundCloudPlayer.client.tsx` into one Client Component), and (2) use `preload` instead of `priority` on `<Image>` in the detail-page cover. Use `reader.collections.releases.all({resolveLinkedFiles: true})` in the catalog page so future needs (e.g. truncated description in grid hover) work without refactoring. Use `read(slug, {resolveLinkedFiles: true})` in the detail page for direct DocumentRenderer consumption. Add `generateStaticParams` returning all known slugs for SSG. Seed at least one release before running `npm run build`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Catalog Grid (`/releases`)**
- **D-01:** Artwork-only cards — NO text on any viewport. Pure visual grid. No title, no artist name, no catalog number on the card itself.
- **D-02:** Grid breakpoints: `grid-cols-3` mobile → `grid-cols-4` tablet (md+) → `grid-cols-5` desktop (lg+)
- **D-03:** Desktop hover: subtle dark overlay on hover reveals title + artist name (transition, not static). The overlay is informational — primary navigation is via click.
- **D-04:** Mobile/touch: no tap-to-reveal overlay. Tapping goes straight to the release detail page. Title and artist are only seen on the detail page.
- **D-05:** Cards are square (1:1 aspect ratio) — cover art fills the card with `object-cover`.
- **D-06:** Sort order: release date descending (newest first). No filtering in Phase 3.

**Release Detail Page (`/releases/[slug]`)**
- **D-07:** Two-column layout at desktop (md+): left column = sticky cover artwork; right column = metadata + embed + description scrolls.
- **D-08:** On mobile: artwork full-width at top, content stacks below.
- **D-09:** Metadata header (minimal): title, artist name(s), release date. Catalog number, genres, and release type are NOT in the prominent header area. (Claude's discretion on whether to show catalog number/genres in a secondary area lower on the page.)
- **D-10:** Artist names on the detail page should link to `/artists/[slug]` — but those pages don't exist yet. Render as links regardless; they'll 404 until Phase 4 builds them.
- **D-11:** SoundCloud embed: positioned BELOW the metadata header, ABOVE the description. Uses `next/dynamic({ ssr: false })` — renders skeleton placeholder while loading. No exceptions to this rule (STATE.md embed pattern).
- **D-12:** SoundCloud embed source: the schema's `soundcloudUrl` field stores a standard premiere URL (e.g. `https://soundcloud.com/artist/track`). Construct the iframe embed URL from this: `https://w.soundcloud.com/player/?url={encodeURIComponent(soundcloudUrl)}&...`. No separate embed URL field needed.
- **D-13:** If `soundcloudUrl` is empty/null, the embed section is omitted entirely (no empty iframe, no broken placeholder).
- **D-14:** Description field is a Keystatic rich-text document — render using `@keystatic/core/renderer` `DocumentRenderer` component.

**Platform Links**
- **D-15:** Primary platforms (icon-only row, same style as footer SocialIcon): Beatport, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp. Rendered only when URL is present.
- **D-16:** Laylo (presave/subscribe link) gets a separate accent-colored CTA button. Final UI-SPEC resolution: **lime default, violet hover**, label **"Pre-save"** (or **"Save"** when releaseDate ≤ today).
- **D-17:** Secondary platforms (Tidal, Traxsource, Juno, Boomkat, Amazon, YouTube, Anghami, MixCloud, NetEase, Pandora, Saavn, Facebook) — collapsible "Also available on" section. Rendered only when at least one secondary URL is present. Implementation: native `<details><summary>` (UI-SPEC resolves D-17's Claude's discretion).
- **D-18:** All platform icon paths: use Simple Icons. All anchors use `target="_blank" rel="noopener noreferrer"`.
- **D-19:** Platform icons for primary row: reuse the `SocialIcon` component style from Phase 2 or create a `ReleaseLink` component following the same pattern.

**Open Graph & Structured Data**
- **D-20:** OG image = cover art (`/images/releases/[filename]`). Use Next.js `generateMetadata` function on the release page route.
- **D-21:** JSON-LD type: `MusicAlbum`. Required fields: `name` (title), `byArtist` (artist name(s)), `datePublished` (releaseDate). Additional fields at Claude's discretion (image, description, url).
- **D-22:** JSON-LD rendered as an inline `<script type="application/ld+json">` via Next.js. Not a separate API endpoint.

### Claude's Discretion (resolved in UI-SPEC)

All UI-SPEC resolutions of Claude's Discretion items are locked by gsd-ui-researcher approval and must be treated as decisions, not open questions:

- Hover overlay: `rgba(31,31,33,0.70)` solid, 200ms ease-out opacity transition
- Catalog number + genres: render in secondary section below description (resolves "whether to show")
- Embed skeleton: 166px tall, `--color-surface` background, no animation
- Laylo color + label: lime default, violet hover, "Pre-save" label (swaps to "Save" when releaseDate ≤ today)
- "More Platforms" mechanism: native `<details><summary>` (not useState), label "Also available on"
- SoundCloud iframe params: lime color, `auto_play=false`, `hide_related=true`, `show_comments=false`, `show_user=true`, `show_reposts=false`, `show_teaser=false`, `visual=true`
- Cover art: `<Image>` with `sizes` (not `fill`) on detail page

### Deferred Ideas (OUT OF SCOPE)

- Genre and release-type filtering on `/releases` (deferred to Phase 7 Polish)
- User-selectable sort controls (not in v1)
- Artist cross-linking from release cards (deferred to Phase 4 — artist pages don't exist yet)
- Persistent audio player across page navigation (v2 requirement AUDIO-01/02/03)
- Featured releases on homepage (REL-05 logic is Phase 5's `/` page; Phase 3 only ensures `featured: true` flag is accessible via the reader; no UI for it in Phase 3)

### Research-Surfaced Amendments (for planner review)

1. **UI-SPEC §Component Inventory line: `SoundCloudEmbed` is Server Component → must be Client Component** in Next.js 16. `next/dynamic({ssr:false})` throws in Server Components. Amendment: single `SoundCloudEmbed.tsx` with `"use client"` directive; delete the proposed `SoundCloudPlayer.client.tsx` (redundant after merge). Skeleton moves into the `loading` prop of `dynamic()`. See Pitfall #1 below.
2. **`priority` prop on `<Image>`** is deprecated in Next.js 16.0.0; use `preload` instead. Applies to the detail-page cover art (LCP element). See Pitfall #4.
3. **Document field access**: call `reader.collections.releases.read(slug, {resolveLinkedFiles: true})` so `entry.description` is the resolved document (ready for `DocumentRenderer`), not an async function requiring `await entry.description()`. Without this option, TypeScript will flag the wrong type and the renderer will crash. See Pattern 4.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REL-01 | Releases catalog page displays all releases in a bold artwork-led grid | `/releases` page uses `reader.collections.releases.all()` server-side, maps to `ReleaseCard` components in 3/4/5 responsive grid. Sort by `releaseDate` DESC. Empty-state handled per UI-SPEC Copywriting. |
| REL-02 | Individual release page shows artwork, title, artist, date, genre, and description | `/releases/[slug]/page.tsx` uses `reader.collections.releases.read(slug, {resolveLinkedFiles:true})`. Renders `<Image>`, H1 title, artist links, date, genre chips (secondary section), and `<DocumentRenderer document={entry.description}/>`. See Pattern 4. |
| REL-03 | SoundCloud embed loads on release page (client-only, hydration-safe) | `SoundCloudEmbed.tsx` is a Client Component that calls `next/dynamic(() => import('./SoundCloudPlayer'), {ssr:false, loading: () => <EmbedSkeleton/>})`. Iframe URL built from `soundcloudUrl` per D-12. See Pattern 5. |
| REL-04 | Beatport and Spotify links displayed on release page | Primary platform row renders `ReleaseLink` per platform with null-on-empty (same pattern as Phase 2 `SocialIcon`). Six primary platforms per UI-SPEC: Beatport, Spotify, SoundCloud, Apple Music, Deezer, Bandcamp. |
| REL-05 | Featured releases appear on the homepage | Phase 3 does NOT implement the homepage (Phase 5). This phase ensures `featured` field is exposed by the reader (automatic — schema already declares it). No Phase 3 UI work for this requirement; the traceability matrix must note completion of "prep for REL-05" only. |
| REL-06 | Release pages have correct Open Graph metadata (artwork as OG image) | `generateMetadata` export on `/releases/[slug]/page.tsx` returns `{title, description, openGraph:{title, description, images, type:'music.album', url}, twitter:{card:'summary_large_image', images}}`. Image URL is absolute (computed via `metadataBase`). See Pattern 6. |
| REL-07 | Release pages include JSON-LD MusicAlbum structured data | Inline `<script type="application/ld+json">{JSON.stringify(jsonLd)}</script>` rendered by the page Server Component. `@type: MusicAlbum`, fields per UI-SPEC §JSON-LD Contract. See Pattern 7. |

</phase_requirements>

<referenced_docs>
## Referenced Phase Documents (MUST READ before planning)

- `.planning/phases/03-releases/03-CONTEXT.md` — 22 locked decisions, source of truth for behavior
- `.planning/phases/03-releases/03-UI-SPEC.md` — complete visual/interaction contract (556 lines)
- `.planning/phases/03-releases/03-DISCUSSION-LOG.md` — rationale trace for decisions
- `.planning/STATE.md` — `next/dynamic({ssr:false})` rule, `"use client"` leaf-only rule, image path pairing rule
- `.planning/REQUIREMENTS.md` §Releases — REL-01 through REL-07
- `keystatic.config.ts` — **authoritative source** for field names on the `releases` collection
- `lib/keystatic.ts` — `reader` export (already created in Phase 1)
- `components/layout/Container.tsx` — max-width wrapper (reuse on `/releases` and `/releases/[slug]`)
- `components/ui/SocialIcon.tsx` — icon anchor pattern to replicate for platform links
- `components/layout/SiteFooter.tsx` — reference for async Server Component reading Keystatic singleton

</referenced_docs>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Release YAML entries (content) | Database / Storage (filesystem) | — | `content/releases/*.yaml` authored via Keystatic admin in local mode; reader loads at build/request time |
| Cover art binaries (`/public/images/releases/*`) | CDN / Static (Workers Assets) | — | Keystatic `fields.image` writes to `public/images/releases/` which OpenNext serves via `ASSETS` binding |
| Catalog page render (`/releases`) | Frontend Server (SSR/SSG) | Database / Storage | Server Component reads all releases via `reader.collections.releases.all()`, emits HTML with embedded `<img>`; statically prerendered at build by default |
| Detail page render (`/releases/[slug]`) | Frontend Server (SSG) | Database / Storage | `generateStaticParams` enumerates known slugs; page is prerendered per slug; HTML includes OG meta + JSON-LD |
| Grid card hover overlay (desktop) | Browser / Client (CSS-only) | — | Pure `group-hover:opacity-100` Tailwind utility — no JS, no hydration boundary |
| Mobile card tap → navigation | Frontend Server (SSR anchor) | Browser / Client (link nav) | Card wraps a standard `<a>` — no JS needed |
| SoundCloud iframe embed | Browser / Client (hydration island) | — | `next/dynamic({ssr:false})` delays mount until after hydration — prevents SSR-produced iframe markup that could mismatch |
| Embed skeleton placeholder | Frontend Server (SSR) + Browser / Client | — | Skeleton is server-rendered (part of the initial HTML) and replaced client-side when the player chunk resolves |
| "Also available on" disclosure | Frontend Server (SSR, CSS-only interactivity) | — | Native `<details><summary>` — zero JS, browser handles open/close |
| Laylo CTA button | Frontend Server (SSR anchor) | — | Standard `<a>` with `target="_blank"` — no client state needed |
| Artist name link to `/artists/[slug]` | Frontend Server (SSR) | — | Server-rendered `<a>` (Next.js `<Link>`). Link target 404s until Phase 4 — per D-10, this is acceptable |
| OG metadata generation | Frontend Server (build/request) | — | `generateMetadata` runs server-side as part of page rendering; output inlined into `<head>` |
| JSON-LD structured data | Frontend Server (SSR) | — | Inline `<script type="application/ld+json">` rendered by the page component — part of SSR HTML |
| Image optimization for cover art | CDN / Static (Cloudflare Images) | Frontend Server (loader) | OpenNext supports `next/image` via custom loader + `IMAGES` binding in wrangler — optional but recommended for Phase 7 performance; Phase 3 can ship without it (see Pitfall #5) |

**Tier-boundary consequences for Phase 3:**
- Only `SoundCloudEmbed.tsx` needs `"use client"`. Every other new component is a Server Component.
- `MorePlatforms` (the `<details>` disclosure) is a Server Component — `<details>` is a native HTML element, no React state.
- Page components (`app/releases/page.tsx`, `app/releases/[slug]/page.tsx`) are Server Components and MUST remain so — `generateMetadata` and `generateStaticParams` only work in Server Components.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.2.4 | App Router, dynamic routes, `generateMetadata`, `generateStaticParams` | [VERIFIED: npm registry, 2026-04-22 returned `16.2.4`] — project pinned. Next.js 16 uses async `params: Promise<...>` [CITED: nextjs.org/docs/app/api-reference/functions/generate-static-params] |
| `react` / `react-dom` | 19.2.5 | UI + Server Components | [VERIFIED: npm registry, 2026-04-22 returned `19.2.5`] |
| `@keystatic/core` | 0.5.50 | Reader API + document renderer | [VERIFIED: npm registry + local node_modules — `0.5.50`]. Exports `./reader` and `./renderer` entries [VERIFIED: package.json exports map] |
| `tailwindcss` | 4.2.4 | Utility CSS | [VERIFIED: npm registry, 2026-04-22 returned `4.2.4`] — used for grid, spacing, color classes |
| `typescript` | 5.x | Type safety | [VERIFIED: package.json] — `params: Promise<{slug:string}>` typing requires TS in strict mode |
| `@opennextjs/cloudflare` | 1.19.1 | Workers deployment | [VERIFIED: package.json] — supports SSG + custom image loader |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new npm packages required | — | — | Phase 3 adds ZERO new dependencies. All functionality uses already-installed packages. `next/dynamic`, `next/image`, `next/link` are all built-in to Next.js. DocumentRenderer is a sub-export of `@keystatic/core`. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `next/dynamic({ssr:false})` for SoundCloud iframe | `useEffect` to inject iframe post-mount | Both avoid hydration mismatch. `next/dynamic` is Next's canonical pattern and provides the `loading` prop for the skeleton in one place. STATE.md locks `next/dynamic` — no deviation. |
| `react-soundcloud-embed` or similar npm wrapper | Raw iframe inside a Client Component | Wrapper libraries add a dependency and often stale API params. Raw iframe with documented SoundCloud URL params is forward-compatible and adds no bundle weight. D-12 locks the raw-iframe approach. |
| `<iframe>` in Server Component with `suppressHydrationWarning` | `next/dynamic({ssr:false})` | `suppressHydrationWarning` hides the warning but does not fix the underlying mismatch; the iframe still mounts server-side and re-mounts client-side, causing a visible flicker and potential audio double-load. **Reject.** STATE.md locks `next/dynamic`. |
| `generateStaticParams` returning all slugs | `dynamicParams: true` + on-demand SSG | SSG-all is simpler, scales to ~50 releases (project's stated v1 ceiling in STATE.md), and guarantees that the SoundCloud iframe URL is known at build time. `dynamicParams: true` would allow future unreleased slugs to render via ISR but Phase 3 doesn't need that. Pick SSG-all. |
| `next/image` with custom Cloudflare loader | `next/image` with `unoptimized` | Custom loader gets WebP/AVIF + `srcset` via Cloudflare Images binding; `unoptimized` ships original JPEGs. For Phase 3, `unoptimized` is acceptable because release cover images are user-uploaded and Phase 7 will revisit performance. **Decision: ship without image optimization in Phase 3; flag for Phase 7.** |
| Inline `<script type="application/ld+json">` in page component | Separate `/releases/[slug]/json-ld` route handler | Inline is simpler and D-22 locks it. Route handler would split the page render from metadata generation unnecessarily. |
| `reader.collections.releases.read(slug)` + `await entry.description()` | `reader.collections.releases.read(slug, {resolveLinkedFiles: true})` | Without `resolveLinkedFiles`, the document field is an async function — TypeScript flags it, and passing the raw function to DocumentRenderer crashes. Always use `{resolveLinkedFiles: true}` when rendering the document. [CITED: keystatic.com/docs/reader-api] |

**Installation:** No `npm install` step. All packages already present in `package.json`.

**Version verification performed:**
- `npm view next version` → `16.2.4` (2026-04-22) [VERIFIED]
- `npm view react version` → `19.2.5` (2026-04-22) [VERIFIED]
- `npm view tailwindcss version` → `4.2.4` (2026-04-22) [VERIFIED]
- `npm view @keystatic/core version` → `0.5.50` (2026-04-22) [VERIFIED]
- `@keystatic/core` package.json exports map confirms `./reader` and `./renderer` entry points [VERIFIED: `node_modules/@keystatic/core/package.json`]
- `DocumentRenderer` signature: `DocumentRenderer<ComponentBlocks>(props: {document: Element[], renderers?, componentBlocks?}): JSX.Element` [VERIFIED: `node_modules/@keystatic/core/dist/declarations/src/renderer.d.ts`]

---

## Architecture Patterns

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Request: GET /releases  OR  GET /releases/{slug}                           │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker entry (@opennextjs/cloudflare)                           │
│    ├─ Static asset? → ASSETS binding (cover images, fonts)                  │
│    └─ Page request? → OpenNext Next.js handler                              │
└──────────────────────────┬─────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  Next.js App Router — Server Component page                                 │
│                                                                             │
│   /releases (SSG)                    /releases/[slug] (SSG per slug)        │
│     │                                 │                                     │
│     ▼                                 ▼                                     │
│  reader.collections.releases        reader.collections.releases             │
│    .all({resolveLinkedFiles:true})    .read(slug,{resolveLinkedFiles:true}) │
│     │                                 │                                     │
│     │ reads YAML + resolves          │ reads YAML + resolves doc field     │
│     │ document fields                │                                     │
│     ▼                                 ▼                                     │
│  ReleaseGrid (Server)               ┌─────────────────────────────────┐   │
│    ├─ sort by releaseDate DESC      │  Release Detail Page (Server)    │   │
│    └─ ReleaseCard (Server, x N)     │    ├─ generateMetadata → <head>  │   │
│        ├─ <a href="/releases/slug"> │    ├─ <script type=              │   │
│        ├─ <Image> cover + object-   │    │   "application/ld+json">    │   │
│        │   cover                    │    ├─ <Image> cover (sticky col) │   │
│        └─ CSS-only hover overlay    │    ├─ ReleaseMetaHeader          │   │
│           (desktop, no JS)          │    ├─ LayloButton (if url)       │   │
│                                     │    ├─ PlatformIconRow (primary)  │   │
│                                     │    ├─ SoundCloudEmbed -----------│---┼─► Client Island
│                                     │    │    ▲                        │   │    │
│                                     │    │    └─ next/dynamic({        │   │    ▼
│                                     │    │         ssr:false,          │   │ Browser: mount
│                                     │    │         loading: Skeleton   │   │ iframe after
│                                     │    │       })                    │   │ hydration
│                                     │    ├─ DocumentRenderer (desc)    │   │
│                                     │    ├─ Secondary meta (genres,    │   │
│                                     │    │   catalog #)                │   │
│                                     │    └─ MorePlatforms <details>    │   │
│                                     └─────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                           │
                           ▼ HTML response
┌────────────────────────────────────────────────────────────────────────────┐
│  Browser                                                                    │
│    1. Parse HTML → render static shell (cover, metadata, skeleton)          │
│    2. React hydrates Client Components (only SoundCloudEmbed.tsx)           │
│    3. next/dynamic resolves → SoundCloudPlayer mounts                       │
│    4. iframe loads SoundCloud (external)                                    │
│    5. User sees player, can click "play", audio streams from SoundCloud CDN │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
app/
├── layout.tsx                          # (unchanged from Phase 2)
├── page.tsx                            # (unchanged — Phase 5 will implement)
├── releases/
│   ├── page.tsx                        # CREATE — catalog grid, Server Component
│   └── [slug]/
│       └── page.tsx                    # CREATE — detail page, Server Component,
│                                       #   exports generateStaticParams + generateMetadata

components/
├── layout/                             # (unchanged from Phase 2)
├── ui/                                 # (unchanged from Phase 2)
└── releases/                           # CREATE directory
    ├── ReleaseCard.tsx                 # Server Component — artwork + CSS hover overlay
    ├── ReleaseGrid.tsx                 # Server Component — responsive grid wrapper
    ├── ReleaseMetaHeader.tsx           # Server Component — title/artists/date block
    ├── ArtistLink.tsx                  # Server Component — <a href="/artists/{slug}">
    ├── GenreChip.tsx                   # Server Component — tag-colored chip
    ├── LayloButton.tsx                 # Server Component — lime CTA, null if no url
    ├── ReleaseLink.tsx                 # Server Component — platform icon anchor
    ├── PlatformIconRow.tsx             # Server Component — primary row composition
    ├── MorePlatforms.tsx               # Server Component — <details> disclosure
    ├── SoundCloudEmbed.tsx             # CLIENT Component — "use client" + next/dynamic
    ├── SoundCloudPlayer.tsx            # Module loaded by next/dynamic — renders <iframe>
    └── EmbedSkeleton.tsx               # Server Component — 166px placeholder

lib/
├── keystatic.ts                        # (unchanged from Phase 1)
└── releases.ts                         # CREATE — helpers: artistResolve, sortByDateDesc,
                                        #   buildSoundCloudEmbedUrl, plainTextFromDocument,
                                        #   buildReleaseMetadata, buildMusicAlbumJsonLd

content/
└── releases/                           # (exists but empty — user must seed via /keystatic)
    └── example-release.yaml            # (seed prerequisite)

public/
└── images/
    └── releases/                       # (exists but empty — Keystatic writes here)
```

**File count:** 2 pages + 12 components + 1 lib helpers file = 15 new files + 0 modifications.

### Pattern 1: Catalog Page (Server Component with Empty State)

```tsx
// app/releases/page.tsx — Server Component
// Source: Keystatic Reader API [CITED: keystatic.com/docs/reader-api]
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ReleaseGrid from '@/components/releases/ReleaseGrid';

export const metadata: Metadata = {
  title: 'Releases — Marginalia',
  description:
    'The Marginalia catalog — melodic house, techno, and underground dance music from Barcelona.',
};

export default async function ReleasesPage() {
  // all() returns [{slug, entry}, ...] — NO resolveLinkedFiles needed here;
  // grid does not render description.
  const releases = await reader.collections.releases.all();

  // Sort newest-first by releaseDate (D-06). Null dates sort to the end.
  const sorted = [...releases].sort((a, b) => {
    const aDate = a.entry.releaseDate ?? '';
    const bDate = b.entry.releaseDate ?? '';
    return bDate.localeCompare(aDate);
  });

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-[--text-heading] font-bold tracking-[-0.02em] mb-8">
        Releases
      </h1>

      {sorted.length === 0 ? (
        // Empty state per UI-SPEC §Copywriting Contract
        <div className="py-16 text-center">
          <h2 className="text-[--text-heading] font-bold mb-4">
            Catalog is loading.
          </h2>
          <p className="text-[--color-text-muted]">
            No releases have been published yet. Check back soon — new music
            drops monthly.
          </p>
        </div>
      ) : (
        <ReleaseGrid releases={sorted} />
      )}
    </Container>
  );
}
```

### Pattern 2: `ReleaseGrid` + `ReleaseCard` (Server Components, CSS-only hover)

```tsx
// components/releases/ReleaseGrid.tsx
import ReleaseCard from './ReleaseCard';

type GridProps = {
  releases: Array<{ slug: string; entry: ReleaseEntry }>;
};

export default function ReleaseGrid({ releases }: GridProps) {
  return (
    <ul className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
      {releases.map(({ slug, entry }) => (
        <li key={slug}>
          <ReleaseCard slug={slug} entry={entry} />
        </li>
      ))}
    </ul>
  );
}
```

```tsx
// components/releases/ReleaseCard.tsx — Server Component
// CSS-only hover overlay; no JS, no hydration boundary.
import Link from 'next/link';
import Image from 'next/image';
import { resolveArtistNames } from '@/lib/releases';

type CardProps = { slug: string; entry: ReleaseEntry };

export default function ReleaseCard({ slug, entry }: CardProps) {
  const artists = resolveArtistNames(entry.artistSlugs);
  const ariaLabel = `${entry.title} by ${artists.join(', ')}`;

  return (
    <Link
      href={`/releases/${slug}`}
      aria-label={ariaLabel}
      className="group relative block aspect-square overflow-hidden bg-[--color-surface]"
    >
      {entry.coverArt && (
        <Image
          src={`/images/releases/${entry.coverArt}`}
          alt={`${entry.title} — ${artists.join(', ')} cover artwork`}
          width={600}
          height={600}
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="h-full w-full object-cover"
        />
      )}

      {/* Desktop-only hover overlay; CSS-only, suppressed on touch devices via
          media query on the parent (or simply via absence of :hover on touch). */}
      <div
        className="
          absolute inset-0
          bg-[rgba(31,31,33,0.70)]
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200 ease-out
          flex flex-col items-center justify-center gap-2 p-4
          pointer-events-none
          hidden md:flex
        "
        aria-hidden="true"
      >
        <span className="text-[--text-body] font-bold text-center">
          {entry.title}
        </span>
        <span className="text-[--text-label] text-[--color-text-secondary] text-center">
          {artists.join(' × ')}
        </span>
      </div>
    </Link>
  );
}
```

### Pattern 3: Dynamic Route + `generateStaticParams` (Next.js 16)

```tsx
// app/releases/[slug]/page.tsx
// Next.js 16: params is Promise<{slug:string}>. Must await.
// [CITED: nextjs.org/docs/app/api-reference/functions/generate-static-params]
import { notFound } from 'next/navigation';
import { reader } from '@/lib/keystatic';

type Params = Promise<{ slug: string }>;

// Enumerate all known release slugs at build time (SSG).
export async function generateStaticParams() {
  const slugs = await reader.collections.releases.list();
  return slugs.map((slug) => ({ slug }));
}

// Fail-fast for unknown slugs in dev; production 404s cleanly.
export const dynamicParams = false;

export default async function ReleasePage({ params }: { params: Params }) {
  const { slug } = await params;

  // resolveLinkedFiles:true — the description document field comes back ready
  // for DocumentRenderer instead of as an async function.
  // [CITED: keystatic.com/docs/reader-api]
  const entry = await reader.collections.releases.read(slug, {
    resolveLinkedFiles: true,
  });
  if (!entry) notFound();

  // ... render (see Pattern 4)
}
```

### Pattern 4: DocumentRenderer for Description Field

```tsx
// inside app/releases/[slug]/page.tsx
import { DocumentRenderer } from '@keystatic/core/renderer';

// With {resolveLinkedFiles:true}, entry.description is Element[] (the document nodes).
// Without it, entry.description is an async function and this would crash.
// [CITED: keystatic.com/docs/reader-api]

<article className="prose prose-invert max-w-none text-[--text-body] leading-normal">
  <DocumentRenderer
    document={entry.description}
    renderers={{
      inline: {
        link: ({ href, children }) => (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="underline decoration-[--color-accent-lime] underline-offset-2 hover:text-[--color-accent-lime]"
          >
            {children}
          </a>
        ),
      },
      block: {
        paragraph: ({ children }) => (
          <p className="mb-4 last:mb-0">{children}</p>
        ),
      },
    }}
  />
</article>
```

### Pattern 5: `SoundCloudEmbed` (Client Component with next/dynamic)

**CRITICAL: `"use client"` is MANDATORY.** Next.js 16 throws a build error if `next/dynamic({ssr:false})` is called from a Server Component.
[CITED: nextjs.org/docs/app/guides/lazy-loading — "ssr: false option is not supported in Server Components. You will see an error if you try to use it in Server Components."]

```tsx
// components/releases/SoundCloudEmbed.tsx
'use client';

import dynamic from 'next/dynamic';
import EmbedSkeleton from './EmbedSkeleton';

const SoundCloudPlayer = dynamic(() => import('./SoundCloudPlayer'), {
  ssr: false,
  loading: () => <EmbedSkeleton />,
});

export default function SoundCloudEmbed({ url }: { url: string }) {
  return <SoundCloudPlayer url={url} />;
}
```

```tsx
// components/releases/SoundCloudPlayer.tsx
// NOT a client component — next/dynamic handles the boundary transparently.
// But because this file is dynamically imported by a client component with
// ssr:false, it effectively only renders in the browser.
import { buildSoundCloudEmbedUrl } from '@/lib/releases';

export default function SoundCloudPlayer({ url }: { url: string }) {
  return (
    <iframe
      title="SoundCloud player"
      src={buildSoundCloudEmbedUrl(url)}
      width="100%"
      height={166}
      scrolling="no"
      frameBorder={0}
      allow="autoplay"
      className="block w-full"
    />
  );
}
```

```ts
// lib/releases.ts (excerpt)
export function buildSoundCloudEmbedUrl(premiereUrl: string): string {
  const base = 'https://w.soundcloud.com/player/';
  const params = new URLSearchParams({
    url: premiereUrl,
    color: '#9EFF0A', // URLSearchParams encodes # → %23 automatically
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'true',
  });
  return `${base}?${params.toString()}`;
}
```

```tsx
// Consumed by the page (Server Component):
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';

{entry.soundcloudUrl && <SoundCloudEmbed url={entry.soundcloudUrl} />}
// D-13: omit section entirely when URL is null/empty.
```

### Pattern 6: `generateMetadata` (Open Graph + Twitter)

```tsx
// app/releases/[slug]/page.tsx
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';

// Set once in root layout.tsx for the whole site, or here for the release route.
// For absolute OG URLs, metadataBase MUST be set.
// Recommendation: add to app/layout.tsx in this phase so future pages inherit.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await reader.collections.releases.read(slug, {
    resolveLinkedFiles: true,
  });
  if (!entry) return { title: 'Release not found — Marginalia' };

  const artists = resolveArtistNames(entry.artistSlugs);
  const title = `${entry.title} — ${artists.join(', ')} — Marginalia`;
  const description =
    plainTextFromDocument(entry.description, 160) ||
    `${entry.title} by ${artists.join(', ')}, out ${entry.releaseDate} on Marginalia.`;
  const imagePath = entry.coverArt
    ? `/images/releases/${entry.coverArt}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.album' as never, // Next.js types lag Schema coverage; allow cast
      url: `/releases/${slug}`,
      images: imagePath
        ? [{ url: imagePath, width: 1200, height: 1200, alt: `${entry.title} cover artwork` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imagePath ? [imagePath] : undefined,
    },
  };
}
```

```ts
// In app/layout.tsx (add to existing metadata export):
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com'
  ),
  title: 'Marginalia — Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
};
```

[CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata — `metadataBase` composition rules; relative paths in metadata fields resolve against metadataBase.]

### Pattern 7: Inline JSON-LD `MusicAlbum`

```tsx
// app/releases/[slug]/page.tsx — inside the component return
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicAlbum',
  name: entry.title,
  byArtist: artists.map((name) => ({ '@type': 'MusicGroup', name })),
  datePublished: entry.releaseDate, // YYYY-MM-DD
  ...(entry.coverArt && {
    image: `https://marginalialabel.com/images/releases/${entry.coverArt}`,
  }),
  ...(plainTextFromDocument(entry.description, 500) && {
    description: plainTextFromDocument(entry.description, 500),
  }),
  url: `https://marginalialabel.com/releases/${slug}`,
  ...(entry.genres?.length && {
    genre: entry.genres.map(genreLabelFor), // human-readable labels, not kebab values
  }),
};

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {/* ... page content */}
  </>
);
```

[CITED: schema.org/MusicAlbum — `MusicAlbum` properties: `name`, `byArtist` (MusicGroup or Person), `datePublished`, plus inherited CreativeWork properties including `image`, `description`, `url`, `genre`.]

### Pattern 8: Helper Library (`lib/releases.ts`)

```ts
// lib/releases.ts
import { reader } from './keystatic';

/**
 * Resolve artistSlugs → display names by reading the artists collection.
 * If an artist entry doesn't exist yet (Phase 4 builds them), fall back to the slug.
 */
export async function resolveArtistNames(
  artistSlugs: readonly string[]
): Promise<string[]> {
  const resolved = await Promise.all(
    artistSlugs.map(async (slug) => {
      const artist = await reader.collections.artists.read(slug);
      return artist?.name ?? slug; // fallback to slug if artist not yet authored
    })
  );
  return resolved;
}

/**
 * Flatten a Keystatic document (array of block nodes) to plain text,
 * truncating to maxChars (adds no ellipsis; caller can add if desired).
 * Used for SEO descriptions and JSON-LD description fields.
 */
export function plainTextFromDocument(
  document: unknown,
  maxChars: number
): string {
  if (!Array.isArray(document)) return '';
  const walk = (node: any): string => {
    if (typeof node?.text === 'string') return node.text;
    if (Array.isArray(node?.children)) return node.children.map(walk).join('');
    return '';
  };
  const flat = document.map(walk).join(' ').replace(/\s+/g, ' ').trim();
  return flat.length > maxChars ? flat.slice(0, maxChars) : flat;
}

const GENRE_LABELS: Record<string, string> = {
  'melodic-house': 'Melodic House',
  techno: 'Techno',
  'indie-dance': 'Indie Dance',
  'organic-house': 'Organic House',
  'afro-house': 'Afro House',
};
export function genreLabelFor(slug: string): string {
  return GENRE_LABELS[slug] ?? slug;
}

export function buildSoundCloudEmbedUrl(premiereUrl: string): string {
  const params = new URLSearchParams({
    url: premiereUrl,
    color: '#9EFF0A',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'true',
  });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
```

### Anti-Patterns to Avoid

- **Putting `"use client"` on `page.tsx`** — `generateMetadata` and `generateStaticParams` are Server-Component-only. Breaks OG tags and SSG. [CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata — "only supported in Server Components"]
- **Calling `next/dynamic({ssr:false})` from a Server Component** — throws at build time. Must be inside a Client Component. See Pattern 5. [CITED: nextjs.org/docs/app/guides/lazy-loading]
- **Calling `reader.collections.releases.read(slug)` WITHOUT `{resolveLinkedFiles:true}` and passing `entry.description` directly to DocumentRenderer** — description is an async function without that option, crashes the renderer.
- **Hardcoding absolute OG URLs in every page instead of setting `metadataBase`** — Next.js recommends setting `metadataBase` in root layout so per-page `openGraph.images: '/relative/path'` is resolved automatically.
- **Rendering artwork-only catalog cards but omitting `alt` text or `aria-label`** — blind users cannot navigate a pure-image grid. UI-SPEC §Accessibility Contract mandates `aria-label="{title} by {artists}"` on the card link AND `alt="{title} — {artists} cover artwork"` on the `<Image>`. Both are required; they serve different user agents.
- **Using `<details open>` inadvertently** — "More platforms" must default collapsed (D-17). Omit the `open` attribute.
- **Storing artist names inline on the release entry instead of resolving via slug** — breaks the Phase 4 integration contract. The schema uses `artistSlugs: string[]`; Phase 4 will author `/artists/[slug]`. Always look up the name via `reader.collections.artists.read(slug)`; fall back to the slug if not yet authored.
- **Loading all releases for every single detail page render** — just call `read(slug, ...)` once. Don't call `all()` in the detail page.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich-text rendering from Keystatic document | Custom recursion over document nodes | `DocumentRenderer` from `@keystatic/core/renderer` | Handles inline marks (bold/italic/code/etc.), all block types (paragraph, list, heading, image, blockquote, table, layout), link rendering, and component blocks. Battle-tested with Keystatic's document schema. |
| SSG route enumeration | Manual `fs.readdirSync('content/releases')` | `await reader.collections.releases.list()` | The reader API handles path mapping (`content/releases/*` → slug), runtime fs in Workers, and works identically in local mode and GitHub mode. |
| Open Graph meta tags | Hand-written `<meta>` elements | `generateMetadata` export | Next.js handles HTML-limited bots (Facebook scraper, Twitter scraper) differently from JS-executing bots and streams metadata to live bots. Also handles `metadataBase` URL composition. [CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata §Streaming metadata] |
| `<img>` responsive sizing | Hardcoded width/height + srcset | `next/image` with `sizes` prop | Next.js generates srcset, handles intrinsic aspect-ratio CSS, and integrates with OpenNext's Cloudflare image loader (Phase 7 can enable this without code changes). |
| Client-only component loading | `useEffect(() => setMounted(true))` + conditional render | `next/dynamic({ssr:false})` | Built-in, battle-tested, and the skeleton placeholder lives in the `loading` prop with no extra state machinery. STATE.md locks this pattern. |
| Sort by date | Hand-rolled `sort((a,b) => new Date(b) - new Date(a))` | `sort((a,b) => bDate.localeCompare(aDate))` on the YYYY-MM-DD string | Keystatic `fields.date` stores ISO YYYY-MM-DD strings; lexicographic sort is equivalent to chronological sort. Avoids `Date` object construction for each comparison. |
| Structured-data type definitions | Handwriting schema.org JSON by memory | Copy-paste from `schema.org/MusicAlbum` documentation, then run through [Google Rich Results Test](https://search.google.com/test/rich-results) during Phase 7 validation | Schema.org has 30+ properties on MusicAlbum; the documented subset (`name`, `byArtist`, `datePublished`, `image`, `description`, `url`, `genre`) is the minimum that Google recognizes. [CITED: schema.org/MusicAlbum] |
| External link security | Hand-constructed `<a target="_blank">` without `rel` | Always pair with `rel="noopener noreferrer"` | D-18 mandates this for all external platform links. Omitting `rel="noopener"` exposes `window.opener` to the linked site and is a documented security issue. |

**Key insight:** Every problem above has a Next.js, Keystatic, or standard-web answer already. Phase 3 should add **zero** custom rendering libraries. The only hand-rolled code is composition glue + the Keystatic artist-slug-to-name resolver (unavoidable; it's domain-specific).

---

## Runtime State Inventory

*Not applicable — Phase 3 is a greenfield feature (new pages + new components), not a rename/refactor/migration.* The existing codebase has:
- No prior `/releases` or `/releases/[slug]` routes (verified: `ls app/` shows no `releases/` directory)
- No prior release-related components (verified: `ls components/` shows only `layout/` and `ui/`)
- No seeded release YAML files (verified: `content/releases/` contains only `.gitkeep`)

Nothing to rename, no live service config to update, no OS-registered tasks to re-register.

---

## Common Pitfalls

### Pitfall 1: `next/dynamic({ssr:false})` in Server Components

**What goes wrong:** Build-time error: `× 'ssr: false' is not allowed with 'next/dynamic' in Server Components. Please move it into a Client Component.`

**Why it happens:** App Router Server Components cannot opt out of SSR (they're rendered on the server by definition). `ssr:false` is a client-boundary concept.

**How to avoid:** The component that CALLS `next/dynamic({ssr:false})` MUST have `"use client"` at the top. The dynamically-imported module itself does not need `"use client"` — `next/dynamic` handles the boundary.

**Warning signs:** UI-SPEC Component Inventory line listing `SoundCloudEmbed` as "Server Component (wrapper)" — this must be amended. See Pattern 5.

[CITED: nextjs.org/docs/app/guides/lazy-loading, 2026-04-21]

### Pitfall 2: Document Field is an Async Function

**What goes wrong:** `Error: Functions cannot be passed directly to Client Components` or the DocumentRenderer crashes rendering `undefined.map()`.

**Why it happens:** Without `{resolveLinkedFiles:true}`, the Keystatic reader returns document fields as `() => Promise<Document>` — an async function — because documents can link to external files that need separate I/O.

**How to avoid:** Always pass `{resolveLinkedFiles:true}` as the second arg to `read()` when you plan to render the document:

```ts
const entry = await reader.collections.releases.read(slug, {
  resolveLinkedFiles: true,
});
// Now entry.description is the resolved document, ready for DocumentRenderer.
```

For `all()`, the option works identically:

```ts
const releases = await reader.collections.releases.all({ resolveLinkedFiles: true });
// Only use this if you need document content on every entry. For the catalog
// grid (artwork-only), you can skip the option to save I/O per entry.
```

**Warning signs:** TypeScript shows `entry.description: () => Promise<...>`. You tried to pass it to a component that expects `Element[]`.

[CITED: keystatic.com/docs/reader-api — "If your collection or singleton contains a document field, that field will be returned as an asynchronous function..."]

### Pitfall 3: Next.js 16 `params` is a Promise

**What goes wrong:** Runtime error: `params.slug is undefined` or TypeScript error: `params.slug does not exist on Promise<{slug:string}>`.

**Why it happens:** In Next.js 16 App Router, `params` (and `searchParams`) are wrapped in a Promise to support streaming and async data access.

**How to avoid:**

```tsx
// CORRECT
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // ...
}

// WRONG (Next.js 13/14 pattern)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // crashes
}
```

Same applies to `generateMetadata` — its first argument's `params` is a Promise.

**Warning signs:** Training-data examples showing synchronous `params.slug` access — those are pre-Next.js-15 patterns.

[CITED: nextjs.org/docs/app/api-reference/functions/generate-static-params, 2026-04-21]

### Pitfall 4: `priority` Prop Deprecated on `<Image>` in Next.js 16

**What goes wrong:** No build error (yet — currently a silent deprecation), but future Next.js versions will remove the prop. Worse: `priority` may behave differently from the new `preload` semantics.

**Why it happens:** Next.js 16.0.0 renamed `priority` → `preload` to make the intent (inserts a `<link rel="preload">` in `<head>`) clearer. [CITED: nextjs.org/docs/app/api-reference/components/image §Version History — v16.0.0 entry]

**How to avoid:** For the detail-page cover (the LCP element):

```tsx
<Image
  src={coverPath}
  width={1200}
  height={1200}
  sizes="(max-width: 1024px) 100vw, 40vw"
  preload  // NOT priority
  alt={...}
/>
```

For grid cards (not LCP): omit both `priority` and `preload` — browsers lazy-load by default.

**Warning signs:** Seeing `priority` in existing code (e.g., `components/ui/Logo.tsx` in this project still uses `priority`). That's a pre-Phase-3 artifact; new code should use `preload`. Not a hard blocker for Phase 3 — just a consistency flag.

[CITED: nextjs.org/docs/app/api-reference/components/image, 2026-04-21]

### Pitfall 5: OpenNext + `next/image` Without Image Optimization Binding

**What goes wrong:** `<Image>` src resolves to `/_next/image?url=...&w=...` which returns 404 on Workers because there's no image optimizer handler.

**Why it happens:** `next/image` assumes a Node.js image optimization service. OpenNext/Cloudflare replaces this with Cloudflare Images (via `IMAGES` binding) + a custom loader — but only if configured.

**How to avoid:** Two paths:
- **Ship without optimization in Phase 3** (recommended): don't configure the loader yet. Add `images: { unoptimized: true }` to `next.config.ts` to disable the optimization pipeline. Images are served as-is from `public/images/releases/`. Tradeoff: no WebP/AVIF, no srcset, but zero infrastructure.
- **Ship WITH optimization**: add `IMAGES` binding to `wrangler.jsonc`, write `image-loader.ts`, and set `images.loader: "custom"` in `next.config.ts`. [CITED: opennext.js.org/cloudflare/howtos/image] — More work, but optimal sizing.

**Recommendation for Phase 3:** unoptimized. Flag for Phase 7 polish. Source images are author-controlled (max 1200×1200 per STATE.md), so `next/image`'s lazy-loading + layout-shift prevention is still valuable even without the optimizer.

**Warning signs:** Dev works fine (`next dev` has its own optimizer), but prod build fails to serve images — 404 on every cover.

[CITED: opennext.js.org/cloudflare/howtos/image, 2026-04-22]

### Pitfall 6: Artist Slug Resolution Races / Not Yet Authored

**What goes wrong:** Phase 3 needs artist display names (e.g., "ELIF") from the `artists` collection, but Phase 4 is what authors artist entries. If an artist referenced in `artistSlugs` doesn't exist yet, `reader.collections.artists.read(slug)` returns `null` — and if you `throw` on null, the entire release page 500s.

**How to avoid:** `resolveArtistNames` (Pattern 8) MUST fall back to the slug itself when the artist entry is null:

```ts
const artist = await reader.collections.artists.read(slug);
return artist?.name ?? slug;
```

This lets Phase 3 ship with degraded display (e.g., "elif" instead of "ELIF") while Phase 4 authors artist entries.

**Warning signs:** Seed releases but skip seeding matching artist entries → detail pages render `{artist-slug}` text instead of `{Artist Display Name}`.

### Pitfall 7: Keystatic `read()` Returns Null, Not Throws

**What goes wrong:** Passing a typo slug to `read()` doesn't throw — it returns `null`. If you destructure without checking, you crash on `entry.title` of null.

**How to avoid:** Always null-check or use `readOrThrow()`:

```ts
// Preferred for dynamic routes — Next.js handles 404 semantics
const entry = await reader.collections.releases.read(slug, { resolveLinkedFiles: true });
if (!entry) notFound(); // Next.js App Router utility

// OR — crash-fast version (rarely desired for user-facing routes)
const entry = await reader.collections.releases.readOrThrow(slug, { resolveLinkedFiles: true });
```

`notFound()` triggers Next.js's 404 flow. [CITED: `@keystatic/core/reader` type declarations — `read()` returns `Promise<T | null>`, `readOrThrow()` returns `Promise<T>`]

### Pitfall 8: SoundCloud URL with Query Params Double-Encoded

**What goes wrong:** A SoundCloud premiere URL like `https://soundcloud.com/artist/track?in=label/marginalia` — passed raw to the iframe `url` param — gets its `?` interpreted as a separator for the iframe URL, not as part of the value.

**How to avoid:** Use `URLSearchParams` (as in Pattern 8's `buildSoundCloudEmbedUrl`) — it URL-encodes the value correctly. Do NOT manually `encodeURIComponent` and then string-concatenate; `URLSearchParams` handles it.

**Warning signs:** Iframe src looks like `?url=https://soundcloud.com/a/b?in=c` — the second `?` is a bug.

### Pitfall 9: Empty `<details>` When No Secondary URLs Present

**What goes wrong:** User opens "Also available on" disclosure — it's empty. Bad UX.

**How to avoid:** Gate the entire `MorePlatforms` component render:

```tsx
const hasSecondary = [
  entry.tidalUrl, entry.traxsourceUrl, entry.junoUrl, entry.boomkatUrl,
  entry.amazonUrl, entry.youtubeUrl, entry.anghamiUrl, entry.mixcloudUrl,
  entry.netEaseUrl, entry.pandoraUrl, entry.saavnUrl, entry.facebookUrl,
].some(Boolean);

{hasSecondary && <MorePlatforms entry={entry} />}
```

D-17 mandates this. UI-SPEC confirms.

### Pitfall 10: Seeded YAML Filename vs Slug Mismatch

**What goes wrong:** Keystatic writes release files as `content/releases/midnight-drift.yaml` where the slug is `midnight-drift`. If the user's file is `content/releases/Midnight Drift.yaml` (bypassing admin), the reader's slug-to-path mapping fails.

**How to avoid:** Instruct the user (and the planner's acceptance criteria) to always author releases via `/keystatic` admin, never by hand-editing filenames. Keystatic's slug-field mechanism in the config (`slugField: 'title'`) guarantees consistency.

**Warning signs:** `reader.collections.releases.list()` returns a slug that `read(slug)` then returns null for — indicates a filename drift.

---

## Code Examples

All examples in Patterns 1–8 above are load-bearing code for Phase 3. They are verified against current API signatures:

- DocumentRenderer signature: `@keystatic/core/dist/declarations/src/renderer.d.ts` (Read tool, 2026-04-22)
- Reader signature: `@keystatic/core/dist/declarations/src/reader/generic.d.ts` (Read tool, 2026-04-22)
- `generateMetadata` signature: [CITED: nextjs.org/docs/app/api-reference/functions/generate-metadata, version 16.2.4, lastUpdated 2026-04-21]
- `generateStaticParams` signature: [CITED: nextjs.org/docs/app/api-reference/functions/generate-static-params, version 16.2.4, lastUpdated 2026-04-21]
- `next/dynamic` semantics: [CITED: nextjs.org/docs/app/guides/lazy-loading, version 16.2.4, lastUpdated 2026-04-21]
- `next/image` preload vs priority: [CITED: nextjs.org/docs/app/api-reference/components/image, version 16.2.4, lastUpdated 2026-04-21]
- SoundCloud iframe params: [CITED: developers.soundcloud.com/docs/api/html5-widget — documented params list]
- Schema.org MusicAlbum properties: [CITED: schema.org/MusicAlbum]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params.slug` synchronous access | `await params` in page + metadata | Next.js 15 (2024), strict in 16 (2025) | All Phase 3 dynamic route code must use the async form. |
| `<Image priority>` for LCP images | `<Image preload>` | Next.js 16.0.0 (2025) | New code in Phase 3 should use `preload`; existing `priority` in `Logo.tsx` is non-blocking deprecation. |
| Keystatic document rendering with raw node traversal | `DocumentRenderer` from `@keystatic/core/renderer` | Keystatic 0.3+ | No custom walker needed — renderer handles all document node types. |
| Page-level `"use client"` for interactive features | Server Component page + leaf Client Component islands | Next.js 13 App Router (2023), strictly enforced by project STATE.md | Phase 3 page components stay Server Components; only `SoundCloudEmbed` is client. |
| `getStaticPaths` (Pages Router) | `generateStaticParams` (App Router) | Next.js 13 App Router (2023) | Phase 3 uses App Router — no Pages Router code. |

**Deprecated / outdated:**

- `priority` prop on `next/image` — replaced by `preload` in Next.js 16.0.0. Not removed yet, but should be migrated.
- Custom `<head>` tag insertion in page components — replaced by the `Metadata` API.
- Raw document traversal — replaced by `DocumentRenderer`.
- `getStaticProps` / `getServerSideProps` — not applicable in App Router; data fetching happens in the Server Component body.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Production URL is `https://marginalialabel.com` | Pattern 6 (metadataBase), Pattern 7 (JSON-LD absolute URLs) | OG image URLs and JSON-LD URLs will be broken until corrected. Fix: planner should parametrize via `NEXT_PUBLIC_SITE_URL` env var and fall back to the canonical domain. |
| A2 | Label plans to seed releases manually before first build | Empty-state handling in Pattern 1 | If no releases are seeded, `/releases` shows empty state (intended). Detail pages 404 (correct with `dynamicParams: false`). User should know this is expected behavior. |
| A3 | Release count stays under ~50 for v1 | `generateStaticParams` with full SSG (all slugs at build) | If catalog grows beyond a few hundred, build time increases and repo size balloons (images). Mitigated by STATE.md's stated v1 ceiling + Phase 7 image migration plan. |
| A4 | Artist slugs in `artistSlugs` are authoritative — Phase 4 will respect them | `resolveArtistNames` helper | If Phase 4 renames an artist slug, all release entries referencing the old slug break. Convention: Phase 4 MUST treat artist slugs as stable keys. Document in Phase 4 context. |
| A5 | SoundCloud premiere URLs in `soundcloudUrl` field are in the canonical `https://soundcloud.com/{user}/{track}` format (not shortened `on.soundcloud.com` or API URL) | Pattern 5 SoundCloud embed | Shortened URLs may not work in the widget player. User should test the first release's embed and report if it fails — known SoundCloud limitation. |
| A6 | Fonts and site-config are in place from Phase 2 | Pattern 1/6 layout references | If Phase 2 is incomplete, Phase 3 pages render with fallback fonts and broken footer. Add explicit Phase 2 dependency check to plan acceptance criteria. |

---

## Open Questions

### 1. `metadataBase` value — env var vs hardcoded?

- **What we know:** Next.js requires `metadataBase` to compose absolute OG URLs from relative image paths. The site will deploy to `https://marginalialabel.com`.
- **What's unclear:** Should `metadataBase` be set from `NEXT_PUBLIC_SITE_URL` (env-driven, cleaner for preview deploys) or hardcoded `new URL('https://marginalialabel.com')`?
- **Recommendation:** Use env var with hardcoded fallback (Pattern 6 example shows this). Planner should add `NEXT_PUBLIC_SITE_URL` to `.env.example` as a documented optional override.

### 2. Image optimization — defer to Phase 7 or build in Phase 3?

- **What we know:** OpenNext supports `next/image` via custom loader + Cloudflare Images binding. Source images are author-controlled and pre-sized per STATE.md.
- **What's unclear:** Is the performance benefit worth the build complexity in Phase 3?
- **Recommendation:** Defer to Phase 7. Phase 3 sets `images: { unoptimized: true }` in `next.config.ts` to avoid the 404 pitfall (#5). Explicitly document that Phase 7 will flip this off after configuring the custom loader. This keeps Phase 3 narrowly scoped.

### 3. Empty-catalog UX — real deploy or dev-only concern?

- **What we know:** UI-SPEC specifies empty-state copy ("Catalog is loading. No releases have been published yet..."). Practical production scenario (label between releases) is rare but possible.
- **What's unclear:** Should the plan add a seed-content prerequisite, or trust the empty-state UX?
- **Recommendation:** Include BOTH in the plan: (a) implement empty state per UI-SPEC; (b) ADD a planner prerequisite noting "Before `npm run build` or first deploy, user must seed at least one release via `/keystatic` to verify detail-page rendering." This makes the empty state production-grade AND ensures the detail page is exercised during execution verification.

### 4. Seed data for plan verification

- **What we know:** The plan needs to verify detail-page render paths (SoundCloud embed, DocumentRenderer, platform icons). Those paths cannot be exercised without at least one seed release.
- **What's unclear:** Does the plan seed a fake release, or rely on the user?
- **Recommendation:** Plan adds an **optional seed task** that the executor can run (`content/releases/test-release.yaml` with placeholder values + a sample cover image from an existing Marginalia release). This task is gated on user confirmation and NOT checked into master — for local execution only. OR: the plan instructs the user to enter one release via `/keystatic` before running verification. Either approach works; planner picks one and documents it in the acceptance criteria.

### 5. `<details>` styling cross-browser

- **What we know:** UI-SPEC specifies native `<details><summary>` with a rotated caret on hover.
- **What's unclear:** Safari and Firefox render default `<details>` disclosure arrows differently from Chrome. UI-SPEC says "caret rotates 90° (CSS)" without specifying if this is the default triangle or a custom SVG caret.
- **Recommendation:** Use a custom SVG caret inside `<summary>` and hide the default via `summary::-webkit-details-marker { display: none }` + `summary { list-style: none }`. This guarantees cross-browser consistency. Pattern for the planner; not a blocker.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `next dev`, `next build` | ✓ (assumed — Phase 1 verified) | Node 20+ (per `@types/node` devDep) | — |
| `next` | App Router, `generateMetadata`, `generateStaticParams`, `next/dynamic`, `next/image` | ✓ | 16.2.4 | — |
| `@keystatic/core` | `reader` API, `DocumentRenderer` | ✓ | 0.5.50 | — |
| `tailwindcss` | Utility classes in JSX | ✓ | 4.2.4 | — |
| `@opennextjs/cloudflare` | Workers build | ✓ | 1.19.1 | — |
| `wrangler` | Local deploy testing | ✓ | 4.83.0 | — |
| Content: ≥1 seeded release | Detail-page render verification | ✗ | — | Empty-state UX shows on `/releases`; `generateStaticParams` returns `[]`; `/releases/[slug]` routes 404 until seeded. Plan must include a seed step or prerequisite. |
| Content: artist entries referenced by `artistSlugs` | Artist name display on release cards/pages | ✗ | — | `resolveArtistNames` falls back to slug-as-text. Degraded but non-blocking. Phase 4 fills this gap. |
| Cover images in `public/images/releases/` | `<Image>` src | ✗ | — | Written by Keystatic admin when a release is entered. No code-level fallback — missing image causes broken `<Image>`. |
| `IMAGES` binding in `wrangler.jsonc` | `next/image` optimization | ✗ | — | Not blocking. Set `images: { unoptimized: true }` in `next.config.ts`; Phase 7 adds the binding. |
| `NEXT_PUBLIC_SITE_URL` env var | `metadataBase` for OG URLs | ✗ | — | Hardcode `https://marginalialabel.com` as fallback in `app/layout.tsx`. |

**Missing dependencies with no fallback:** None. Every item missing at research time has either (a) a code-level fallback (empty state, artist slug fallback), (b) a documented optional enhancement (image optimization), or (c) a documented prerequisite (seed content).

**Missing dependencies with fallback:**
- Seeded releases → empty state UI
- Artist entries → slug fallback
- IMAGES binding → unoptimized images
- Site URL env var → hardcoded domain

---

## Validation Architecture

> Phase 3 uses the same validation approach as Phase 2: no unit test runner, file-check + build + manual browser verification.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — no test runner installed. Continuation of Phase 2 convention. |
| Config file | none |
| Quick run command | `npm run build` (exits 0 — TS + Next compile) |
| Full suite command | `npm run build && npx @opennextjs/cloudflare build` (worker build succeeds) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REL-01 | Catalog grid renders all releases, 3/4/5 cols | file-check + manual | `test -f app/releases/page.tsx && grep -q "grid-cols-3" components/releases/ReleaseGrid.tsx` | ❌ Wave 0 |
| REL-01 | Sort newest-first by releaseDate | manual | DevTools → first card's YAML date > second card's date | — |
| REL-02 | Detail page shows artwork, title, artist, date, genre, description | file-check + manual | `test -f "app/releases/[slug]/page.tsx" && grep -q "DocumentRenderer" app/releases/[slug]/page.tsx` | ❌ Wave 0 |
| REL-03 | SoundCloud embed hydrates client-only, no hydration error | manual + build | `grep -q '"use client"' components/releases/SoundCloudEmbed.tsx && grep -q "ssr: false" components/releases/SoundCloudEmbed.tsx`; DevTools console shows no hydration warnings | ❌ Wave 0 |
| REL-04 | Beatport + Spotify links appear when URLs are present | manual | Author a release with beatportUrl+spotifyUrl → visit detail page → both icons visible, correct hrefs | — |
| REL-05 | `featured` field accessible (prep only) | file-check | `grep -q "featured" keystatic.config.ts` (should pass, Phase 1 already shipped) | ✅ (already exists) |
| REL-06 | OG meta tags include cover URL, title, description | manual | Build → inspect detail page HTML `<head>` → `<meta property="og:image" content="..."/>` references `/images/releases/{file}` | — |
| REL-06 | OG image resolves absolutely (includes domain) | manual | In HTML `<head>`: `og:image` starts with `https://` | — |
| REL-07 | JSON-LD MusicAlbum block exists with required fields | manual + automated | `curl http://localhost:3000/releases/{slug} \| grep -o '"@type":"MusicAlbum"'` returns exactly 1 match; JSON parses; fields populated | — |

### Sampling Rate

- **Per task commit:** `npm run build` exits 0
- **Per wave merge:** Full `npm run build && npx @opennextjs/cloudflare build` succeeds; manual `npm run dev` + visit `/releases` + 1 detail page
- **Phase gate:** All REL-01 through REL-07 green manually; no DevTools console errors; no hydration warnings; view-source shows OG + JSON-LD on detail page

### Wave 0 Gaps

- `app/releases/page.tsx` — catalog page
- `app/releases/[slug]/page.tsx` — detail page
- `components/releases/*.tsx` — 12 new components per Pattern structure
- `lib/releases.ts` — helpers
- `next.config.ts` — add `images: { unoptimized: true }` (non-blocking but prevents Pitfall #5)
- `app/layout.tsx` — ADD `metadataBase` to the existing `metadata` export (one-line change)
- `content/releases/` — at least 1 seeded release + matching cover in `public/images/releases/`

*No automated test framework install needed — phase follows Phase 2's manual+build validation strategy.*

---

## Security Domain

> Applicable because `security_enforcement` is not disabled in config. Phase 3 is primarily static-content rendering — security surface is narrow.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth — public read-only pages |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No access control — all content is public |
| V5 Input Validation | **yes** | All URLs (SoundCloud, platform links, Laylo) originate from Keystatic YAML authored by the label. `fields.url()` validates at admin time. Runtime: treat all values as untrusted strings — never `dangerouslyInnerHTML` them. The only `dangerouslySetInnerHTML` usage is for JSON-LD `JSON.stringify(jsonLd)`, which is safe (no user-controlled HTML). |
| V6 Cryptography | no | Static content rendering, no crypto |
| V10 Malicious Code | **yes** | Third-party iframes (SoundCloud). Attacker cannot inject into the iframe, but the iframe loads external content that can run scripts. Mitigation: ONLY embed URLs originating from the trusted Keystatic admin; never accept iframe URLs from query params or user-submitted sources. |
| V11 Business Logic | no | No mutations |
| V14 Configuration | **yes** | Ensure `rel="noopener noreferrer"` on ALL `target="_blank"` external links — D-18 mandates this. Verify at code-review time. |

### Known Threat Patterns for Next.js 16 + iframe embeds

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cross-site reverse tabnabbing (via `target="_blank"` links) | Spoofing | `rel="noopener noreferrer"` on every external anchor. D-18 enforces; verify in plan-check. |
| JSON-LD injection via CMS content (reflected XSS) | Tampering | `JSON.stringify(jsonLd)` encoding any `<` as `<` prevents script-tag injection in the embedded JSON. Use `JSON.stringify(jsonLd).replace(/</g, '\\u003c')` for defense-in-depth, or verify Next.js's existing escape behavior. |
| Unvalidated iframe src (SoundCloud) | Tampering | `soundcloudUrl` is validated by Keystatic `fields.url()` at authoring time (enforces valid URL format). Runtime construction via `URLSearchParams` prevents URL-structure injection. |
| Document-field content including malicious links | Tampering | Keystatic's `DocumentRenderer` escapes text and only renders known block types — it does not evaluate scripts. Custom link renderer (Pattern 4) explicitly sets `rel="noopener noreferrer"` for external hrefs. |
| Open Graph image with untrusted URL | Tampering | OG image URL is constructed from Keystatic-validated `coverArt` (internal `/images/releases/` path), not user input. |
| Cover image upload traversal | Tampering | Keystatic admin's image-field handling validates filename; writes are confined to `publicPath`. Out of Phase 3 scope — trust Keystatic config. |

**No new security tooling needed for Phase 3.** All mitigations are (a) already enforced by Keystatic at authoring time, (b) built into Next.js and React's default escaping, or (c) code-pattern rules that must appear in plan-check acceptance criteria (`rel="noopener noreferrer"` audit).

---

## Project Constraints (from CLAUDE.md)

No `./CLAUDE.md` exists in the working directory (verified: `ls` shows no CLAUDE.md at project root). No project-specific directives beyond those in `.planning/STATE.md`, which are already surfaced in `<user_constraints>` and pitfalls above.

**Additional user-memory directives** (from `~/.claude/projects/-Users-koz-Documents-Marginalia-Web-Site/memory/MEMORY.md`, loaded via system-reminder):

- Reports must be in English (applies to shift reports — not to code or UI copy)
- Brand system: colors #580AFF, #9EFF0A; font Nimbus Sans; background #1F1F21; 11 accent colors — all consistent with `app/globals.css` already in place
- Stack: Next.js 15 + Keystatic CMS + Cloudflare Workers — note the memory says "Next.js 15" but the repo is pinned to 16.2.4; treat the repo as authoritative.

---

## Sources

### Primary (HIGH confidence)

- **Keystatic reader type declarations:** `node_modules/@keystatic/core/dist/declarations/src/reader/generic.d.ts` (Read tool, 2026-04-22) — confirms `read(slug, opts)`, `readOrThrow`, `all(opts)`, `list()` signatures and that `resolveLinkedFiles: true` returns `ValueForReadingDeep`.
- **Keystatic DocumentRenderer type declarations:** `node_modules/@keystatic/core/dist/declarations/src/renderer.d.ts` (Read tool, 2026-04-22) — confirms `DocumentRendererProps<ComponentBlocks>` shape and all renderer slots.
- **Keystatic package exports map:** `node_modules/@keystatic/core/package.json` lines 42–71 (Read tool, 2026-04-22) — confirms `./reader` and `./renderer` are stable entry points.
- **Next.js 16 `generateMetadata`:** [nextjs.org/docs/app/api-reference/functions/generate-metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) (WebFetch, 2026-04-22, version 16.2.4, lastUpdated 2026-04-21) — `metadataBase`, URL composition, streaming metadata behavior.
- **Next.js 16 `generateStaticParams`:** [nextjs.org/docs/app/api-reference/functions/generate-static-params](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) (WebFetch, 2026-04-22, version 16.2.4, lastUpdated 2026-04-21) — async params, SSG behavior, `dynamicParams`.
- **Next.js 16 Lazy Loading:** [nextjs.org/docs/app/guides/lazy-loading](https://nextjs.org/docs/app/guides/lazy-loading) (WebFetch, 2026-04-22, version 16.2.4, lastUpdated 2026-04-21) — `ssr: false` must be in Client Component; error message exact text.
- **Next.js 16 Image component:** [nextjs.org/docs/app/api-reference/components/image](https://nextjs.org/docs/app/api-reference/components/image) (WebFetch, 2026-04-22, version 16.2.4) — `priority` deprecated in v16, `preload` replaces it; `sizes` prop semantics.
- **OpenNext Cloudflare image optimization:** [opennext.js.org/cloudflare/howtos/image](https://opennext.js.org/cloudflare/howtos/image) (WebFetch, 2026-04-22) — IMAGES binding + custom loader pattern.
- **npm registry version checks:** `npm view next|react|@keystatic/core|tailwindcss version` (Bash, 2026-04-22) — all returned expected current versions matching package.json.
- **Phase 2 RESEARCH.md + UI-SPEC.md + CONTEXT.md** (Read tool, 2026-04-22) — patterns inherited (Container, SocialIcon, `@theme` tokens, font approach).
- **Phase 3 CONTEXT.md + UI-SPEC.md + DISCUSSION-LOG.md** (Read tool, 2026-04-22) — 22 locked decisions and the UI-SPEC checker's discretionary resolutions.
- **keystatic.config.ts** (Read tool, 2026-04-22) — authoritative schema; all 25 release fields verified.
- **Codebase files** (Read tool, 2026-04-22): `lib/keystatic.ts`, `app/layout.tsx`, `components/layout/*`, `components/ui/SocialIcon.tsx`, `app/globals.css`.

### Secondary (MEDIUM confidence)

- **Keystatic Reader API docs:** [keystatic.com/docs/reader-api](https://keystatic.com/docs/reader-api) (WebFetch, 2026-04-22) — verified: document field as async function; `resolveLinkedFiles: true` behavior. Confirmed by primary source (type declarations).
- **SoundCloud HTML5 Widget:** [developers.soundcloud.com/docs/api/html5-widget](https://developers.soundcloud.com/docs/api/html5-widget) (WebFetch, 2026-04-22) — documented iframe params. Noted: some UI-SPEC params (`hide_related`, `show_comments`, `show_reposts`, `show_teaser`, `visual`) are not in the current docs page but are observed working in production SoundCloud embeds. Treat as de-facto stable.
- **Schema.org MusicAlbum:** [schema.org/MusicAlbum](https://schema.org/MusicAlbum) (WebFetch, 2026-04-22) — property list and inheritance chain.
- **Next.js GitHub issue about `ssr: false` in Server Components:** [github.com/vercel/next.js/issues/66414](https://github.com/vercel/next.js/issues/66414) — confirms error message and canonical workaround.

### Tertiary (LOW confidence — flagged for validation)

- SoundCloud's undocumented iframe params (`hide_related`, `show_comments`, etc.) — works in observed production embeds (e.g., Bandcamp's SoundCloud integration) but absent from the official HTML5 Widget docs page at the URL searched. If any param stops working, re-verify against SoundCloud support or drop the undocumented params.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against installed `node_modules` + npm registry
- Architecture patterns: HIGH — verified against Next.js 16 docs and Keystatic type declarations
- Runtime behavior: HIGH — critical pitfalls (async params, `ssr:false` client boundary, document field type) verified in current official docs
- Pitfalls: HIGH — all ten pitfalls grounded in either current docs, package type declarations, or codebase observation
- SoundCloud iframe params: MEDIUM — half of the documented params are absent from SoundCloud's public docs. Watch for breakage.
- Image optimization: MEDIUM — recommendation is to defer; if planner disagrees and ships with Cloudflare Images loader, add a verification step

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (30 days, reflecting Next.js 16 stability) — re-verify if re-opening Phase 3 after this date.

---

*Phase: 03-releases*
*Research completed: 2026-04-22*
*Consumer: gsd-planner (Phase 3 plan generation)*
