# Phase 1 Research: Infrastructure & Schema Foundation

**Source:** Global project research (.planning/research/)
**Compiled:** 2026-04-16
**Confidence:** HIGH

> This file consolidates research most relevant to Phase 1. Full detail in `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`.

---

## Stack Decision (Final)

| Technology | Version | Role |
|------------|---------|------|
| Next.js | 15.x | App framework (App Router) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4.x | Styling — CSS-first, no tailwind.config.js |
| Keystatic | 0.5.x | CMS — local mode only in v1 |
| @opennextjs/cloudflare | latest | Cloudflare Workers adapter (replaces deprecated next-on-pages) |
| Wrangler | v3.x | Cloudflare CLI |

## Critical Phase 1 Pitfalls

### 1. Never use `output: 'export'`
Eliminates API routes. Keystatic admin requires API route handlers (`/api/keystatic/[...params]/route.ts`). Build fails silently or CMS is non-functional.

### 2. Image path pairing is mandatory
Every Keystatic image field MUST have both:
```typescript
fields.image({
  directory: 'public/images/releases',  // filesystem path
  publicPath: '/images/releases/',       // URL path (trailing slash required)
})
```
Mismatch = broken images in production with no build error.

### 3. Schema is immutable once content exists
Keystatic has no migration tooling. Changing schema after YAML files exist requires hand-editing every file. Design ALL fields upfront including optional ones you might need later.

### 4. Keystatic GitHub mode blocked
Issue #1497 (opened Jan 2026, unresolved): Keystatic OAuth fails on Cloudflare Workers. v1 workflow: local edit → git push → Workers rebuild.

### 5. Cloudflare Workers — NOT Vercel
Vercel Hobby prohibits commercial use. Cloudflare Workers free tier has no commercial restriction.

## Project Structure (from ARCHITECTURE.md)

```
marginalia/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/page.tsx
│   ├── releases/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── artists/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── podcasts/page.tsx
│   ├── press/page.tsx
│   ├── showcases/page.tsx
│   ├── merch/page.tsx
│   ├── demo/page.tsx
│   ├── subscribe/page.tsx
│   └── keystatic/
│       ├── layout.tsx
│       └── [[...params]]/page.tsx
├── app/api/keystatic/[...params]/route.ts
├── components/
│   ├── layout/ (Nav, Footer)
│   ├── releases/ (ReleaseCard, ReleaseGrid)
│   ├── artists/ (ArtistCard, ArtistGrid)
│   ├── embeds/ (SoundCloudEmbed, SpotifyEmbed — client-only)
│   └── forms/ (DemoForm, ContactForm)
├── lib/
│   ├── keystatic.ts    (reader instance)
│   └── actions.ts      (server actions)
├── content/            (Keystatic YAML files)
│   ├── releases/
│   ├── artists/
│   ├── podcasts/
│   ├── press/
│   ├── showcases/
│   └── site-config.yaml
├── public/images/
│   ├── releases/
│   ├── artists/
│   └── showcases/
├── keystatic.config.ts
├── next.config.ts
└── wrangler.jsonc
```

## Keystatic Route Setup Pattern

```typescript
// app/keystatic/layout.tsx
import { KeystaticApp } from './keystatic'
export default function Layout() {
  return <KeystaticApp />
}

// app/keystatic/[[...params]]/page.tsx — catch-all
// app/api/keystatic/[...params]/route.ts — API handler
```

These routes must use Node.js runtime, NOT edge. The Keystatic Reader API requires Node.js.

## Keystatic Config Pattern

```typescript
// keystatic.config.ts
import { config } from '@keystatic/core'

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: { owner: 'souchefsoul', name: 'MRGNL' },
          branchPrefix: 'keystatic/',
        }
      : { kind: 'local' },
  collections: { /* ... */ },
  singletons: { /* ... */ },
})
```

Note: GitHub mode will fail in production due to bug #1497. v1 uses local mode only. Keep the config pattern correct for future fix.

## Reader API Pattern

```typescript
// lib/keystatic.ts
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'
export const reader = createReader(process.cwd(), keystaticConfig)

// Usage in Server Component
const releases = await reader.collections.releases.all()
const homePage = await reader.singletons.homePage.read()
```

## Build Command for Cloudflare Workers

```bash
# Build pipeline
npx @opennextjs/cloudflare build

# Local Workers simulation
wrangler dev

# Deploy
wrangler deploy
```

## Validation Architecture

Phase 1 verification checks:
1. `npm run dev` starts without error
2. `http://localhost:3000/keystatic` shows CMS admin with all 5 collections + 2 singletons
3. Test image upload via CMS admin → file appears at `public/images/releases/` → renders at `/images/releases/[filename]`
4. `npx @opennextjs/cloudflare build` completes without error
5. `keystatic.config.ts` contains all required fields (catalog number, featured, all platform URLs)

---
*Phase 1 research compiled from: STACK.md, ARCHITECTURE.md, PITFALLS.md*
