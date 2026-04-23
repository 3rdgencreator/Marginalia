# Phase 5: Secondary Content Pages — Pattern Map

**Mapped:** 2026-04-23
**Files analyzed:** 13 new/modified files
**Analogs found:** 13 / 13

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/page.tsx` | page (server component) | CRUD (multi-collection read) | `app/artists/page.tsx` + `app/releases/page.tsx` | role-match (aggregates both) |
| `app/podcasts/page.tsx` | page (server component) | CRUD (collection read + transform) | `app/releases/page.tsx` | exact |
| `components/podcasts/PodcastAccordion.tsx` | component (client) | event-driven (accordion state) | `components/layout/MobileMenu.tsx` | role-match |
| `components/podcasts/PodcastRow.tsx` | component (client leaf) | event-driven (expand/collapse) | `components/layout/MobileMenu.tsx` | role-match |
| `app/press/page.tsx` | page (server component) | CRUD (collection read + sort) | `app/releases/page.tsx` | exact |
| `components/press/PressEntry.tsx` | component (server) | request-response | `components/releases/ReleaseCard.tsx` | role-match |
| `app/showcases/page.tsx` | page (server component) | CRUD (collection read + partition) | `app/releases/page.tsx` | exact |
| `components/showcases/ShowcaseCard.tsx` | component (server) | request-response | `components/releases/ReleaseCard.tsx` | role-match |
| `app/about/page.tsx` | page (server component) | request-response (singleton read) | `app/artists/[slug]/page.tsx` | role-match |
| `app/merch/page.tsx` | page (server component) | request-response (singleton read) | `components/layout/SiteFooter.tsx` | partial |
| `keystatic.config.ts` | config | — | `keystatic.config.ts` (itself — modify existing) | exact |
| `content/home.yaml` | config/seed | — | `content/site-config.yaml` (peer singleton YAML) | exact |
| `content/about.yaml` | config/seed | — | `content/site-config.yaml` (peer singleton YAML) | exact |

---

## Pattern Assignments

### `app/page.tsx` (page, multi-collection CRUD)

**Analog:** `app/releases/page.tsx` (lines 1-52) for collection reads; `components/layout/SiteFooter.tsx` (lines 25-37) for null-safe singleton read.

**Imports pattern** — copy from `app/releases/page.tsx` lines 1-4, add to taste:
```typescript
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ReleaseCard from '@/components/releases/ReleaseCard';
import ArtistCard from '@/components/artists/ArtistCard';
import Logo from '@/components/ui/Logo';
```

**Singleton read pattern (null-safe)** — copy from `components/layout/SiteFooter.tsx` lines 27-29:
```typescript
// .read() returns null if content/home.yaml doesn't exist — NEVER use .readOrThrow() here
const homeData = await reader.singletons.homePage.read();
const beatportAccolade = homeData?.beatportAccolade ?? null;
const featuredArtistSlugs = homeData?.featuredArtistSlugs ?? [];
const heroVideoUrl = homeData?.heroVideoUrl ?? null;
const heroVideoMobileUrl = homeData?.heroVideoMobileUrl ?? null;
```

**Collection all + filter pattern** — copy from `app/releases/page.tsx` lines 13-18:
```typescript
const releases = await reader.collections.releases.all();
const sorted = [...releases].sort((a, b) => {
  const aDate = a.entry.releaseDate ?? '';
  const bDate = b.entry.releaseDate ?? '';
  return bDate.localeCompare(aDate);
});
// Then filter by featured flag (D-07 — NOT featuredReleaseSlug)
const featured = sorted.filter(({ entry }) => entry.featured === true);
```

**Collection data shape for ReleaseCard** — copy from `app/releases/page.tsx` lines 39-47:
```typescript
featured.map(({ slug, entry }) => ({
  slug,
  entry: {
    title: entry.title,
    artistName: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artistName,
    coverArt: entry.coverArt,
    artworkUrl: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artworkUrl,
  },
}))
```

**Artist grid pattern** — copy from `app/artists/page.tsx` lines 11-24:
```typescript
const artistSlugs = await reader.collections.artists.list();
const allArtists = (
  await Promise.all(
    artistSlugs.map(async (slug) => {
      const entry = await reader.collections.artists.read(slug);
      return entry ? { slug, entry } : null;
    })
  )
).filter((a): a is NonNullable<typeof a> => a !== null);
// If featuredArtistSlugs is non-empty, filter; otherwise show all (D-08)
const artists = (Array.isArray(featuredArtistSlugs) && featuredArtistSlugs.length > 0)
  ? allArtists.filter(({ slug }) => featuredArtistSlugs.includes(slug))
  : allArtists;
