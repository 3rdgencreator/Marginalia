# Stack Research

**Domain:** Music label website (Marginalia — Next.js App Router + Keystatic CMS)
**Researched:** 2026-04-04
**Confidence:** HIGH (core stack), MEDIUM (Cloudflare edge nuances)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x (latest: 15.5) | App framework | Stable App Router, React 19, server actions stable, ISR support. Next.js 16 is in early release — stay on 15.x for production. |
| TypeScript | 5.x | Type safety | Full support across Keystatic Reader API, Next.js config, and component props. Keystatic exports `Entry<>` generic for typed content. |
| Tailwind CSS | v4.x | Styling | CSS-first config (`@import "tailwindcss"`), no `tailwind.config.js` required. Container queries built-in — essential for responsive release artwork grids. Significantly faster incremental builds. |
| Keystatic CMS | latest (0.5.x) | Content management | Free, git-based, no external DB. Local mode for dev, GitHub mode for production. TypeScript-first Reader API for server components. |
| @opennextjs/cloudflare | latest | Cloudflare deployment adapter | **Replaces @cloudflare/next-on-pages** (now deprecated). Runs on Cloudflare Workers (not Pages), uses Node.js runtime, supports App Router, ISR, and image optimization. Official Cloudflare recommendation as of 2025. |
| Wrangler | v3.x | Cloudflare CLI | Required for local Workers dev and deployment. Config lives in `wrangler.jsonc`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | ^7.x | Client-side form state | Demo submission, contact, and newsletter forms. Use with `useActionState` for React 19 server action integration — do NOT use `onSubmit` prop for server actions; bind to `action` prop instead. |
| zod | ^3.x | Schema validation | Validate form payloads in server actions before any email or data operation. Always validate server-side; client validation is UX only. |
| resend | ^4.x | Transactional email | Free tier: 3,000 emails/month, 100/day. Use for demo submission confirmations and contact form replies. Import via `server-only` pattern — never expose API key to client. |
| react-lite-youtube-embed | ^2.x | YouTube facade | Renders a thumbnail; loads full iframe only on click. Reduces page weight by ~1.5MB per embed. Use `next/dynamic({ ssr: false })` to wrap. |
| server-only | latest | Enforce server boundary | Add to any module with API keys or Keystatic Reader API calls. Causes build error if accidentally imported into a client component. |
| sonner | ^1.x | Toast notifications | Lightweight toast for form success/error states. Works with React 19 server actions. |
| zod-form-data | ^2.x | FormData → Zod parsing | Parses `FormData` from server actions into typed Zod schemas cleanly. Eliminates manual `formData.get()` calls. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Wrangler CLI | Local Cloudflare Workers dev | `wrangler dev` for local simulation of the Workers runtime. Required to catch edge-specific issues before deploy. |
| `next build` + `open-next build` | Production build | Run `open-next build` (from `@opennextjs/cloudflare`) after `next build` to produce the Workers-compatible bundle at `.open-next/worker.js`. |
| ESLint + `eslint-config-next` | Linting | Comes with `create-next-app`. Keep it; it catches App Router misuse (e.g., async client components). |
| Prettier | Formatting | Add `prettier-plugin-tailwindcss` for automatic Tailwind class sorting. Required for Tailwind v4 class ordering consistency. |
| `@next/bundle-analyzer` | Bundle size auditing | Run when client JS bundle feels heavy. Use `ANALYZE=true npm run build`. |

---

## Hosting: Cloudflare Workers (not Pages)

**Critical decision:** Cloudflare Pages with `@cloudflare/next-on-pages` is **deprecated**. The correct 2025 approach is:

- **Use:** `@opennextjs/cloudflare` + **Cloudflare Workers**
- **Not:** `@cloudflare/next-on-pages` + Cloudflare Pages

**Why this matters for Marginalia:**
- Workers supports Node.js runtime → Keystatic Reader API works (it requires Node.js filesystem/network APIs)
- Workers supports image optimization → `next/image` works without Vercel
- Workers has no commercial use restriction on the free tier
- ISR (Incremental Static Regeneration) is supported — pages rebuild when content changes in GitHub

**wrangler.jsonc minimum config:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "marginalia-label",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-05-05",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

---

## Keystatic CMS: Mode Selection and Patterns

### Local Mode vs GitHub Mode

| Concern | Local Mode | GitHub Mode |
|---------|-----------|-------------|
| Development | Yes — reads/writes local filesystem directly | Possible but requires GitHub App setup |
| Production (Cloudflare Workers) | **No** — filesystem access not available | **Yes** — fetches via GitHub API |
| OAuth requirement | None | GitHub App with registered callback URL |
| Content editing | Via `/keystatic` admin UI on localhost | Via `/keystatic` admin UI on deployed domain |
| CI/CD | Changes committed to Git automatically | Changes committed to GitHub directly via API |

