# Architecture Research

**Domain:** Music Label Website — Next.js App Router + Keystatic CMS
**Researched:** 2026-04-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                          │
│   (React components, hydration, client-only embeds)         │
├─────────────────────────────────────────────────────────────┤
│                  Next.js App Router                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │ Layouts  │  │  Forms   │  │ Keystatic │   │
│  │ (Server  │  │ (Server  │  │ (Server  │  │  Admin   │   │
│  │Components│  │Components│  │ Actions) │  │  /admin) │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
├───────┴──────────────┴──────────────┴─────────────┴─────────┤
│                  Keystatic Reader API                        │
│         (reads from content/ directory at build time)       │
├─────────────────────────────────────────────────────────────┤
│                  content/ (Git repository)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ releases/│  │ artists/ │  │podcasts/ │  │showcases/│   │
│  │  *.yaml  │  │  *.yaml  │  │  *.yaml  │  │  *.yaml  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│              Cloudflare Workers (OpenNext)                   │
│      @opennextjs/cloudflare — NOT next-on-pages (deprecated)│
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Server Pages | Fetch content from Keystatic reader, pass to UI | `async` Server Components |
| Keystatic Admin | Content editing UI at `/keystatic` | `KeystaticApp` in `app/keystatic/` |
| Server Actions | Handle form submissions (demo, contact, subscribe) | `'use server'` functions |
| Client Components | Audio embeds, interactive UI | `next/dynamic({ ssr: false })` |
| Layout Shell | Nav, footer, site-wide metadata | `app/layout.tsx` |

## Recommended Project Structure

```
marginalia/
├── app/
│   ├── layout.tsx              # Root layout — nav, footer, fonts
│   ├── page.tsx                # Home — featured releases, hero
│   ├── about/page.tsx
│   ├── releases/
│   │   ├── page.tsx            # Catalog grid
│   │   └── [slug]/page.tsx     # Single release
│   ├── artists/
│   │   ├── page.tsx            # Roster grid
│   │   └── [slug]/page.tsx     # Artist profile
│   ├── podcasts/page.tsx
│   ├── press/page.tsx
│   ├── showcases/page.tsx
│   ├── merch/page.tsx          # Link-out to existing store
│   ├── demo/page.tsx           # Submission form
│   ├── subscribe/page.tsx
│   ├── management/page.tsx
│   └── keystatic/              # Keystatic admin
│       ├── layout.tsx
│       └── [[...params]]/page.tsx
├── components/
│   ├── layout/
│   │   ├── Nav.tsx
│   │   └── Footer.tsx
│   ├── releases/
│   │   ├── ReleaseCard.tsx
│   │   └── ReleaseGrid.tsx
│   ├── artists/
│   │   ├── ArtistCard.tsx
│   │   └── ArtistGrid.tsx
│   ├── embeds/
│   │   ├── SoundCloudEmbed.tsx  # Client-only, next/dynamic
│   │   └── SpotifyEmbed.tsx     # Client-only, next/dynamic
│   └── forms/
│       ├── DemoForm.tsx
│       └── ContactForm.tsx
├── lib/
│   ├── keystatic.ts            # Reader instance
│   └── actions.ts              # Server actions
├── content/                    # Keystatic managed files
│   ├── releases/
│   ├── artists/
│   ├── podcasts/
│   ├── press/
│   └── showcases/
├── public/
│   └── images/                 # CMS-managed images
│       ├── releases/
│       └── artists/
├── keystatic.config.ts         # Schema definition
└── next.config.ts
```

### Structure Rationale

- **`content/`:** Keystatic writes YAML/MDX files here — committed to git, versioned with the codebase
- **`components/embeds/`:** Isolated so `next/dynamic({ ssr: false })` is applied consistently — never let embeds reach SSR
- **`lib/keystatic.ts`:** Single reader instance shared across all server components

## Architectural Patterns

### Pattern 1: Keystatic Reader in Server Components

**What:** Create one reader instance, call it in `async` server components to fetch content
**When to use:** Every page that displays CMS content
**Trade-offs:** Simple and fast at build time; no runtime API needed

```typescript
// lib/keystatic.ts
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'

export const reader = createReader(process.cwd(), keystaticConfig)

// app/releases/page.tsx
import { reader } from '@/lib/keystatic'

export default async function ReleasesPage() {
  const releases = await reader.collections.releases.all()
  return <ReleaseGrid releases={releases} />
}
```

### Pattern 2: Static Generation with generateStaticParams

**What:** Pre-render all content pages at build time using Keystatic file slugs
**When to use:** All collection detail pages (`/releases/[slug]`, `/artists/[slug]`)
**Trade-offs:** Zero runtime cost; content updates require a rebuild (acceptable for git-based CMS)

```typescript
// app/releases/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await reader.collections.releases.list()
  return slugs.map(slug => ({ slug }))
}

export default async function ReleasePage({ params }: { params: { slug: string } }) {
  const release = await reader.collections.releases.read(params.slug)
  if (!release) notFound()
  // ...
}
```

### Pattern 3: Hydration-Safe Audio Embeds

**What:** Load all audio/video embeds client-side only using `next/dynamic`
**When to use:** Any SoundCloud iframe, Spotify embed, YouTube embed
**Trade-offs:** Slight layout shift on load — mitigate with skeleton placeholder

```typescript
// components/embeds/SoundCloudEmbed.tsx
'use client'
export function SoundCloudEmbed({ trackId }: { trackId: string }) {
  return (
    <iframe
      src={`https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${trackId}`}
      allow="autoplay"
    />
  )
}

// Usage in a Server Component:
import dynamic from 'next/dynamic'
const SoundCloudEmbed = dynamic(
  () => import('@/components/embeds/SoundCloudEmbed').then(m => m.SoundCloudEmbed),
  { ssr: false, loading: () => <div className="h-24 bg-neutral-900 animate-pulse" /> }
)
```

## Keystatic Schema Design

### Collections

```typescript
// keystatic.config.ts
import { config, collection, singleton, fields } from '@keystatic/core'

export default config({
  storage: { kind: 'local' }, // switch to 'github' for production

  collections: {
    releases: collection({
      label: 'Releases',
      slugField: 'title',
      path: 'content/releases/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        artist: fields.text({ label: 'Artist Name' }),
        releaseDate: fields.date({ label: 'Release Date' }),
        genre: fields.select({ label: 'Genre', options: [
          { label: 'Melodic House & Techno', value: 'melodic-house-techno' },
          { label: 'Indie Dance', value: 'indie-dance' },
          { label: 'Afro House', value: 'afro-house' },
        ], defaultValue: 'melodic-house-techno' }),
        artwork: fields.image({
          label: 'Artwork',
          directory: 'public/images/releases',
          publicPath: '/images/releases',
        }),
        soundcloudTrackId: fields.text({ label: 'SoundCloud Track ID', validation: { isRequired: false } }),
        beatportUrl: fields.url({ label: 'Beatport URL', validation: { isRequired: false } }),
        spotifyUri: fields.text({ label: 'Spotify URI', validation: { isRequired: false } }),
        description: fields.text({ label: 'Description', multiline: true }),
        featured: fields.checkbox({ label: 'Featured on homepage', defaultValue: false }),
      },
    }),

    artists: collection({
      label: 'Artists',
      slugField: 'name',
      path: 'content/artists/*',
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/artists',
          publicPath: '/images/artists',
        }),
        soundcloud: fields.url({ label: 'SoundCloud', validation: { isRequired: false } }),
        instagram: fields.url({ label: 'Instagram', validation: { isRequired: false } }),
        beatport: fields.url({ label: 'Beatport', validation: { isRequired: false } }),
        spotify: fields.url({ label: 'Spotify', validation: { isRequired: false } }),
        featured: fields.checkbox({ label: 'Featured on roster', defaultValue: true }),
      },
    }),

    podcasts: collection({
      label: 'Podcasts / Mixes',
      slugField: 'title',
      path: 'content/podcasts/*',
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.date({ label: 'Date' }),
        description: fields.text({ label: 'Description', multiline: true }),
        embedUrl: fields.url({ label: 'Embed URL (SoundCloud/Mixcloud)' }),
        duration: fields.text({ label: 'Duration (e.g. 1:23:45)' }),
      },
    }),

    press: collection({
      label: 'Press',
      slugField: 'headline',
      path: 'content/press/*',
      schema: {
        headline: fields.slug({ name: { label: 'Headline' } }),
        publication: fields.text({ label: 'Publication' }),
        date: fields.date({ label: 'Date' }),
        url: fields.url({ label: 'Article URL' }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true }),
      },
    }),

    showcases: collection({
      label: 'Showcases / Events',
      slugField: 'title',
      path: 'content/showcases/*',
      schema: {
        title: fields.slug({ name: { label: 'Event Name' } }),
        date: fields.date({ label: 'Date' }),
        venue: fields.text({ label: 'Venue' }),
        city: fields.text({ label: 'City' }),
        country: fields.text({ label: 'Country' }),
        ticketUrl: fields.url({ label: 'Ticket URL', validation: { isRequired: false } }),
        past: fields.checkbox({ label: 'Past event', defaultValue: false }),
      },
    }),
  },

  singletons: {
    siteConfig: singleton({
      label: 'Site Config',
      path: 'content/site-config',
      schema: {
        siteName: fields.text({ label: 'Site Name', defaultValue: 'Marginalia' }),
        tagline: fields.text({ label: 'Tagline' }),
        instagramUrl: fields.url({ label: 'Instagram' }),
        soundcloudUrl: fields.url({ label: 'SoundCloud' }),
        beatportUrl: fields.url({ label: 'Beatport' }),
        youtubeUrl: fields.url({ label: 'YouTube' }),
        merchUrl: fields.url({ label: 'Merch Store URL' }),
      },
    }),
  },
})
```

## Route Table

| Route | Rendering | Data Source |
|-------|-----------|-------------|
| `/` | SSG | Keystatic (featured releases, site config) |
| `/about` | SSG | Keystatic singleton |
| `/releases` | SSG | Keystatic releases collection |
| `/releases/[slug]` | SSG + generateStaticParams | Keystatic single release |
| `/artists` | SSG | Keystatic artists collection |
| `/artists/[slug]` | SSG + generateStaticParams | Keystatic single artist |
| `/podcasts` | SSG | Keystatic podcasts collection |
| `/press` | SSG | Keystatic press collection |
| `/showcases` | SSG | Keystatic showcases collection |
| `/merch` | SSG | Static (link-out to existing store) |
| `/demo` | Dynamic | Server Action for form submission |
| `/subscribe` | Dynamic | Server Action for email capture |
| `/management` | Dynamic | Server Action for contact |
| `/keystatic/[...]` | Dynamic (Node runtime) | Keystatic admin — requires Node runtime |

**Critical:** The Keystatic admin route MUST use Node.js runtime, not Edge. This means the app cannot use `output: 'export'` (static export).

## Data Flow

### Content Read Flow (SSG)

```
Build time:
  Keystatic config (keystatic.config.ts)
      ↓ defines schema
  content/ YAML files
      ↓ read by
  reader API (lib/keystatic.ts)
      ↓ consumed by
  Server Components (app/**/page.tsx)
      ↓ rendered to
  Static HTML + JSON (Cloudflare Workers cache)
      ↓ served to
  Browser
```

### Form Submission Flow

```
Browser form submit
      ↓
  Server Action ('use server')
      ↓
  Validation + email via Resend/SMTP
      ↓
  Response (success/error state)
      ↓
  Client re-renders form state
```

### Content Edit Flow (Keystatic Admin)

```
Editor at /keystatic
      ↓ edits content
  Keystatic writes YAML to content/
      ↓ committed to git
  Git push triggers
      ↓
  Cloudflare Workers build
      ↓
  Static pages regenerated
```

## Deployment: Cloudflare Workers via OpenNext

**Critical:** `@cloudflare/next-on-pages` is **deprecated as of late 2025**. Use `@opennextjs/cloudflare` instead.

```bash
npm install @opennextjs/cloudflare wrangler --save-dev
```

```toml
# wrangler.toml
name = "marginalia"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx @opennextjs/cloudflare build"
```

Note: Keystatic admin (`/keystatic`) requires Node.js runtime which is compatible with Cloudflare Workers with `nodejs_compat` flag, but NOT Cloudflare Pages Functions. Workers is the correct target.

## Build Phase Order

```
Phase 1: Foundation
  → next.config.ts, tailwind.config.ts, keystatic.config.ts (schema)
  → app/layout.tsx (Nav, Footer shells)

Phase 2: Core Layout & Design System
  → Typography, color tokens, component primitives

Phase 3: Releases (highest priority content)
  → /releases, /releases/[slug], ReleaseCard, SoundCloudEmbed

Phase 4: Artists
  → /artists, /artists/[slug], ArtistCard

Phase 5: Secondary Collections
  → /podcasts, /press, /showcases, /about

Phase 6: Forms & Interactions
  → /demo, /subscribe, /management (Server Actions)

Phase 7: SEO & Polish
  → metadata, Open Graph, structured data, Keystatic admin wire-up
```

## Anti-Patterns

### Anti-Pattern 1: Static Export with Keystatic Admin

**What people do:** Set `output: 'export'` in next.config.ts to deploy as pure static
**Why it's wrong:** Keystatic admin route requires server runtime — it will be silently excluded or crash
**Do this instead:** Use OpenNext/Cloudflare Workers which supports mixed rendering

### Anti-Pattern 2: SSR on Audio Embeds

**What people do:** Render SoundCloud/Spotify iframes in server components
**Why it's wrong:** Hydration mismatch errors on every page with an embed
**Do this instead:** Always wrap in `next/dynamic({ ssr: false })`

### Anti-Pattern 3: Loose Keystatic Image Paths

**What people do:** Set `directory` without matching `publicPath`, or forget to add path to `public/`
**Why it's wrong:** Images 404 in production; no error at build time
**Do this instead:** Always pair `directory: 'public/images/X'` with `publicPath: '/images/X'`

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| SoundCloud | iframe embed via next/dynamic | Track ID stored in Keystatic |
| Spotify | iframe embed via next/dynamic | URI stored in Keystatic |
| Beatport | External link | URL stored in Keystatic |
| Instagram | Link in footer/nav | URL in siteConfig singleton |
| Merch store | External link | URL in siteConfig singleton |
| Email (Resend) | Server Action → Resend API | Free tier: 100 emails/day |

## Sources

- [Keystatic Installation for Next.js](https://keystatic.com/docs/installation-next-js)
- [Keystatic Reader API](https://keystatic.com/docs/reader-api)
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Next.js Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/)
- [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [next-on-pages deprecated](https://github.com/cloudflare/next-on-pages)

---
*Architecture research for: Marginalia music label website (Next.js + Keystatic + Cloudflare Workers)*
*Researched: 2026-04-04*