```

**Section grid JSX pattern** — copy from `app/artists/page.tsx` lines 37-49 (use `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` per UI-SPEC, NOT `ReleaseGrid` which uses `grid-cols-3 md:grid-cols-4 lg:grid-cols-5`):
```tsx
<ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)">
  {featured.map(({ slug, entry }) => (
    <li key={slug}>
      <ReleaseCard slug={slug} entry={entry} />
    </li>
  ))}
</ul>
```

**Empty state pattern** — copy from `app/releases/page.tsx` lines 27-35:
```tsx
{sorted.length === 0 ? (
  <p className="text-(--text-body) text-(--color-text-muted)">No releases yet.</p>
) : (
  /* grid */
)}
```

**YouTube hero URL builder** — new helper, no existing analog; build inline in `app/page.tsx`:
```typescript
function buildYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const params = new URLSearchParams({
    autoplay: '1', mute: '1', loop: '1', controls: '0',
    playlist: match[1], playsinline: '1', rel: '0',
  });
  return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
}
```

**Hero iframe JSX** — per UI-SPEC lines 115-120; `allow="autoplay; encrypted-media"` is required for autoplay to work:
```tsx
{/* Full-viewport hero — both iframes present, CSS toggles visibility */}
<section className="relative h-[100dvh] overflow-hidden bg-(--color-bg)">
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
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
  {/* Logo centered over video */}
  <div className="absolute inset-0 flex items-center justify-center">
    <Logo className="h-16 md:h-24 w-auto" />
  </div>
</section>
```

**Metadata pattern** — copy from `app/releases/page.tsx` lines 6-10:
```typescript
export const metadata: Metadata = {
  title: 'Marginalia',
  description: 'Barcelona-based melodic house and techno record label.',
};
```

---

### `app/podcasts/page.tsx` (page, collection CRUD)

**Analog:** `app/releases/page.tsx` (exact match for server component collection read + sort pattern).

**Imports pattern** — copy from `app/releases/page.tsx` lines 1-4, replace grid import:
```typescript
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import { buildSoundCloudEmbedUrl } from '@/lib/releases';
import Container from '@/components/layout/Container';
import PodcastAccordion from '@/components/podcasts/PodcastAccordion';
```

**CRITICAL — server-only import rule:** `lib/releases.ts` has `import 'server-only'` on line 1. Call `buildSoundCloudEmbedUrl` here in the server component, pass the resulting string down as a prop. Never import `lib/releases.ts` in a client component.

**Collection read + transform pattern** — copy from `app/releases/page.tsx` lines 13-18 (sort by `date` field name, not `releaseDate`):
```typescript
const all = await reader.collections.podcasts.all();
const sorted = [...all].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
// Build embed URLs server-side — pass as props to client accordion
const episodes = sorted.map(({ slug, entry }) => ({
  slug,
  title: entry.title,
  artistSlug: entry.artistSlug ?? null,
  date: entry.date ?? null,
  description: entry.description ?? null,
  coverImage: entry.coverImage ?? null,
  embedUrl: entry.soundcloudUrl ? buildSoundCloudEmbedUrl(entry.soundcloudUrl) : null,
}));
```

**Empty state** — copy exact class pattern from `app/releases/page.tsx` lines 27-35:
```tsx
{sorted.length === 0 ? (
  <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
    No episodes yet.
  </p>
) : (
  <PodcastAccordion episodes={episodes} />
)}
```

---

### `components/podcasts/PodcastAccordion.tsx` (component, client, event-driven)

**Analog:** `components/layout/MobileMenu.tsx` (lines 1-18) for the `'use client'` + `useState` open/close pattern.

**'use client' + useState toggle pattern** — copy from `components/layout/MobileMenu.tsx` lines 1-18:
```typescript
'use client';