**Pattern:** Use local mode in `process.env.NODE_ENV === 'development'`, GitHub mode in production. Keystatic's official approach:

```typescript
// keystatic.config.ts
import { config } from '@keystatic/core';

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: { owner: 'your-org', name: 'marginalia' },
          branchPrefix: 'keystatic/',
        }
      : { kind: 'local' },
  // collections and singletons...
});
```

### Collections vs Singletons

**Collections** — for repeating content with multiple entries:
- `releases` — discography entries (artwork, metadata, embed links)
- `artists` — artist roster pages
- `podcasts` — mixes and podcast episodes
- `showcases` — events and live appearances
- `pressItems` — press coverage entries

**Singletons** — for one-off page configuration:
- `homePage` — hero content, featured release slugs, featured artist slugs
- `aboutPage` — ELIF's story, label philosophy
- `siteSettings` — global nav, footer, social links, label metadata

### Reader API in Server Components

The Keystatic Reader API is a Node.js API — use it only in Server Components or server actions, never in client components.

```typescript
// app/releases/page.tsx (Server Component — no "use client")
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';

const reader = createReader(process.cwd(), keystaticConfig);

export default async function ReleasesPage() {
  const releases = await reader.collections.releases.all();
  // releases is fully typed — TypeScript knows every field
  return <ReleaseCatalog releases={releases} />;
}
```

```typescript
// Reading a singleton
const homePage = await reader.singletons.homePage.read();
```

**The `Entry<>` type for component props:**
```typescript
import type { Entry } from '@keystatic/core/reader';
import type keystaticConfig from '@/keystatic.config';

type ReleaseEntry = Entry<typeof keystaticConfig.collections.releases>;

function ReleaseCard({ release }: { release: ReleaseEntry }) { ... }
```

### Keystatic + Cloudflare Workers: Known Issue

**GitHub issue #1497 (opened January 2026, unresolved):** Keystatic's GitHub OAuth flow fails on Cloudflare Pages because no OAuth state is generated — the crypto API behaves differently in the Workers runtime. This is separate from and in addition to the proxy header issue documented in PITFALLS.md.

**Current mitigation:** During development, the CMS admin runs on `localhost` in local mode — no OAuth needed. For production content editing, trigger CMS changes locally and push to GitHub, which triggers a Workers rebuild via Cloudflare's GitHub integration. Alternatively, edit YAML/JSON files directly in GitHub's web UI.

**Risk level:** MEDIUM — content management workflow is affected but the public site is fully functional. Monitor the Keystatic GitHub issues for a fix before Phase 1 is complete.

---

## Audio Embeds: Hydration-Safe Patterns

All embed components **must** use `next/dynamic` with `ssr: false`. This is non-negotiable for hydration safety.

### SoundCloud

```typescript
// components/embeds/SoundCloudEmbed.tsx
'use client';
import { useEffect, useRef } from 'react';

export function SoundCloudEmbed({ url }: { url: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="166"
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
      src={embedUrl}
      title="SoundCloud player"
    />
  );
}
```

```typescript
// Usage in a Server Component page
import dynamic from 'next/dynamic';

const SoundCloudEmbed = dynamic(
  () => import('@/components/embeds/SoundCloudEmbed').then(m => m.SoundCloudEmbed),
  { ssr: false, loading: () => <div className="h-[166px] bg-zinc-900 animate-pulse rounded" /> }
);
```

Do NOT use the SoundCloud Widget API script (`SC.Widget`). The plain iframe approach above is simpler, hydration-safe, and sufficient for a label site.

### Spotify

```typescript
// Simple iframe — do not use react-spotify-embed (unmaintained)
'use client';

export function SpotifyEmbed({ embedUrl }: { embedUrl: string }) {
  // embedUrl format: https://open.spotify.com/embed/album/...?utm_source=generator
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="352"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify player"
    />
  );
}
```

Wrap with `next/dynamic({ ssr: false })` at the usage site.

### YouTube (Mixes/Showcases)

```typescript
// Use react-lite-youtube-embed — renders thumbnail, loads iframe on click only
import dynamic from 'next/dynamic';

const LiteYouTubeEmbed = dynamic(
  () => import('react-lite-youtube-embed').then(m => m.default),
  { ssr: false }
);

// Import CSS once in root layout: import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';
```

This saves ~1.5MB of YouTube scripts per embed on initial page load.

