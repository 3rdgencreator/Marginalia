# Phase 5: Secondary Content Pages — Research

**Researched:** 2026-04-23
**Domain:** Next.js 15 + Keystatic 0.5.x content pages — homepage, podcasts, press, showcases, about, merch
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Homepage Hero**
- D-01: Video background hero. Desktop: YouTube iframe (16:9 unlisted), autoplays muted with loop, no controls. Mobile: separate YouTube video (9:16 vertical), same treatment.
- D-02: `<Logo>` component centered over video. No text headline, no tagline.
- D-03: Video URLs managed via two new `homePage` singleton fields: `heroVideoUrl` and `heroVideoMobileUrl` (optional URL fields).
- D-04: CSS responsive visibility switches between desktop and mobile video (`hidden md:block` / `block md:hidden`).
- D-05: YouTube videos MUST be unlisted (not private) for iframe embed to work.

**Homepage Sections**
- D-06: Beatport badge immediately below hero; uses `homePage.beatportAccolade`; omitted if empty.
- D-07: Featured releases grid — artwork-only using `ReleaseCard`; only `featured: true` releases; section omitted if none.
- D-08: Artist roster teaser — uses `ArtistCard`; filtered by `homePage.featuredArtistSlugs`; shows all artists if array is empty.
- Section order: Hero → Beatport badge → Featured releases → Artist teaser.

**Podcasts (/podcasts)**
- D-09: Accordion list; collapsed shows title, artist name, date; click expands in-place.
- D-10: Expanded: artwork left + SoundCloud embed + description right (md+ side-by-side, mobile stacked).
- D-11: SoundCloud embed uses `next/dynamic({ ssr: false })` — reuse `SoundCloudEmbed` with `EmbedSkeleton`.
- D-12: One open at a time — Client Component with `useState`.
- D-13: Sort date descending.
- D-14: No separate `/podcasts/[slug]` pages.

**Press (/press)**
- D-15: List sorted date descending; headline (linked), publication, date, excerpt. Type badge is Claude's discretion.
- D-16: All links `target="_blank" rel="noopener noreferrer"`.
- D-17: No individual press detail pages.