import { useState } from 'react';
import PodcastRow from './PodcastRow';

type Episode = {
  slug: string;
  title: string;
  artistSlug: string | null;
  date: string | null;
  description: string | null;
  coverImage: string | null;
  embedUrl: string | null;
};

export default function PodcastAccordion({ episodes }: { episodes: Episode[] }) {
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

Note: `MobileMenu.tsx` uses `useEffect` for body scroll lock — do NOT copy that. The accordion only needs the basic `useState` toggle.

---

### `components/podcasts/PodcastRow.tsx` (component, client leaf, event-driven)

**Analog:** `components/layout/MobileMenu.tsx` lines 44-96 for the expand/collapse JSX pattern with CSS transition.

**Client leaf component pattern:**
```typescript
'use client';

import Image from 'next/image';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
import EmbedSkeleton from '@/components/releases/EmbedSkeleton';

type Episode = { slug: string; title: string; artistSlug: string | null; date: string | null; description: string | null; coverImage: string | null; embedUrl: string | null; };

export default function PodcastRow({ episode, isOpen, onToggle }: {
  episode: Episode; isOpen: boolean; onToggle: () => void;
}) { ... }
```

**Expand/collapse CSS transition pattern** — copy structure from `MobileMenu.tsx` lines 74-78 (adapt `opacity`/`translate` to `max-height`):
```tsx
{/* Collapsed header — full row is the button */}
<button
  type="button"
  onClick={onToggle}
  aria-expanded={isOpen}
  aria-controls={`podcast-panel-${episode.slug}`}
  className={`w-full flex items-center justify-between py-(--space-md) px-(--space-lg) cursor-pointer hover:bg-(--color-surface) transition-colors duration-150 ${
    isOpen ? 'border-l-4 border-(--color-accent-violet)' : ''
  }`}
>
  ...
</button>
{/* Expanded panel */}
<div
  id={`podcast-panel-${episode.slug}`}
  role="region"
  aria-labelledby={`podcast-btn-${episode.slug}`}
  className={`overflow-hidden transition-all duration-200 ease-out ${
    isOpen ? 'max-h-[600px]' : 'max-h-0'
  }`}
>
  {isOpen && (
    <div className="flex flex-col md:flex-row gap-(--space-lg) p-(--space-lg)">
      {/* Left: artwork */}
      {/* Right: SoundCloudEmbed + description */}
    </div>
  )}
</div>
```

**SoundCloudEmbed usage pattern** — copy from `app/releases/[slug]/page.tsx` line 169 (pass embedUrl prop, not raw URL):
```tsx
{episode.embedUrl && <SoundCloudEmbed embedUrl={episode.embedUrl} />}
```

**EmbedSkeleton** is already wired inside `SoundCloudEmbed` via `next/dynamic` — no manual usage needed; `SoundCloudEmbed` renders `EmbedSkeleton` automatically while loading.

**Image path pattern** — copy from `app/releases/[slug]/page.tsx` lines 100-102; podcasts use `/images/releases/` directory (same as releases per `keystatic.config.ts` line 153):
```tsx
{episode.coverImage && (
  <Image
    src={`/images/releases/${episode.coverImage}`}
    alt={episode.title}
    width={192}
    height={192}
    className="w-48 h-48 flex-shrink-0 object-cover"
  />
)}
```

---

### `app/press/page.tsx` (page, collection CRUD)

**Analog:** `app/releases/page.tsx` — exact same server component + collection all + sort pattern.

**Imports pattern** — copy from `app/releases/page.tsx` lines 1-4:
```typescript
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import PressEntry from '@/components/press/PressEntry';
```

**Collection read + sort** — copy from `app/releases/page.tsx` lines 13-18 (sort on `date`):
```typescript
const entries = await reader.collections.press.all();
const sorted = [...entries].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
```

**Heading pattern** — copy from `app/releases/page.tsx` line 23:
```tsx
<h1 className="mb-8 text-(--text-heading) md:text-[2rem] font-bold tracking-[-0.02em] text-(--color-text-primary) uppercase">
  Press
</h1>
```

**Empty state** — copy from `app/releases/page.tsx` lines 27-35, use copy `"No press coverage yet."`.

**List container JSX** — divided rows, no grid (per UI-SPEC line 159):
```tsx
<ul role="list" className="divide-y divide-(--color-surface)">
  {sorted.map(({ slug, entry }) => (
    <li key={slug}>
      <PressEntry entry={entry} />
    </li>
  ))}
</ul>
```

---

### `components/press/PressEntry.tsx` (component, server, request-response)

**Analog:** `components/releases/ReleaseCard.tsx` lines 1-75 for props-down display component structure.

**Props-down server component pattern** — copy structure from `ReleaseCard.tsx` lines 1-13:
```typescript
import type { InferRenderersForComponentBlocks } from '@keystatic/core';

type PressEntryProps = {
  entry: {
    headline: string;
    publication: string;
    date: string | null;
    url: string | null;
    excerpt: string | null;
    type: 'review' | 'interview' | 'feature' | 'mention' | 'chart';
  };
};

export default function PressEntry({ entry }: PressEntryProps) { ... }
```

**External link pattern** — per D-16, all links use `target="_blank" rel="noopener noreferrer"`:
```tsx
{entry.url && (
  <a
    href={entry.url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Read ${entry.headline} at ${entry.publication} (opens in new tab)`}
    className="text-(--text-body) font-bold text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150"
  >
    {entry.headline}
  </a>
)}
```

**Token pattern** — copy token class names from `app/artists/[slug]/page.tsx` line 109:
```tsx
{/* Publication + date */}
<span className="text-(--text-label) text-(--color-text-secondary)">
  {entry.publication} · {entry.date}