---

## Image Optimization on Cloudflare Workers

With `@opennextjs/cloudflare`, `next/image` works out of the box — image optimization is handled by Cloudflare's built-in image transformation, not Vercel's infrastructure.

**Configuration in `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  images: {
    // Cloudflare handles optimization — no external loader needed with OpenNext
    // Restrict domains if loading images from external sources
    remotePatterns: [
      // Add if serving images from a CDN or external URL
    ],
  },
};
```

**For release artwork stored in the repo** (`public/images/releases/`):
- Store source artwork at max 1200×1200px, JPEG or WebP
- Use `next/image` with `sizes` prop for responsive loading
- Set `priority` only on the first visible image (hero, first release card)
- Keep individual files under 500KB — Git repo bloat becomes severe at 100+ releases

```typescript
// Release cover with correct sizing
<Image
  src={release.coverArt}
  alt={`${release.title} cover art`}
  width={600}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="aspect-square object-cover"
/>
```

---

## Form Handling: React Hook Form + Server Actions

### Pattern for Demo Submission and Contact Forms

The correct pattern for Next.js 15 + React 19 + React Hook Form with server actions:

```typescript
// app/demo/actions.ts
'use server';
import { z } from 'zod';

const DemoSchema = z.object({
  artistName: z.string().min(2).max(100),
  email: z.string().email(),
  soundcloudUrl: z.string().url().optional(),
  message: z.string().min(20).max(2000),
});

export type DemoFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitDemo(
  prevState: DemoFormState,
  formData: FormData
): Promise<DemoFormState> {
  const parsed = DemoSchema.safeParse({
    artistName: formData.get('artistName'),
    email: formData.get('email'),
    soundcloudUrl: formData.get('soundcloudUrl'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: 'Please fix the errors below.',
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  // Send confirmation email via Resend (server-only)
  // ...

  return { success: true, message: 'Demo received. We review submissions within 2–4 weeks.' };
}
```

```typescript
// components/DemoForm.tsx
'use client';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { submitDemo, type DemoFormState } from '@/app/demo/actions';

const initialState: DemoFormState = { success: false, message: '' };

export function DemoForm() {
  const [state, formAction, isPending] = useActionState(submitDemo, initialState);
  const { register, formState: { errors } } = useForm();

  return (
    <form action={formAction}>
      {/* fields using register() for client-side UX, action for server submission */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Submit Demo'}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

**Key points:**
- Use `action={formAction}` on `<form>`, not `onSubmit`
- `useActionState` is the React 19 API (replaces `useFormState` from react-dom)
- React Hook Form handles client-side UX (field registration, errors display)
- Server action handles validation and email sending

---

## Newsletter / Email: Recommended Services

### Recommendation: Resend (transactional) + Brevo (newsletter list)

**Do not try to handle both with one tool on a zero-budget project.**

| Need | Tool | Free Tier | Why |
|------|------|-----------|-----|
| Transactional email (form confirmations) | Resend | 3,000/month, 100/day | Clean DX, native React Email templates, server action integration in 5 lines |
| Newsletter / mailing list | Brevo | 300 emails/day, unlimited contacts | Free list management, signup API, campaign sends. No contact limits. |

**Resend setup (server action, transactional):**
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY); // never NEXT_PUBLIC_

await resend.emails.send({
  from: 'Marginalia <noreply@marginalialabel.com>',
  to: [submitterEmail],
  subject: 'Demo received — Marginalia',
  html: `<p>Thanks for your submission. We'll be in touch within 2–4 weeks.</p>`,
});
```

**Brevo newsletter signup (server action):**
```typescript
// Add contact to Brevo list via their API v3
const response = await fetch('https://api.brevo.com/v3/contacts', {
  method: 'POST',
  headers: {
    'api-key': process.env.BREVO_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    listIds: [parseInt(process.env.BREVO_LIST_ID!)],
    updateEnabled: true, // re-subscribes if previously unsubscribed
  }),
});
// Handle 201 (created), 204 (already exists), and error statuses
```

**What NOT to use for newsletter:**
- Mailchimp's embedded form HTML — conflicts with React hydration; use their API instead
- Resend alone for newsletter — it is transactional only, lacks list management and broadcast campaigns on the free tier

---

## TypeScript Patterns for Keystatic Content Types

### Keystatic Collection Definition with Full Types

```typescript
// keystatic.config.ts
import { config, collection, singleton, fields } from '@keystatic/core';