**Showcases (/showcases)**
- D-18: Two sections "Upcoming" and "Past"; upcoming first; upcoming section omitted if no events.
- D-19: Visual distinction: separate headings + grayscale treatment on past cards (Claude's discretion on exact styling).
- D-20: Each event: title, venue, city+country, date. Ticket URL → CTA button (upcoming only). Aftermovie URL → link (past only). Flyer image if available.

**About (/about)**
- D-21: New `about` Keystatic singleton with `headline` (text), `body` (document), `photo` (image, directory `public/images/about`, publicPath `/images/about/`).
- D-22: Full-width editorial, max ~65ch reading column. Headline → optional photo → rich text body.
- D-23: `body` rendered via Keystatic `DocumentRenderer` from `@keystatic/core/renderer`.
- D-24: Empty body renders gracefully with headline only.

**Merch (/merch)**
- D-25: Real Next.js page with full `<iframe>` using `siteConfig.merchUrl`.
- D-26: Shopify may block framing via `X-Frame-Options: DENY` — Elif must verify her store allows embedding.
- D-27: Iframe `min-height: 80vh`. If `siteConfig.merchUrl` is empty, show "Merch store coming soon" placeholder.
- D-28: `siteConfig.merchUrl` already exists in schema — no schema change needed for merch.

**Schema Changes**
- D-29: `keystatic.config.ts` — add to `homePage` singleton: `heroVideoUrl` and `heroVideoMobileUrl` (both `fields.url()`).
- D-30: `keystatic.config.ts` — add new `about` singleton at path `content/about`.

### Claude's Discretion
- Press entry type badge styling (color-coded pills per UI-SPEC).
- Showcases past event visual treatment (grayscale + opacity per UI-SPEC).
- Podcast accordion animation (CSS `max-height` transition).
- Homepage section headings ("RELEASES" / "ARTISTS" labels per UI-SPEC).
- Pagination / load-more for long lists (show all for v1).
- About page photo aspect ratio and position.

### Deferred Ideas (OUT OF SCOPE)
- Persistent audio player (cross-page): v2 feature.
- Free downloads page (`/free-downloads`): not in Phase 5.
- Press EPK assets download: potential Phase 7 addition.
- YouTube/Spotify links on podcast page: Phase 5 SoundCloud only.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POD-01 | Podcasts page lists all mixes/podcasts with date and description | reader.collections.podcasts.all() + accordion Client Component pattern |
| POD-02 | SoundCloud or Mixcloud embed loads on each podcast entry (client-only) | Reuse SoundCloudEmbed + buildSoundCloudEmbedUrl from lib/releases.ts |
| PRESS-01 | Press page lists coverage entries with publication, headline, date, and link | reader.collections.press.all() + server-sorted list |
| PRESS-02 | Entries link out to original articles | target="_blank" rel="noopener noreferrer" on headline <a> |
| SHOW-01 | Showcases page lists upcoming and past events | reader.collections.showcases.all() + date-based partitioning |
| SHOW-02 | Each event shows venue, city, date, and ticket link | showcases schema has all fields; ticketUrl for CTA |
| SHOW-03 | Past events visually distinguished from upcoming | Separate sections + opacity-60 + grayscale(0.4) per UI-SPEC |
| PAGE-01 | Home page has hero section, featured releases, and artist roster teaser | reader.singletons.homePage.read() + reader.collections.releases.all() filtered by featured |
| PAGE-02 | Home page surfaces Beatport "Hype Label of the Month" accolade | homePage.beatportAccolade field already in schema |
| PAGE-03 | About page tells ELIF's story and Marginalia philosophy | New about singleton + DocumentRenderer from @keystatic/core/renderer |
| PAGE-04 | Merch page links out to existing merch store | siteConfig.merchUrl field already in schema; iframe + fallback |
</phase_requirements>

---

## Summary

Phase 5 builds six new pages by wiring existing Keystatic collections and singletons into Next.js route files, reusing components established in Phases 3 and 4. The technical complexity is low-to-medium — most patterns are already proven in the codebase.

The key new patterns are: (1) a client-side accordion for the podcasts page using `useState`, (2) responsive YouTube iframe hero for the homepage, and (3) `DocumentRenderer` for the about page body. Everything else is a variation of the reader + grid/list patterns already shipping.

Two schema additions are required before any content page can be fully built: adding `heroVideoUrl`/`heroVideoMobileUrl` to the `homePage` singleton and creating the new `about` singleton. Seed YAML files for both singletons are needed since no content files exist yet.

**Primary recommendation:** Build in four waves — (1) schema additions first, (2) static pages (press, showcases, about, merch) that need no new client patterns, (3) the podcasts accordion as the only net-new client interaction, (4) the homepage last since it aggregates data from multiple collections.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Homepage data (featured releases, artists, singletons) | API / Backend (server component) | — | All Keystatic reads happen server-side via reader |
| YouTube hero video playback | Browser / Client | — | iframe autoplay requires browser context; no JS logic needed |
| Podcast accordion state (open/close) | Browser / Client | Frontend Server (SSR) | Page shell is server-rendered; only accordion row is "use client" |
| SoundCloud embed loading | Browser / Client | — | `next/dynamic({ ssr: false })` — established pattern from Phase 3 |
| Press list rendering | API / Backend (server component) | — | Static data, no interactivity, pure server render |
| Showcases partitioning (upcoming/past) | API / Backend (server component) | — | Date comparison done server-side before render |
| About page DocumentRenderer | API / Backend (server component) | — | DocumentRenderer is React-server-safe per @keystatic/core/renderer |
| Merch iframe | Browser / Client | Frontend Server (SSR) | iframe is declarative HTML; page wrapper is server component |
| Keystatic schema changes | API / Backend (server component) | — | keystatic.config.ts edits; no runtime impact |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @keystatic/core | 0.5.50 (installed) | CMS reader + DocumentRenderer | Already installed; reader pattern established in Phases 3–4 |
| next | 16.2.4 (installed) | App Router, dynamic imports, Image | Project stack |
| tailwindcss v4 | installed | CSS tokens + utility classes | Established design system |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @keystatic/core/renderer | (same package) | DocumentRenderer for rich text body | About page body field only |
| next/dynamic | (built-in) | SSR-false dynamic imports | All embed components — no exceptions |
| next/image | (built-in) | Optimized images (unoptimized:true in next.config) | All `<img>` equivalents |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| DocumentRenderer | plainTextFromDocument | DocumentRenderer preserves rich text (bold, links, headings); plainText strips formatting. About page needs full rendering. |
| CSS max-height transition | Framer Motion | No animation library in this project; CSS transition is sufficient for accordion |
| iframe for merch | Shopify Buy Button SDK | SDK adds JS bundle weight; simple iframe is appropriate for v1 |

**Installation:** No new packages needed — all required libraries are already installed.

---

## Architecture Patterns

### System Architecture Diagram

```
Keystatic YAML files (content/)
         |
         | reader.collections.X.all() / reader.singletons.X.read()
         v
Server Components (app/*/page.tsx)
  |-- Fetch + filter data (featured releases, upcoming/past showcases, etc.)
  |-- Generate static params for SSG
  |-- Export metadata (title, description, OG)
         |
         v
Shared Layout Shell (app/layout.tsx)
  |-- SiteNav (sticky, already wired)
  |-- <main> children
  |-- SiteFooter
         |
         v
Page Components (Server)
  |-- Container (max-width wrapper)
  |-- Section headings
  |-- Lists / grids
  |
  +-- Client Leaf Components (only when interactive)
        |-- PodcastAccordion ("use client", useState)
        |     +-- PodcastRow (accordion row + expand panel)
        |           +-- SoundCloudEmbed (next/dynamic ssr:false)
        |                 +-- SoundCloudPlayer (iframe)
        |
        +-- (press, showcases, about, merch = no client components)
```

### Recommended Project Structure
```
app/
├── page.tsx                          # Homepage (replace placeholder)
├── podcasts/
│   └── page.tsx                      # Server wrapper, fetches all podcasts
├── press/
│   └── page.tsx                      # Server, fetches + sorts press entries
├── showcases/
│   └── page.tsx                      # Server, partitions upcoming/past
├── about/
│   └── page.tsx                      # Server, reads about singleton
└── merch/
    └── page.tsx                      # Server, reads siteConfig.merchUrl

components/
├── podcasts/
│   ├── PodcastAccordion.tsx          # "use client" — accordion state
│   └── PodcastRow.tsx                # Single row + expanded panel
├── press/
│   └── PressEntry.tsx                # Single press row (no interactivity)
└── showcases/
    └── ShowcaseCard.tsx              # Event card (no interactivity)

content/
├── home.yaml                         # Seed file for homePage singleton (NEW)
└── about.yaml                        # Seed file for about singleton (NEW)
```

### Pattern 1: Keystatic Singleton Read (null-safe)
**What:** Read a singleton that may not have a content file yet.
**When to use:** All singleton reads in this phase — homePage and about.

```typescript
// Source: SiteFooter.tsx (established project pattern) [VERIFIED: codebase]
// reader.singletons.X.read() returns null if YAML missing.
// Use .read() not .readOrThrow() — graceful degradation when no content exists.
const homeData = await reader.singletons.homePage.read();
// Then access fields with optional chaining:
const accolade = homeData?.beatportAccolade ?? null;
```

### Pattern 2: Collection All + Filter
**What:** Fetch all entries then filter/sort server-side.
**When to use:** Featured releases, showcases partitioning.

```typescript
// Source: app/releases/page.tsx [VERIFIED: codebase]
const allReleases = await reader.collections.releases.all();
// Filter featured
const featured = allReleases.filter(({ entry }) => entry.featured === true);
// Sort date descending
const sorted = [...entries].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
```

### Pattern 3: Podcast Accordion (Client Component)
**What:** One-at-a-time accordion with expand/collapse state.
**When to use:** Podcasts page only.

```typescript
// Source: established project pattern (Phase 2 MobileMenu uses similar useState) [VERIFIED: codebase]
'use client';
import { useState } from 'react';

export default function PodcastAccordion({ episodes }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const toggle = (slug: string) =>
    setActiveSlug(prev => (prev === slug ? null : slug));

  return (
    <div role="list">
      {episodes.map(ep => (
        <PodcastRow
          key={ep.slug}
          episode={ep}
          isOpen={activeSlug === ep.slug}
          onToggle={() => toggle(ep.slug)}
        />
      ))}
    </div>
  );
}
```

### Pattern 4: DocumentRenderer for About Page Body
**What:** Render Keystatic document field as rich HTML.
**When to use:** About page `body` field only.

```typescript
// Source: @keystatic/core/renderer [VERIFIED: node_modules dist exports]
// Import path: '@keystatic/core/renderer'
import { DocumentRenderer } from '@keystatic/core/renderer';

// Usage (aboutData.body is Element[] from the document field):
{aboutData?.body && Array.isArray(aboutData.body) && aboutData.body.length > 0 && (
  <div className="prose prose-invert max-w-none">
    <DocumentRenderer document={aboutData.body} />
  </div>
)}
```

**Note:** The releases detail page currently uses `plainTextFromDocument` for the description body — NOT DocumentRenderer. The about page is the first page that will use the actual DocumentRenderer. The import path is `@keystatic/core/renderer` (verified via package.json exports). [VERIFIED: codebase grep + package.json exports]

### Pattern 5: YouTube Iframe Hero (responsive)
**What:** Two iframes, one for desktop (16:9) and one for mobile (9:16), switched via CSS visibility.
**When to use:** Homepage hero only.

```typescript
// Source: UI-SPEC.md D-01/D-04 pattern [VERIFIED: CONTEXT.md + UI-SPEC.md]
// Build embed URL from stored YouTube video URL
function buildYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extract video ID from various YouTube URL formats
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    controls: '0',
    playlist: match[1], // required for loop to work
    playsinline: '1',
    rel: '0',
  });
  return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
}

// In JSX:
// Desktop (hidden on mobile)
{desktopEmbedUrl && (
  <iframe
    className="hidden md:block absolute inset-0 w-full h-full"
    src={desktopEmbedUrl}
    title="Marginalia hero background video"
    aria-hidden="true"
    allow="autoplay; encrypted-media"
    loading="lazy"
  />
)}
// Mobile (hidden on desktop)
{mobileEmbedUrl && (
  <iframe
    className="block md:hidden absolute inset-0 w-full h-full"
    src={mobileEmbedUrl}
    title="Marginalia hero background video"
    aria-hidden="true"
    allow="autoplay; encrypted-media"
    loading="lazy"
  />
)}
```

### Pattern 6: SoundCloud Embed in Podcast Row
**What:** Reuse the existing two-layer dynamic import pattern.
**When to use:** Podcast accordion expanded panel.

```typescript
// Source: components/releases/SoundCloudEmbed.tsx [VERIFIED: codebase]
// buildSoundCloudEmbedUrl is in lib/releases.ts but marked 'server-only'
// CRITICAL: Call buildSoundCloudEmbedUrl in the SERVER component (page.tsx),
// pass the resulting embedUrl string down to the client accordion component.
// Never import lib/releases.ts in a "use client" component.

// In app/podcasts/page.tsx (server):
import { buildSoundCloudEmbedUrl } from '@/lib/releases';
const podcastsWithEmbedUrls = podcasts.map(({ slug, entry }) => ({
  slug,
  entry,
  embedUrl: entry.soundcloudUrl ? buildSoundCloudEmbedUrl(entry.soundcloudUrl) : null,
}));

// In PodcastRow (client component), receive embedUrl as prop:
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
{isOpen && embedUrl && <SoundCloudEmbed embedUrl={embedUrl} />}
```

### Anti-Patterns to Avoid
- **Importing `lib/releases.ts` in a "use client" component:** That file has `import 'server-only'` at the top — it will throw at runtime. Build embed URLs server-side and pass as props.
- **Using `readOrThrow()` for homePage or about singleton:** Both singletons have no content file yet. `readOrThrow()` will crash. Use `.read()` with null checks.
- **Putting `"use client"` on the podcast page component:** The page.tsx should be a server component. Only `PodcastAccordion` needs `"use client"`.
- **Using `[--color-*]` Tailwind syntax:** This is Tailwind v3 syntax. Use `(--color-*)` for Tailwind v4. [VERIFIED: codebase — all existing components use `(--color-*)` syntax]
- **Reading `homePage.featuredReleaseSlug`:** This field exists in the current schema (a single slug, not an array). The decision uses `featured: true` checkbox on releases instead — filter `releases.all()` by `entry.featured`. Do not use `featuredReleaseSlug`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text rendering | Custom HTML serializer | `DocumentRenderer` from `@keystatic/core/renderer` | Handles all node types, links, formatting correctly |
| SoundCloud embed URL construction | Custom URL builder | `buildSoundCloudEmbedUrl()` from `lib/releases.ts` | Already tested, includes label branding color param |
| Dynamic import with loading state | Custom Suspense wrapper | `SoundCloudEmbed` component (uses `next/dynamic` internally) | Already handles ssr:false + EmbedSkeleton loading state |
| Artist card display | New card component | `ArtistCard` from `components/artists/ArtistCard.tsx` | Already implemented with hover overlay and fallback initial |
| Release card display | New card component | `ReleaseCard` from `components/releases/ReleaseCard.tsx` | Already handles artwork fallback, hover state |
| Max-width page wrapper | Custom div | `Container` from `components/layout/Container.tsx` | Consistent 1280px max, responsive padding |
| Image extraction from text | Custom parser | `plainTextFromDocument()` from `lib/releases.ts` | Already handles nested document AST walking |

**Key insight:** This phase is primarily composition. The hard work (embeds, cards, reader pattern, tokens) is already done. The planner should avoid tasks that re-implement existing solutions.

---

## Common Pitfalls

### Pitfall 1: `server-only` Import in Client Component
**What goes wrong:** Importing `lib/releases.ts` inside `PodcastAccordion` or `PodcastRow` causes a build-time error: "This module cannot be imported from a Client Component module."
**Why it happens:** `lib/releases.ts` has `import 'server-only'` on line 1. `buildSoundCloudEmbedUrl` lives there.
**How to avoid:** Build the embed URL in the server page component (`app/podcasts/page.tsx`) and pass it as a string prop to client components.
**Warning signs:** TypeScript won't catch this. The error appears at build time.

### Pitfall 2: `readOrThrow()` on Unpopulated Singleton
**What goes wrong:** `reader.singletons.homePage.readOrThrow()` or `reader.singletons.about.readOrThrow()` throws because neither `content/home.yaml` nor `content/about.yaml` exists yet.
**Why it happens:** No seed content files have been created for these singletons.
**How to avoid:** Always use `.read()` (returns null if missing) and null-check. Create seed YAML files as part of Wave 1 tasks.
**Warning signs:** Server throws uncaught error during build/render; 500 in dev.

### Pitfall 3: YouTube Autoplay Blocked Without `mute=1`
**What goes wrong:** YouTube iframe hero is silent and the video doesn't autoplay in most browsers.
**Why it happens:** Browser autoplay policy blocks unmuted autoplay. YouTube requires `mute=1` in the embed URL AND `allow="autoplay"` on the iframe element.
**How to avoid:** Always include `mute=1` in the embed URL params and `allow="autoplay; encrypted-media"` on the iframe.
**Warning signs:** Video loads but pauses immediately with a play button overlay.

### Pitfall 4: YouTube `loop=1` Without `playlist` Param
**What goes wrong:** `loop=1` has no effect on YouTube iframes without the `playlist` parameter set to the same video ID.
**Why it happens:** YouTube API quirk — loop only works when a playlist is specified.
**How to avoid:** Always include `playlist=VIDEO_ID` alongside `loop=1` in the embed URL.
**Warning signs:** Video plays once then stops.

### Pitfall 5: Showcases "Upcoming" Section Not Properly Omitted
**What goes wrong:** An empty "UPCOMING" section with a heading and no events renders when all showcases are past.
**Why it happens:** Forgetting to conditionally render the section based on `upcoming.length > 0`.
**How to avoid:** `{upcoming.length > 0 && <section>...</section>}` — guard the entire section.
**Warning signs:** Visible "UPCOMING" heading with empty space below.

### Pitfall 6: Merch Iframe Shopify X-Frame-Options Block
**What goes wrong:** The merch page shows a blank white iframe.
**Why it happens:** Shopify default storefronts send `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'` headers.
**How to avoid:** The plan must include an acceptance criterion requiring Elif to verify that her store allows iframe embedding. The page must include a fallback "Visit our store →" button linking directly to `siteConfig.merchUrl` so users can still reach the store if the iframe is blocked.
**Warning signs:** Blank iframe in both dev and production. Check browser console for "Refused to display in a frame because it set 'X-Frame-Options' to 'DENY'."

### Pitfall 7: Grid Column Mismatch Between Homepage and Releases Page
**What goes wrong:** The featured releases grid on the homepage uses a different column count than the `/releases` catalog, creating visual inconsistency.
**Why it happens:** UI-SPEC specifies `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` for the homepage, while `ReleaseGrid` uses `grid-cols-3 md:grid-cols-4 lg:grid-cols-5`.
**How to avoid:** The homepage does NOT use `ReleaseGrid` component. It renders `ReleaseCard` items directly in its own grid with the homepage-specific column count.
**Warning signs:** "ReleaseGrid" wrapper imported in app/page.tsx.

### Pitfall 8: DocumentRenderer Applied to `plainText` Value
**What goes wrong:** `DocumentRenderer` receives a string instead of `Element[]`, causing a React error.
**Why it happens:** Calling `plainTextFromDocument()` first then trying to pass the result to `DocumentRenderer`.
**How to avoid:** Pass the raw document array from `entry.body` directly to `DocumentRenderer`. Use `Array.isArray(entry.body)` guard before rendering.
**Warning signs:** Runtime error "Invalid document value" from DocumentRenderer.

---

## Code Examples

Verified patterns from official sources:

### Reading homePage singleton (null-safe)
```typescript
// Source: established project pattern from SiteFooter.tsx [VERIFIED: codebase]
const homeData = await reader.singletons.homePage.read();
// homeData is null if content/home.yaml doesn't exist
const beatportAccolade = homeData?.beatportAccolade ?? null;
const featuredArtistSlugs = homeData?.featuredArtistSlugs ?? [];
const heroVideoUrl = homeData?.heroVideoUrl ?? null;
```

### Filtering featured releases
```typescript
// Source: app/releases/page.tsx + keystatic.config.ts [VERIFIED: codebase]
const allReleases = await reader.collections.releases.all();
const featured = allReleases.filter(({ entry }) => entry.featured === true);
// entry.platformLinks cast needed for artistName (same pattern as releases page)
const featuredWithMeta = featured.map(({ slug, entry }) => ({
  slug,
  entry: {
    title: entry.title,
    artistName: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artistName,
    coverArt: entry.coverArt,
    artworkUrl: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artworkUrl,
  },
}));
```

### Showcases upcoming/past partitioning
```typescript
// Source: showcases schema in keystatic.config.ts [VERIFIED: codebase]
// showcases schema has a `status` field ('upcoming' | 'past') as explicit override
// Use status field directly — Elif controls it manually per D-20
const all = await reader.collections.showcases.all();
const sorted = [...all].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
const upcoming = sorted.filter(s => s.entry.status === 'upcoming');
const past = sorted.filter(s => s.entry.status === 'past');
```

### DocumentRenderer import and usage
```typescript
// Source: @keystatic/core package.json exports [VERIFIED: node_modules]
import { DocumentRenderer } from '@keystatic/core/renderer';

// The document field returns Element[] — pass directly:
const about = await reader.singletons.about.read();
// In JSX:
{about?.body && Array.isArray(about.body) && about.body.length > 0 ? (
  <div className="prose prose-invert max-w-none text-(--text-body) leading-relaxed">
    <DocumentRenderer document={about.body} />
  </div>
) : null}
```

### Seed YAML for homePage singleton
```yaml
# content/home.yaml — created as part of Wave 1 schema task
heroVideoUrl: ''
heroVideoMobileUrl: ''
heroHeadline: ''
heroSubtext: ''
featuredReleaseSlug: ''
featuredArtistSlugs: []
beatportAccolade: ''
showSpotifyPlaylist: false
spotifyPlaylistUrl: ''
```

### Seed YAML for about singleton
```yaml
# content/about.yaml — created as part of Wave 1 schema task
headline: About Marginalia
body: []
photo: null
```

---

## Schema Gap Analysis

The `keystatic.config.ts` currently defines `homePage` with these fields:
`heroHeadline`, `heroSubtext`, `featuredReleaseSlug`, `featuredArtistSlugs`, `beatportAccolade`, `showSpotifyPlaylist`, `spotifyPlaylistUrl`

**Missing fields that must be added (D-29/D-30):**
1. `heroVideoUrl: fields.url({ label: 'Hero Video URL (desktop 16:9)', description: 'Unlisted YouTube URL for desktop hero background' })` — add to `homePage` singleton
2. `heroVideoMobileUrl: fields.url({ label: 'Hero Video URL (mobile 9:16)', description: 'Unlisted YouTube URL for mobile portrait hero background' })` — add to `homePage` singleton
3. Entire `about` singleton — new addition to `singletons` block

**Fields that already exist and are ready to use:**
- `homePage.beatportAccolade` — text field, present [VERIFIED: codebase]
- `homePage.featuredArtistSlugs` — array of text, present [VERIFIED: codebase]
- `siteConfig.merchUrl` — url field, present [VERIFIED: codebase]
- `releases.featured` — checkbox, present [VERIFIED: codebase]
- `showcases.status` — select ('upcoming'/'past'), present [VERIFIED: codebase]
- `showcases.ticketUrl`, `showcases.aftermovieUrl`, `showcases.flyer` — all present [VERIFIED: codebase]
- `press.type` — select (review/interview/feature/mention/chart), present [VERIFIED: codebase]

**No other schema changes are needed.**

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `plainTextFromDocument` for body rendering | `DocumentRenderer` for rich text | Phase 5 (first use) | Preserves bold, italic, links in about body |
| Static `app/page.tsx` placeholder | Dynamic homepage with reader reads | Phase 5 | Complete page.tsx replacement |

**Important note on releases description:** The current release detail page renders description as `{descPlain}` (plain text in a prose div) rather than through `DocumentRenderer`. This is an existing limitation — the about page will be the first page to use proper rich text rendering. The pattern is slightly different from what the CONTEXT.md description implies about release pages. [VERIFIED: codebase — app/releases/[slug]/page.tsx line 173-177]

---

## Environment Availability

No external tool dependencies beyond the established project stack. All required packages are already installed. No new `npm install` commands are needed for this phase.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| @keystatic/core | All pages | Yes | 0.5.50 | — |
| @keystatic/core/renderer | About page | Yes | 0.5.50 (same package) | — |
| next/dynamic | Podcasts embeds | Yes | 16.2.4 | — |
| next/image | All images | Yes | 16.2.4 | — |
| content/home.yaml | Homepage | No (not yet created) | Seed file needed | Show null/empty state until seeded |
| content/about.yaml | About page | No (not yet created) | Seed file needed | Shows headline-only graceful state |

**Missing with no fallback:** None — all dependencies resolve.

**Seed files needed (Wave 1):** `content/home.yaml` and `content/about.yaml` must be created as empty-but-valid YAML before pages can render without error.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — no jest/vitest/playwright config in project root |
| Config file | Not present |
| Quick run command | `npm run build` (build-time TypeScript check) |
| Full suite command | `npm run build && npm run lint` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POD-01 | Podcasts page lists all episodes with date | smoke (manual) | `npm run dev` + visit /podcasts | ❌ Wave 0 |
| POD-02 | SoundCloud embed loads client-side, no hydration errors | smoke (manual browser) | `npm run dev` + check console | ❌ Wave 0 |
| PRESS-01 | Press list renders publication/headline/date | smoke (manual) | `npm run dev` + visit /press | ❌ Wave 0 |
| PRESS-02 | External links open correctly | smoke (manual) | `npm run dev` + click links | ❌ Wave 0 |
| SHOW-01 | Showcases page shows upcoming + past sections | smoke (manual) | `npm run dev` + visit /showcases | ❌ Wave 0 |
| SHOW-02 | Venue/city/date/ticket link appear on cards | smoke (manual) | `npm run dev` + verify card content | ❌ Wave 0 |
| SHOW-03 | Past events visually distinct (grayscale/opacity) | smoke (manual) | `npm run dev` + visual check | ❌ Wave 0 |
| PAGE-01 | Homepage shows hero + featured releases + artist teaser | smoke (manual) | `npm run dev` + visit / | ❌ Wave 0 |
| PAGE-02 | Beatport accolade visible on homepage | smoke (manual) | `npm run dev` + verify badge | ❌ Wave 0 |
| PAGE-03 | About page renders rich text body | smoke (manual) | `npm run dev` + visit /about | ❌ Wave 0 |
| PAGE-04 | Merch page renders iframe or fallback | smoke (manual) | `npm run dev` + visit /merch | ❌ Wave 0 |
| All | Build succeeds without TypeScript errors | build | `npm run build` | ✅ (npm run build exists) |

**Note:** No automated test framework is installed. All Phase 5 validation is build-success + manual browser smoke testing. This is consistent with how Phases 3 and 4 were verified.

### Wave 0 Gaps
- No test files needed — project uses manual smoke testing + build verification

*(No new test infrastructure required — build gate is `npm run build`.)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 5 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | All pages are public |
| V5 Input Validation | Partial | No user inputs; `siteConfig.merchUrl` from CMS used as iframe src — validate is URL |
| V6 Cryptography | No | No cryptographic operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unvalidated iframe src from CMS field | Tampering | `siteConfig.merchUrl` is a Keystatic `fields.url()` which validates URL format at CMS level. Still: guard with null check and `startsWith('https://')` before rendering in iframe src |
| YouTube embed URL injection | Tampering | Extract video ID from `heroVideoUrl` via regex; only construct embed URL from extracted ID — never use the raw CMS URL directly as iframe src |
| External press links | — | `rel="noopener noreferrer"` on all `target="_blank"` links (per D-16) — prevents opener attacks |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `DocumentRenderer` works in Next.js 16 App Router Server Components without "use client" | Code Examples, About Page | Could require wrapping in a client component — would need `next/dynamic` approach similar to embeds |
| A2 | YouTube autoplay works with `mute=1` + `allow="autoplay"` on modern browsers (Chrome/Safari/Firefox) | Code Examples: YouTube Hero | Safari may still block autoplay in some cases; fallback is static poster image |
| A3 | Showcases `status` field is the intended mechanism for upcoming/past distinction (not date comparison) | Code Examples, Schema Gap | If Elif expects automatic date-based status, entries set to 'upcoming' with past dates won't shift. The plan should document that `status` is a manual field. |

---

## Open Questions

1. **Hero video poster frame fallback**
   - What we know: Both desktop and mobile iframe elements are present in the DOM regardless of whether URLs are set (they render empty when URLs are null).
   - What's unclear: When `heroVideoUrl` is null (not yet set in Keystatic), the hero section should not render blank iframes.
   - Recommendation: Guard iframe rendering with null check: `{desktopEmbedUrl && <iframe ... />}`. When both video URLs are null, the hero shows only the dark overlay with the Logo centered — acceptable fallback.

2. **Podcast `coverImage` path prefix**
   - What we know: The podcasts schema uses `directory: 'public/images/releases'` and `publicPath: '/images/releases/'` for `coverImage` (it shares the releases images folder). [VERIFIED: keystatic.config.ts line 153–154]
   - What's unclear: Was this intentional (podcast covers stored alongside release covers) or a copy-paste from releases?
   - Recommendation: Use as-is. The `<Image src={'/images/releases/' + entry.coverImage} />` pattern will work. Do not change the schema.

3. **`homePage.featuredArtistSlugs` vs "show all artists"**
   - What we know: D-08 says "if `featuredArtistSlugs` is empty, show all artists." The array field currently has no entries.
   - What's unclear: The field could have an empty array `[]` or null/undefined depending on whether the YAML was seeded.
   - Recommendation: Check `Array.isArray(slugs) && slugs.length > 0` — if truthy, filter; otherwise fetch all via `reader.collections.artists.all()`.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: codebase] `keystatic.config.ts` — all collection and singleton schemas; confirmed fields, types, path conventions