</span>
```

**Type badge color map** — per UI-SPEC lines 76-79:
```typescript
const BADGE_CLASSES: Record<string, string> = {
  review: 'bg-(--color-tag-lavender) text-white',
  interview: 'bg-(--color-tag-sky) text-black',
  feature: 'bg-(--color-accent-lime) text-black',
  chart: 'bg-(--color-tag-yellow) text-black',
  mention: 'bg-(--color-surface) text-(--color-text-secondary)',
};
```

---

### `app/showcases/page.tsx` (page, collection CRUD + partition)

**Analog:** `app/releases/page.tsx` for server component collection read; add partitioning step after sort.

**Imports pattern** — copy from `app/releases/page.tsx` lines 1-4:
```typescript
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ShowcaseCard from '@/components/showcases/ShowcaseCard';
```

**Partitioning pattern** — from RESEARCH.md Code Examples (showcases `status` field is explicit; do NOT use date comparison):
```typescript
const all = await reader.collections.showcases.all();
const sorted = [...all].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
const upcoming = sorted.filter(s => s.entry.status === 'upcoming');
const past = sorted.filter(s => s.entry.status === 'past');
```

**Conditional section pattern** — copy conditional guard from `app/releases/page.tsx` lines 27-35 (guard the entire "UPCOMING" section):
```tsx
{upcoming.length > 0 && (
  <section aria-labelledby="upcoming-heading">
    <h2 id="upcoming-heading" className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-accent-lime)">
      Upcoming
    </h2>
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)">
      {upcoming.map(({ slug, entry }) => (
        <li key={slug}><ShowcaseCard entry={entry} variant="upcoming" /></li>
      ))}
    </ul>
  </section>
)}
{past.length > 0 && (
  <section aria-labelledby="past-heading" className="mt-(--space-3xl)">
    <h2 id="past-heading" className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-text-secondary)">
      Past
    </h2>
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)">
      {past.map(({ slug, entry }) => (
        <li key={slug}><ShowcaseCard entry={entry} variant="past" /></li>
      ))}
    </ul>
  </section>
)}
```

---

### `components/showcases/ShowcaseCard.tsx` (component, server, request-response)

**Analog:** `components/releases/ReleaseCard.tsx` for props-down display component structure. `components/artists/ArtistCard.tsx` for image with fallback pattern.

**Props-down pattern** — copy structure from `ReleaseCard.tsx` lines 1-13:
```typescript
import Image from 'next/image';