const releases = collection({
  label: 'Releases',
  slugField: 'title',
  path: 'content/releases/*',
  format: { data: 'yaml' },
  entryLayout: 'form',
  schema: {
    title: fields.slug({ name: { label: 'Title' } }),
    catalogNumber: fields.text({ label: 'Catalog Number' }), // e.g., MRGNL001
    releaseDate: fields.date({ label: 'Release Date' }),
    releaseType: fields.select({
      label: 'Release Type',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'EP', value: 'ep' },
        { label: 'LP', value: 'lp' },
        { label: 'Compilation', value: 'compilation' },
      ],
      defaultValue: 'single',
    }),
    artistSlugs: fields.array(
      fields.text({ label: 'Artist Slug' }),
      { label: 'Artists', itemLabel: props => props.value }
    ),
    coverArt: fields.image({
      label: 'Cover Art',
      directory: 'public/images/releases',
      publicPath: '/images/releases/',
    }),
    genres: fields.multiselect({
      label: 'Genres',
      options: [
        { label: 'Melodic House', value: 'melodic-house' },
        { label: 'Techno', value: 'techno' },
        { label: 'Indie Dance', value: 'indie-dance' },
        { label: 'Organic House', value: 'organic-house' },
      ],
    }),
    beatportUrl: fields.url({ label: 'Beatport URL' }),
    spotifyEmbedUrl: fields.url({ label: 'Spotify Embed URL' }),
    soundcloudUrl: fields.url({ label: 'SoundCloud URL' }),
    youtubeUrl: fields.url({ label: 'YouTube URL' }),
    featured: fields.checkbox({ label: 'Featured on Homepage', defaultValue: false }),
    description: fields.document({
      label: 'Description',
      formatting: true,
      links: true,
    }),
  },
});
```

### Entry Type Usage

```typescript
import type { Entry } from '@keystatic/core/reader';
import type keystaticConfig from '@/keystatic.config';

// Fully typed — TypeScript infers from your schema definition
export type Release = Entry<typeof keystaticConfig.collections.releases>;
export type Artist = Entry<typeof keystaticConfig.collections.artists>;
export type HomeSingleton = Entry<typeof keystaticConfig.singletons.homePage>;
```

---

## Tailwind CSS v4 Patterns for a Music/Artwork-Driven Site

### CSS-First Config (v4 approach)

In v4 there is no `tailwind.config.js`. All customization goes in the CSS entry file:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Label color tokens */
  --color-label-black: #0a0a0a;
  --color-label-white: #f5f5f0;
  --color-label-accent: #c8ff00; /* adjust to Marginalia brand */

  /* Typography scale */
  --font-display: 'Neue Haas Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Release grid */
  --spacing-gutter: 1.5rem;
}
```

### Release Artwork Grid Pattern

```html
<!-- Responsive artwork grid with container queries -->
<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
  <!-- Each card uses aspect-square to enforce square artwork -->
  <div class="group relative aspect-square overflow-hidden bg-zinc-900">
    <img class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" ... />
    <div class="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent 
                opacity-0 transition-opacity duration-200 group-hover:opacity-100 p-3">
      <span class="text-sm font-medium text-white">Release Title</span>
    </div>
  </div>
</div>
```

### Dark-First Design

Music label sites are universally dark. Set dark as the baseline, not an opt-in:

```css
/* app/globals.css — after @import "tailwindcss" */
:root {
  color-scheme: dark;
}

body {
  @apply bg-label-black text-label-white;
}
```

Do not use Tailwind's `dark:` variant system for a label site — you are not building a light/dark toggle. Define all colors as the dark palette from the start.

---

## Installation