- [VERIFIED: codebase] `components/releases/SoundCloudEmbed.tsx`, `SoundCloudPlayer.tsx` — exact component interface
- [VERIFIED: codebase] `lib/releases.ts` — `buildSoundCloudEmbedUrl()`, `plainTextFromDocument()` with `import 'server-only'`
- [VERIFIED: codebase] `lib/keystatic.ts` — `reader` export pattern
- [VERIFIED: codebase] `components/layout/SiteFooter.tsx` — `.read()` null-safe singleton pattern
- [VERIFIED: codebase] `app/releases/page.tsx` — `.all()` collection read pattern
- [VERIFIED: node_modules] `@keystatic/core/package.json` exports — `./renderer` export path confirmed
- [VERIFIED: node_modules] `@keystatic/core/dist/declarations/src/renderer.d.ts` — `DocumentRenderer` accepts `{ document: Element[] }`
- [VERIFIED: node_modules] `@keystatic/core/dist/declarations/src/reader/generic.d.ts` — `.read()` returns null | T; `.readOrThrow()` throws

### Secondary (MEDIUM confidence)
- [CITED: 05-CONTEXT.md] All D-XX decisions — locked implementation decisions from user Q&A
- [CITED: 05-UI-SPEC.md] Component specs, color tokens, spacing, copywriting contract

### Tertiary (LOW confidence)
- [ASSUMED] YouTube `loop=1` + `playlist=VIDEO_ID` pattern — standard YouTube embed API, but not verified against current YouTube IFrame Player API docs in this session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in node_modules
- Architecture: HIGH — patterns directly verified from existing working code
- Schema: HIGH — read directly from keystatic.config.ts
- YouTube embed params: MEDIUM — standard API, not re-verified against live docs
- DocumentRenderer RSC behavior: MEDIUM — dist exports confirmed, RSC compatibility assumed based on `react-server` dist variant present

**Research date:** 2026-04-23
**Valid until:** 2026-05-23 (stable project — 30 days reasonable)