type ShowcaseCardProps = {
  entry: {
    title: string;
    date: string | null;
    venue: string | null;
    city: string | null;
    country: string | null;
    status: 'upcoming' | 'past';
    ticketUrl: string | null | undefined;
    aftermovieUrl: string | null | undefined;
    flyer: string | null;
  };
  variant: 'upcoming' | 'past';
};
```

**Past event visual treatment** — per UI-SPEC line 181 (`opacity-60` + `grayscale(0.4)`):
```tsx
<article
  className={`bg-(--color-surface) p-(--space-lg) ${
    variant === 'past' ? 'opacity-60' : ''
  }`}
  style={variant === 'past' ? { filter: 'grayscale(0.4)' } : undefined}
>
```

**Flyer image pattern** — copy from `app/artists/[slug]/page.tsx` lines 85-92 (image with fallback):
```tsx
{entry.flyer && (
  <div className="aspect-video w-full overflow-hidden mb-(--space-md)">
    <Image
      src={`/images/showcases/${entry.flyer}`}
      alt={`${entry.title} flyer`}
      width={800}
      height={450}
      sizes="(max-width: 768px) 100vw, 33vw"
      className="w-full h-full object-cover"
    />
  </div>
)}
```

**Ticket button pattern** — copy button class pattern from `components/releases/LayloButton.tsx` (if it exists) or use the token pattern from UI-SPEC line 179:
```tsx
{variant === 'upcoming' && entry.ticketUrl && (
  <a
    href={entry.ticketUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`Get tickets for ${entry.title}`}
    className="inline-block mt-(--space-md) px-(--space-lg) py-(--space-sm) bg-(--color-accent-violet) text-white text-(--text-label) font-bold uppercase hover:bg-(--color-accent-lime) hover:text-black transition-colors duration-150"
  >
    Get Tickets
  </a>
)}
{variant === 'past' && entry.aftermovieUrl && (
  <a
    href={entry.aftermovieUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
  >
    Watch Aftermovie ↗
  </a>
)}
```

---

### `app/about/page.tsx` (page, singleton read)

**Analog:** `app/artists/[slug]/page.tsx` lines 1-149 for two-column editorial layout with image; `components/layout/SiteFooter.tsx` lines 27-29 for null-safe singleton read pattern.

**Imports pattern** — copy from `app/artists/[slug]/page.tsx` lines 1-6:
```typescript
import type { Metadata } from 'next';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import { plainTextFromDocument } from '@/lib/releases';
import Container from '@/components/layout/Container';
import { DocumentRenderer } from '@keystatic/core/renderer';
```

**Null-safe singleton read** — copy from `components/layout/SiteFooter.tsx` lines 27-29 (NEVER use `.readOrThrow()` — about.yaml may not exist yet):
```typescript
const about = await reader.singletons.about.read();
// about is null if content/about.yaml doesn't exist
```

**Metadata** — copy `generateMetadata` shape from `app/artists/[slug]/page.tsx` lines 16-48, simplify for singleton (no slug param):
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const about = await reader.singletons.about.read();
  const description = plainTextFromDocument(about?.body, 160) || 'About Marginalia.';
  return {
    title: 'About — Marginalia',
    description,
  };
}
```

**DocumentRenderer pattern** — FIRST USE in the project; import path is `@keystatic/core/renderer`:
```tsx
{about?.body && Array.isArray(about.body) && about.body.length > 0 ? (
  <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed">
    <DocumentRenderer document={about.body} />
  </div>
) : null}
```

**Photo image pattern** — copy from `app/artists/[slug]/page.tsx` lines 84-98:
```tsx
{about?.photo && (
  <div className="w-full mb-(--space-xl) overflow-hidden">
    <Image
      src={`/images/about/${about.photo}`}
      alt="Elif — Marginalia"
      width={1200}
      height={675}
      sizes="(max-width: 65ch) 100vw, 65ch"
      className="w-full object-cover"
      priority
    />
  </div>
)}
```

**Editorial layout** — per UI-SPEC line 185; constrained reading column, no two-column layout:
```tsx
<Container className="py-(--space-3xl)">
  <div className="mx-auto max-w-[65ch]">
    {about?.headline && (
      <h1 className="mb-(--space-xl) text-(--text-display) font-bold uppercase text-(--color-text-primary)">
        {about.headline}
      </h1>
    )}
    {/* photo */}
    {/* DocumentRenderer body */}
  </div>
</Container>
```

---

### `app/merch/page.tsx` (page, singleton read)

**Analog:** `components/layout/SiteFooter.tsx` lines 27-29 for null-safe singleton read; `app/about/page.tsx` (sibling page) for overall structure.

**Imports pattern:**
```typescript
import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
```

**Singleton read** — copy from `components/layout/SiteFooter.tsx` lines 27-29:
```typescript
const siteConfig = await reader.singletons.siteConfig.read();
const merchUrl = siteConfig?.merchUrl ?? null;
```

**URL security guard** — per RESEARCH.md Security section; validate before use as iframe src:
```typescript
const safeUrl = merchUrl && merchUrl.startsWith('https://') ? merchUrl : null;
```

**Iframe + fallback pattern** — per D-25/D-27 (RESEARCH.md is explicit about Shopify X-Frame-Options risk):
```tsx
{safeUrl ? (
  <>
    <iframe
      src={safeUrl}
      title="Marginalia Merch Store"
      className="w-full border-0 min-h-[80vh]"
      loading="lazy"
    />
    {/* Fallback for when Shopify blocks framing */}
    <div className="mt-4 text-center">
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
      >
        Visit our store →
      </a>
    </div>
  </>
) : (
  <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
    Merch store coming soon.
  </p>
)}
```

---

### `keystatic.config.ts` (config, modify existing)

**Analog:** `keystatic.config.ts` itself — adding fields to the existing `homePage` singleton and a new `about` singleton entry.

**Existing homePage singleton location** — lines 288-321. Add two new fields inside the `schema` block after `heroSubtext` (line 292):
```typescript
heroVideoUrl: fields.url({
  label: 'Hero Video URL (desktop 16:9)',
  description: 'Unlisted YouTube URL for desktop hero background',
}),
heroVideoMobileUrl: fields.url({
  label: 'Hero Video URL (mobile 9:16)',
  description: 'Unlisted YouTube URL for mobile portrait hero background',
}),
```

**New about singleton** — copy structure from `siteConfig` singleton (lines 257-286), adapt fields. Insert after `homePage` block (before closing `},` on the singletons object):
```typescript
about: singleton({
  label: 'About',
  path: 'content/about',
  format: { data: 'yaml' },
  schema: {
    headline: fields.text({ label: 'Headline' }),
    body: fields.document({
      label: 'Body',
      formatting: true,
      links: true,
    }),
    photo: fields.image({
      label: 'Photo',
      directory: 'public/images/about',
      publicPath: '/images/about/',
    }),
  },
}),
```

---

### `content/home.yaml` (seed file)

**Analog:** Structure must match the `homePage` singleton schema in `keystatic.config.ts`. After adding `heroVideoUrl`/`heroVideoMobileUrl` fields, the complete seed YAML is:
```yaml
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

---

### `content/about.yaml` (seed file)

**Analog:** `content/site-config.yaml` (peer singleton seed). Must match `about` singleton schema fields:
```yaml
headline: About Marginalia
body: []
photo: null
```

---

## Shared Patterns

### Null-safe singleton read
**Source:** `components/layout/SiteFooter.tsx` lines 27-29
**Apply to:** `app/page.tsx`, `app/about/page.tsx`, `app/merch/page.tsx`
```typescript
// Always .read(), never .readOrThrow() for singletons that may lack seed files
const data = await reader.singletons.SINGLETON_NAME.read();
const field = data?.fieldName ?? fallbackValue;
```

### Collection all + date-descending sort
**Source:** `app/releases/page.tsx` lines 13-18
**Apply to:** `app/podcasts/page.tsx`, `app/press/page.tsx`, `app/showcases/page.tsx`
```typescript
const all = await reader.collections.COLLECTION_NAME.all();
const sorted = [...all].sort((a, b) =>
  (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
);
```

### Tailwind v4 CSS variable token syntax
**Source:** Every existing component in the project
**Apply to:** All new components and pages
```
bg-(--color-surface)          // correct v4 syntax
text-(--color-text-primary)   // correct v4 syntax
bg-[--color-surface]          // WRONG — v3 syntax, do not use
```

### Container page wrapper
**Source:** `components/layout/Container.tsx` (full file, 13 lines)
**Apply to:** All new `app/*/page.tsx` files
```tsx
<Container className="py-(--space-3xl)">
  {/* page content */}
</Container>
```

### Empty state
**Source:** `app/releases/page.tsx` lines 27-35
**Apply to:** `app/podcasts/page.tsx`, `app/press/page.tsx`, `app/showcases/page.tsx`
```tsx
{sorted.length === 0 ? (
  <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
    {COPY_FROM_UI_SPEC}
  </p>
) : (
  /* list/grid */
)}
```

### External link safety
**Source:** D-16 decision; consistent with `components/layout/SiteFooter.tsx` patterns
**Apply to:** `components/press/PressEntry.tsx`, `components/showcases/ShowcaseCard.tsx`, `app/merch/page.tsx`
```tsx
target="_blank" rel="noopener noreferrer"
```

### Image path prefix rule
**Source:** `app/releases/[slug]/page.tsx` lines 100-102; `app/artists/[slug]/page.tsx` lines 86-87
**Apply to:** All new components that display CMS images
```typescript
// Pattern: '/images/' + DIRECTORY_NAME + '/' + entry.fieldName
// Releases + Podcasts cover: '/images/releases/' + entry.coverArt
// Artists photo:             '/images/artists/'  + entry.photo
// Showcases flyer:           '/images/showcases/' + entry.flyer
// About photo:               '/images/about/'    + about.photo
```

### server-only import firewall
**Source:** `lib/releases.ts` line 1 (`import 'server-only'`)
**Apply to:** `app/podcasts/page.tsx` (build embed URLs here, pass as string props)
```typescript
// In server component (page.tsx) — this is allowed:
import { buildSoundCloudEmbedUrl } from '@/lib/releases';
// In client component (PodcastAccordion/PodcastRow) — this would crash at build time:
// import { buildSoundCloudEmbedUrl } from '@/lib/releases'; // DO NOT DO THIS
```

---

## No Analog Found

All files have analogs in the existing codebase. No files require falling back to external pattern sources.

---

## Critical Anti-Patterns (from RESEARCH.md)

These are build-breaking or runtime-breaking mistakes to avoid, reinforced by the analog study:

| Anti-Pattern | Source of Truth | Correct Pattern |
|---|---|---|
| `readOrThrow()` on `homePage` or `about` | `SiteFooter.tsx` line 27 uses `.read()` | Always `.read()` with null check |
| Import `lib/releases.ts` in `"use client"` | `lib/releases.ts` line 1: `import 'server-only'` | Build URL in server page, pass as prop |
| `bg-[--color-surface]` token syntax | Every existing component uses `bg-(--color-surface)` | Use `(--var)` not `[--var]` |
| `ReleaseGrid` on homepage featured grid | `ReleaseGrid` uses 3-5 columns (catalog density) | Homepage uses its own `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` |
| YouTube `loop=1` without `playlist=VIDEO_ID` | RESEARCH.md Pitfall 4 | Always include `playlist: match[1]` alongside `loop: '1'` |
| Raw CMS URL used directly as iframe `src` | RESEARCH.md Security section | Extract video ID via regex; guard merch URL with `startsWith('https://')` |
| `DocumentRenderer` receiving plain text string | RESEARCH.md Pitfall 8 | Guard with `Array.isArray(about.body)` before rendering |

---

## Metadata

**Analog search scope:** `/app/**`, `/components/**`, `/lib/**`, `keystatic.config.ts`
**Files scanned:** 14 source files read directly
**Pattern extraction date:** 2026-04-23