```bash
# Create Next.js project
npx create-next-app@latest marginalia --typescript --tailwind --app --src-dir=false --import-alias="@/*"

# Core CMS
npm install @keystatic/core @keystatic/next

# Cloudflare deployment
npm install @opennextjs/cloudflare
npm install -D wrangler

# Form handling
npm install react-hook-form zod zod-form-data

# Email
npm install resend

# UI / embeds
npm install react-lite-youtube-embed sonner

# Server boundary enforcement
npm install server-only

# Dev tooling
npm install -D prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| @opennextjs/cloudflare | @cloudflare/next-on-pages | Deprecated — Edge runtime only, no Node.js APIs, no image optimization |
| @opennextjs/cloudflare | Netlify | Netlify's free tier does allow commercial use but Next.js 15 App Router support lags; Workers is better for this stack |
| Keystatic GitHub mode | Sanity, Contentful | Paid at scale; external service; Keystatic is git-native and free |
| Tailwind v4 | Tailwind v3 | v3 is in maintenance mode; v4 is stable and the direction of the ecosystem |
| Resend | Nodemailer + Gmail SMTP | Gmail SMTP has strict rate limits and authentication friction; Resend is built for Next.js server actions |
| Brevo | Mailchimp (embedded form) | Mailchimp's embedded form HTML conflicts with React hydration; Brevo provides a clean API |
| react-lite-youtube-embed | Full YouTube iframe | Full iframe loads 1.5MB of scripts per embed on page load; facade loads only on click |
| Zod | yup, joi | Zod is TypeScript-first, tree-shakeable, and best integrated with react-hook-form and `safeParse` in server actions |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@cloudflare/next-on-pages` | Deprecated; Edge runtime only; no Node.js APIs; breaks Keystatic Reader API | `@opennextjs/cloudflare` |
| `output: 'export'` in `next.config.ts` | Eliminates API routes; Keystatic admin UI and server actions become non-functional | No static export; use ISR for public pages |
| `react-spotify-embed` | Unmaintained; last release years old | Plain iframe with official Spotify embed URL, wrapped in `dynamic({ ssr: false })` |
| Mailchimp embedded form HTML | Injects third-party scripts that conflict with React hydration; form state unmanageable | Mailchimp API via server action, or switch to Brevo |
| `"use client"` on page-level components | Entire page tree becomes client-rendered; loses SSR, SEO benefits, and streaming | Islands pattern: Server Component pages with `"use client"` only on interactive leaf components |
| SoundCloud Widget API (`SC.Widget`) | Requires global script; hard to control lifecycle; unnecessary complexity | Plain SoundCloud iframe embed URL |
| `react-spotify-embed` | Unmaintained package | Direct iframe with Spotify embed URL |
| `getServerSideProps` / Pages Router patterns | Does not exist in App Router | `async` Server Components + `generateStaticParams` for static, or server actions for mutations |
| Vercel (any tier) for production | Hobby: commercial use prohibited; Pro: $20/month — outside budget constraint | Cloudflare Workers free tier (no commercial restriction) |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @keystatic/core 0.5.x | Next.js 14–15.x | Do not use Next.js 16 until Keystatic confirms compatibility |
| @opennextjs/cloudflare latest | Next.js 14.x, 15.x (all minors) | Next.js 16 support is documented; confirm before upgrading |
| react-hook-form ^7.x | React 19, Next.js 15 | Use `useActionState` (React 19 API) with `action=` prop on forms — not `onSubmit` |
| Tailwind v4.x | Next.js 15 | CSS-first config requires PostCSS plugin or Vite plugin; Next.js uses PostCSS by default |
| zod ^3.x | react-hook-form ^7.x | Use `@hookform/resolvers/zod` for client-side validation; use `zod.safeParse()` independently in server actions |

---

## Sources

- [OpenNext Cloudflare](https://opennext.js.org/cloudflare) — Official OpenNext Cloudflare adapter docs; confirmed @opennextjs/cloudflare is the recommended approach
- [Cloudflare Workers Next.js docs](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) — Confirmed @cloudflare/next-on-pages is deprecated; Workers + OpenNext is the official path
- [Cloudflare blog: Deploying Next.js to Workers with OpenNext](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/) — Official announcement
- [Keystatic installation: Next.js](https://keystatic.com/docs/installation-next-js) — API route requirements, Node.js runtime dependency
- [Keystatic GitHub mode docs](https://keystatic.com/docs/github-mode) — OAuth setup, environment variables
- [Keystatic Reader API docs](https://keystatic.com/docs/reader-api) — Server component patterns, Entry<> type
- [Keystatic issue #1497](https://github.com/Thinkmill/keystatic/issues/1497) — Cloudflare Pages OAuth state bug (opened January 2026, unresolved) — MEDIUM risk
- [Keystatic issue #1229](https://github.com/Thinkmill/keystatic/issues/1229) — Environment variable issues with Cloudflare deployments
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, `@theme`, no tailwind.config.js
- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) — Stable server actions, Turbopack builds beta, current stable version
- [React Hook Form + Next.js 15 patterns](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) — useActionState integration
- [Resend pricing / free tier](https://resend.com/pricing) — 3,000 emails/month, 100/day confirmed
- [Brevo newsletter API](https://medium.com/@guptagunal/power-up-your-next-js-newsletter-with-brevos-api-2cda549e88b5) — Contact list API, free tier
- [react-lite-youtube-embed](https://github.com/ibrahimcesar/react-lite-youtube-embed) — Facade pattern, React component
- [OpenNext image optimization](https://opennext.js.org/cloudflare/howtos/image) — next/image works on Cloudflare Workers via OpenNext

---
*Stack research for: Marginalia — Music Label Website*
*Researched: 2026-04-04*
