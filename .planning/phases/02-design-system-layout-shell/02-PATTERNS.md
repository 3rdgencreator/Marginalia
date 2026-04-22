# Phase 2: Design System & Layout Shell — Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 10 (2 MODIFY, 7 CREATE, 1 directory)
**Analogs found:** 3 / 10 — codebase is pre-component (Phase 2 creates `components/` tree from scratch)
**Consequence:** Most new components have NO closest analog inside this repo. Planner should rely on the Pattern 1-5 code examples in `02-RESEARCH.md` and the UI-SPEC token block for concrete code, not on existing files. The three files that DO have analogs (`globals.css`, `app/layout.tsx`, inline SVG asset convention) are the only pattern-lifts available.

---

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `app/globals.css` | MODIFY (full replace) | config (design tokens + base CSS) | static CSS | `app/globals.css` (current create-next-app defaults) | structural-only (same file, different content) |
| `app/layout.tsx` | MODIFY | layout (Server Component, metadata + HTML shell) | request-response (SSR composition) | `app/layout.tsx` (current Geist-font version) | role-match (same file, swap font mechanism + wrap with shell) |
| `public/fonts/` | CREATE (directory) | static assets | file-I/O (CDN/Workers serves) | `public/` root (existing SVG assets) | convention-only (sibling directory pattern) |
| `components/layout/SiteNav.tsx` | CREATE | layout/shell (Server Component) | request-response (SSR composition of client islands) | none in this repo | NO ANALOG — use RESEARCH Pattern 3 |
| `components/layout/NavLinks.tsx` | CREATE | interactive (Client Component — `usePathname`) | request-response (hydration island) | `app/keystatic/keystatic-app.tsx` (only other `"use client"` file in repo) | partial (shows `"use client"` directive pattern + `@/...` import convention) |
| `components/layout/MobileMenu.tsx` | CREATE | interactive (Client Component — `useState`) | event-driven (open/close, escape-key, pathname-change) | `app/keystatic/keystatic-app.tsx` (only other `"use client"` file) | partial (directive only — no `useState`/`useEffect` analog exists) |
| `components/layout/SiteFooter.tsx` | CREATE | layout/shell (async Server Component, reads CMS) | request-response + file-I/O (reads `content/site-config.yaml` via Keystatic Reader) | `lib/keystatic.ts` (reader instance only; no async consumer of it yet) | role-match for the import/use pattern (there is no prior consumer component) |
| `components/layout/Container.tsx` | CREATE | layout primitive (Server Component, no data) | pure render | none — no layout primitives exist yet | NO ANALOG — trivial wrapper, use RESEARCH Pattern 5 |
| `components/ui/SocialIcon.tsx` | CREATE | UI primitive (Server Component, inline SVG + conditional render) | pure render | `public/next.svg` (inline-style SVG asset, but file-based not component-based) | weak (inline SVG convention only — no React SVG component analog) |
| `components/ui/Logo.tsx` | CREATE | UI primitive (Server Component, inline SVG) | pure render | `public/next.svg` (single `<svg>` shape + paths) | weak (asset-level SVG pattern only — no component analog) |

---

## Pattern Assignments

### 1. `app/globals.css` (MODIFY — design tokens + base CSS + @font-face)

**Role:** Global CSS — Tailwind v4 `@theme {}` tokens, `@font-face` declarations, base element styles.
**Data flow:** Static CSS compiled by Tailwind v4 PostCSS plugin (see `postcss.config.mjs`).
**Analog:** `app/globals.css` (existing file — create-next-app scaffold).

**What to keep from the analog** (lines 1, 1-13 of existing file):

```css
/* app/globals.css line 1 — KEEP */
@import "tailwindcss";
```

The `@import "tailwindcss"` directive is already correct — this is the Tailwind v4 CSS-first entrypoint that loads preflight and enables `@theme {}`. Keep it as line 1 of the new file.

**What to fully replace** (lines 3-26 of existing file):

```css
/* DELETE — create-next-app scaffold, incompatible with Marginalia brand */
:root {
  --background: #ffffff;
  --foreground: #171717;
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
@media (prefers-color-scheme: dark) { ... }
body { font-family: Arial, Helvetica, sans-serif; }
```

**Replacement content — authoritative source:**
- `02-UI-SPEC.md` lines 278-382 — complete `@theme {}` block (verbatim)
- `02-RESEARCH.md` Pattern 2 (lines 263-294) — `@font-face` Nimbus Sans block
- `02-RESEARCH.md` Pattern 1 (lines 221-256) — namespace rules (`--color-*`, `--font-*`, `--text-*`, `--breakpoint-*` map to utilities; `--space-*` do NOT auto-generate utilities and must be consumed via `var(--space-md)` or Tailwind default `p-4` equivalences)
- `02-RESEARCH.md` Pitfall #2 (lines 548-570) — **amend** `body { overflow-x: hidden }` → `overflow-x: clip` with `@supports not (overflow-x: clip)` fallback to `hidden`. This is research-surfaced and planner-approved per Open Question #2.

**Concrete file structure (recommended order):**

```css
@import "tailwindcss";

/* ─── @font-face (Nimbus Sans, 2 weights) ─── */
/* UI-SPEC lines 282-295 — COPY VERBATIM, D-09 forbids modification */

/* ─── @theme {} (tokens) ─── */
/* UI-SPEC lines 298-355 — COPY VERBATIM */

/* ─── Base element styles ─── */
/* UI-SPEC lines 357-375 — COPY with one amendment (Pitfall #2): */
/*   body { overflow-x: clip; } + @supports fallback */

/* ─── Focus ─── */
/* UI-SPEC lines 377-381 — COPY VERBATIM */
```

---

### 2. `app/layout.tsx` (MODIFY — swap Geist→Nimbus mechanism, wrap with nav/footer)

**Role:** Root layout Server Component — HTML shell, `<head>` metadata, global provider slots.
**Data flow:** Request-response (SSR composition; renders `<SiteNav />` + `<main>{children}</main>` + `<SiteFooter />`).
**Analog:** `app/layout.tsx` (the existing file itself — we are editing it).

**Current file excerpt (to be REMOVED):**

```tsx
// app/layout.tsx lines 2, 5-13, 28 — DELETE all Geist references
import { Geist, Geist_Mono } from "next/font/google";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// ...
<html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

**What to KEEP from existing file:**

```tsx
// app/layout.tsx line 1 — KEEP (Metadata import)
import type { Metadata } from "next";

// app/layout.tsx line 3 — KEEP (globals.css import path + position)
import "./globals.css";

// app/layout.tsx lines 20-24 — KEEP (function signature + Readonly<{children}> prop typing)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

// app/layout.tsx line 30 — KEEP the base body classes pattern (flex-col, min-h-full)
<body className="min-h-full flex flex-col">{children}</body>
```

**What to UPDATE** (metadata title/description + html className + body children):

```tsx
// New metadata — replace lines 15-18
export const metadata: Metadata = {
  title: 'Marginalia — Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
};

// New html — replace line 26-29 (Geist font variables no longer needed; font-family
// comes from globals.css html { font-family: var(--font-sans) })
<html lang="en" className="h-full antialiased">

// New body — wrap children with SiteNav / <main> / SiteFooter (per DSYS-05)
<body className="min-h-full flex flex-col font-sans text-[--color-text-primary]">
  <SiteNav />
  <main className="flex-1">{children}</main>
  <SiteFooter />
</body>
```

**Imports to ADD** (use `@/...` path alias — confirmed in `tsconfig.json` line 22: `"@/*": ["./*"]`):

```tsx
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
```

**Optional additive pattern** (RESEARCH Open Question #3, planner-recommended YES):

```tsx
// Add <head> with font preload tags — recaptures most of next/font's LCP benefit
<head>
  <link rel="preload" href="/fonts/NimbusSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" href="/fonts/NimbusSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
</head>
```

**Full target file shape:** See `02-RESEARCH.md` "Code Examples → app/layout.tsx (updated)" lines 745-775.

---

### 3. `public/fonts/` (CREATE — directory)

**Role:** Static font asset directory.
**Data flow:** Served by Workers via OpenNext assets binding (woff2 → `/fonts/NimbusSans-*.woff2`).
**Analog:** `public/` (existing directory hosts SVG assets: `next.svg`, `vercel.svg`, `globe.svg`, `file.svg`, `window.svg`, `images/`).

**Convention lift:** `public/` is the Next.js static root; anything inside is served at the URL path stripped of `public/`. `public/images/releases/` is already used by Keystatic (`keystatic.config.ts` lines 47-48: `directory: 'public/images/releases'`, `publicPath: '/images/releases/'`). Same rule: `public/fonts/X.woff2` → `/fonts/X.woff2`.

**Action for executor:**
1. Create directory `public/fonts/` (empty is fine — user places files manually per D-07).
2. Pre-flight check (D-08): if `public/fonts/NimbusSans-Regular.woff2` OR `public/fonts/NimbusSans-Bold.woff2` is missing, emit a non-blocking warning in the acceptance criteria. Do NOT fail the build — `font-display: swap` ensures fallback rendering.
3. Do NOT commit placeholder woff2 files. Directory may be empty at commit time.

**No React/TS pattern to lift** — this is a filesystem action.

---

### 4. `components/layout/SiteNav.tsx` (CREATE — Server Component shell)

**Role:** Navigation shell — brand logo + primary links + mobile menu toggle. Sticky top.
**Data flow:** Request-response. Renders static HTML on the server; embeds two client islands (`<NavLinks />`, `<MobileMenu />`).

**Analog:** **NONE exists in the codebase.** No `components/` directory yet, no prior layout shell. `app/layout.tsx` is the closest file by role (it is the only Server Component that composes layout), but it does not exemplify a nav pattern.

**Authoritative pattern source:** `02-RESEARCH.md` Pattern 3 (lines 297-342) — includes the `PRIMARY_LINKS` constant, `<header>` with sticky positioning, and Container + NavLinks + MobileMenu composition.

**Key rules to copy from RESEARCH:**

```tsx
// components/layout/SiteNav.tsx — NO "use client" directive (D-05/D-06)
// Imports via @/... alias (confirmed tsconfig.json line 22)
import Logo from '@/components/ui/Logo';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';
import Container from './Container';

// PRIMARY_LINKS array: 10 entries covering all v1 routes (RESEARCH Pattern 3 lines 311-322).
// Routes that don't exist yet in Phase 2 still go here — pages are built Phase 3-5.

// Header shell uses:
// - className="sticky top-0 z-50 bg-[--color-surface]"  (UI-SPEC: sticky, z-index above content)
// - height via CSS variable: h-[var(--nav-height-mobile)] md:h-[var(--nav-height-desktop)]
//   (UI-SPEC lines 353-354 declared these variables)
// - aria-label="Main navigation"  (a11y)
```

**Token references:**
- `--color-surface` (UI-SPEC line 301) — nav background `#2A2A2C`
- `--nav-height-mobile` (56px) and `--nav-height-desktop` (64px) — UI-SPEC lines 353-354
- `--color-text-primary` — logo + link color

**Link prop shape (readonly, typed inline — no separate types file in Phase 2):**

```tsx
const PRIMARY_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/releases', label: 'Releases' },
  { href: '/free-downloads', label: 'Free Downloads' },
  { href: '/merch', label: 'Merch' },
  { href: '/podcasts', label: 'Podcasts' },
  { href: '/showcases', label: 'Showcases' },
  { href: '/demo', label: 'Demo Submission' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/press', label: 'Press' },
] as const;
```

---

### 5. `components/layout/NavLinks.tsx` (CREATE — Client Component, usePathname)

**Role:** Primary desktop link list with active-state indicator.
**Data flow:** Hydration island — reads `usePathname()` on the client, applies lime border to matching link.

**Analog:** `app/keystatic/keystatic-app.tsx` (only other `"use client"` file in the repo).

**What to lift from the analog:**

```tsx
// app/keystatic/keystatic-app.tsx lines 1-6 — "use client" directive convention + default export
'use client';

import { makePage } from '@keystatic/next/ui/app';
import keystaticConfig from '../../keystatic.config';

export default makePage(keystaticConfig);
```

**Patterns confirmed by this analog:**
1. `'use client'` directive goes on line 1 (single-quoted, semicolon-terminated — project convention).
2. Imports follow immediately after the directive.
3. `default` export is used (no named exports).
4. Relative imports use `../` (but in Phase 2, for `components/layout/*`, prefer the `@/components/...` alias per `tsconfig.json` line 22).

**Authoritative pattern source:** `02-RESEARCH.md` Pattern 3 lines 344-382 — includes full `NavLinks` implementation with `usePathname`, active detection (`pathname === href || (href !== '/' && pathname.startsWith(href))`), `aria-current="page"` for a11y (Pitfall #8), and the `border-b-2 border-[--color-accent-lime]` active style.

**Hook import:**

```tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';
```

**Prop contract (typed inline):**

```tsx
type NavLink = { href: string; label: string };
export default function NavLinks({
  links,
  className = '',
}: {
  links: readonly NavLink[];
  className?: string;
}) { ... }
```

**Active detection logic (copy verbatim from RESEARCH line 364):**

```tsx
const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
```

**Active style (copy from RESEARCH line 369):**

```tsx
className={`text-label text-[--color-text-primary] hover:text-[--color-surface-purple] transition-colors duration-150 py-2 ${
  isActive ? 'border-b-2 border-[--color-accent-lime]' : ''
}`}
aria-current={isActive ? 'page' : undefined}
```

---

### 6. `components/layout/MobileMenu.tsx` (CREATE — Client Component, useState + overlay)

**Role:** Hamburger-triggered fullscreen nav overlay for screens <md.
**Data flow:** Event-driven — manages `open`/`closed` via `useState`, closes on pathname change, closes on Escape key, locks body scroll when open.

**Analog:** `app/keystatic/keystatic-app.tsx` — same `"use client"` directive pattern (see §5). No `useState`/`useEffect`/keyboard-handler analog exists anywhere in the repo.

**Authoritative pattern source:** `02-RESEARCH.md` "MobileMenu skeleton" lines 781-863 — includes:
- `useState` for open toggle
- `useEffect` to close on pathname change (line 801)
- `useEffect` to lock body scroll when open (lines 804-807)
- `useEffect` to close on Escape (lines 810-815)
- `<button aria-expanded aria-controls aria-label>` for hamburger toggle
- `<div role="dialog" aria-modal="true" aria-hidden={!open}>` for overlay with 200ms ease-in-out transition (D-01 in UI-SPEC's animation spec)

**Critical a11y + UX rules (from UI-SPEC + RESEARCH):**

```tsx
// Hamburger button — 24x24 icon, swap 3-line/X on open state
<button
  type="button"
  onClick={() => setOpen(o => !o)}
  aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
  aria-expanded={open}
  aria-controls="mobile-nav-overlay"
  className="p-3 text-[--color-text-primary]"  // p-3 = 12px padding → 48px touch target on 24px icon
>

// Overlay: inset-0 fixed, z-40 (below sticky nav z-50), 200ms ease-in-out (per UI-SPEC)
<div
  id="mobile-nav-overlay"
  role="dialog"
  aria-modal="true"
  aria-hidden={!open}
  className={`fixed inset-0 z-40 bg-[--color-bg] transition-all duration-200 ease-in-out ${
    open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
  }`}
>
```

**Body scroll lock pattern (RESEARCH lines 804-807):**

```tsx
useEffect(() => {
  document.body.style.overflow = open ? 'hidden' : '';
  return () => { document.body.style.overflow = ''; };
}, [open]);
```

**Escape-to-close (RESEARCH lines 810-815):**

```tsx
useEffect(() => {
  if (!open) return;
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [open]);
```

---

### 7. `components/layout/SiteFooter.tsx` (CREATE — async Server Component reading siteConfig)

**Role:** Footer shell — brand column, quick links column, social + Incubation column, copyright row.
**Data flow:** Request-response + file-I/O. `async` function awaits `reader.singletons.siteConfig.read()` → parses YAML at request time.

**Analog:** `lib/keystatic.ts` (the reader instance itself — Phase 1 output). No prior consumer component exists.

**What to lift from the analog** (`lib/keystatic.ts` lines 1-4 — the full file):

```tsx
// lib/keystatic.ts — existing Phase 1 file, total 4 lines
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../keystatic.config';

export const reader = createReader(process.cwd(), keystaticConfig);
```

**Pattern confirmed:**
1. Reader is a singleton module export (no factory re-call needed).
2. Import path from any file under `components/`, `app/`: use `@/lib/keystatic` (matches `tsconfig.json` paths).
3. The reader is a server-only module — safe to import in async Server Components; MUST NOT be imported in `"use client"` files.

**Singleton schema (from `keystatic.config.ts` lines 301-330):**

```tsx
// siteConfig fields available to SiteFooter:
siteConfig: singleton({
  label: 'Site Config',
  path: 'content/site-config',
  format: { data: 'yaml' },
  schema: {
    siteName: fields.text({ label: 'Site Name', defaultValue: 'Marginalia' }),
    tagline: fields.text({ label: 'Tagline' }),
    instagramUrl: fields.url({ label: 'Instagram URL' }),
    soundcloudUrl: fields.url({ label: 'SoundCloud URL' }),
    beatportUrl: fields.url({ label: 'Beatport URL' }),
    youtubeUrl: fields.url({ label: 'YouTube URL' }),
    tiktokUrl: fields.url({ label: 'TikTok URL' }),
    facebookUrl: fields.url({ label: 'Facebook URL' }),
    merchUrl: fields.url({ label: 'Merch Store URL' }),
    demoEmail: fields.text({ label: 'Demo Submission Email' }),
    newsletterProvider: fields.text({ label: 'Newsletter Provider ID' }),
  },
}),
```

**Authoritative pattern source:** `02-RESEARCH.md` Pattern 4 (lines 389-458) — complete async Server Component consuming `reader.singletons.siteConfig`.

**CRITICAL — research-surfaced amendment to D-14 (`02-RESEARCH.md` lines 62, 461, Pitfall #3 lines 572-580, Open Question #1):**

D-14 specifies `readOrThrow()`. At mapping time, `content/site-config.yaml` does NOT exist (verified — only `content/releases/`, `content/artists/`, `content/podcasts/`, `content/press/`, `content/showcases/` directories exist; no siteConfig YAML). Calling `readOrThrow()` in the root layout's footer crashes every route until the YAML is seeded via `/keystatic`.

**Planner decision required.** Two options:
- **Option (a) — research-recommended:** Use `reader.singletons.siteConfig.read()` (returns `null` when missing) + hardcoded fallback (`tagline: "Barcelona · Melodic House & Techno"`, empty social URLs → `SocialIcon` renders null per D-12). This is robust and requires no manual seeding.
- **Option (b):** Keep `readOrThrow()` as D-14 specifies + pre-flight acceptance-criteria item: user opens `/keystatic`, saves the siteConfig singleton once before `npm run dev`.

**If option (a):**

```tsx
// components/layout/SiteFooter.tsx  (async Server Component — NO "use client")
import { reader } from '@/lib/keystatic';
import Container from './Container';
import SocialIcon from '@/components/ui/SocialIcon';
import Logo from '@/components/ui/Logo';

const FALLBACK_TAGLINE = 'Barcelona · Melodic House & Techno';

export default async function SiteFooter() {
  // read() (not readOrThrow) — site-config.yaml may not exist yet on first run
  const config = await reader.singletons.siteConfig.read();
  const tagline = config?.tagline || FALLBACK_TAGLINE;
  const socials = [
    { platform: 'instagram' as const, url: config?.instagramUrl },
    { platform: 'soundcloud' as const, url: config?.soundcloudUrl },
    { platform: 'beatport' as const, url: config?.beatportUrl },
    { platform: 'youtube' as const, url: config?.youtubeUrl },
    { platform: 'tiktok' as const, url: config?.tiktokUrl },
    { platform: 'facebook' as const, url: config?.facebookUrl },
  ];
  const year = new Date().getFullYear(); // Server-computed — no hydration mismatch (Pitfall #4)
  // ... render grid-cols-3 layout per UI-SPEC ...
}
```

**Three-column footer layout (UI-SPEC):**
- Column 1: `<Logo />` + tagline
- Column 2: Quick Links (Releases, Artists, Podcasts, Press, Showcases, About) — real anchors
- Column 3: Social icons row + Incubation group (Management, Mix & Mastering, Production Classes, Mentoring) as `<span aria-disabled="true" class="cursor-not-allowed opacity-40">` per Open Question #4 recommendation

**Copyright row:** `© {year} Marginalia. All rights reserved.` — uses `border-t border-white/8 mt-12 pt-8` divider.

---

### 8. `components/layout/Container.tsx` (CREATE — max-width wrapper)

**Role:** Pure layout primitive — caps width at 1280px, applies responsive horizontal padding.
**Data flow:** Pure render (no data, no state).

**Analog:** **NONE.** No layout primitives exist. This is a trivial utility component.

**Authoritative pattern source:** `02-RESEARCH.md` Pattern 5 (lines 463-485). Copy verbatim:

```tsx
// components/layout/Container.tsx  (Server Component — NO "use client")
export default function Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-5 md:px-8 ${className}`}>
      {children}
    </div>
  );
}
```

**Token alignment:**
- `max-w-[1280px]` matches UI-SPEC's `--max-width-content: 1280px` (line 352). Using arbitrary value here is fine — no need to reference the CSS variable because it's a one-off constant. (If you want DRY: `max-w-[var(--max-width-content)]`.)
- `px-5` = 20px (UI-SPEC mobile edge comfort, line 54)
- `md:px-8` = 32px (UI-SPEC `--space-xl` desktop padding)

**Prop contract:** Accept `children` (required) + `className` (optional, appended). NO other props in Phase 2.

---

### 9. `components/ui/SocialIcon.tsx` (CREATE — inline Simple Icons path per platform)

**Role:** UI primitive — inline-SVG anchor with 44×44 touch target. Renders `null` if URL absent (D-12).
**Data flow:** Pure render (no data fetching, no state).

**Analog:** `public/next.svg` (existing file) — shows the project's SVG source convention (single `<svg>` with viewBox + `<path d="...">`), but as a standalone asset file, not a React component. There is no React SVG-component analog in the codebase.

**What to lift from `public/next.svg`:**

```svg
<!-- public/next.svg — single-line inline SVG, fill colors explicit -->
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 394 80">
  <path fill="#000" d="..." />
</svg>
```

**Convention confirmed:**
- `viewBox` is set on the `<svg>` root — for Simple Icons use `viewBox="0 0 24 24"` (D-10, RESEARCH line 42).
- Paths use the standard SVG `d` attribute — no exotic transforms.
- No `xmlns` attribute needed inside JSX (React adds it automatically for SVG elements).

**Authoritative pattern source:** `02-RESEARCH.md` Pitfall #7 (lines 625-681) — full component implementation.

**Required structure:**

```tsx
// components/ui/SocialIcon.tsx  (Server Component — NO "use client")
// Source: simple-icons CC0 license; copy full inner SVG contents (all <path> elements)
// from https://github.com/simple-icons/simple-icons/tree/develop/icons per platform

type Platform = 'instagram' | 'soundcloud' | 'beatport' | 'youtube' | 'tiktok' | 'facebook';

const ICON_PATHS: Record<Platform, string> = {
  instagram: '...', // full path string
  soundcloud: '...',
  beatport: '...',
  youtube: '...',
  tiktok: '...',
  facebook: '...',
};

const LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  soundcloud: 'SoundCloud',
  beatport: 'Beatport',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

export default function SocialIcon({
  platform,
  url,
}: {
  platform: Platform;
  url: string | null | undefined;
}) {
  if (!url) return null;  // D-12: render null when URL empty/undefined
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"  // Security: ASVS V14, prevents tabnabbing
      aria-label={`${LABELS[platform]} — Marginalia`}
      className="inline-flex items-center justify-center p-3 text-[--color-text-secondary] hover:text-[--color-accent-lime] transition-colors"
      // p-3 = 12px on 20×20 icon = 44×44 total touch target (D-13, WCAG 2.5.5 AAA)
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={ICON_PATHS[platform]} />
      </svg>
    </a>
  );
}
```

**Pitfall guard (RESEARCH Pitfall #7):** If a brand has multi-path SVG (e.g., SoundCloud's cloud + bars are separate paths), store the FULL inner SVG contents or change the render to `<g dangerouslySetInnerHTML>` — but for Phase 2, all six Simple Icons brands verified to be single-path compatible; ICON_PATHS values are strings.

**Touch target math (D-13):** 20px icon + `p-3` (12px each side) = 44px total hit area via padding on the `<a>`, NOT by scaling the SVG. Do NOT change `width="20" height="20"` to fill the touch target.

---

### 10. `components/ui/Logo.tsx` (CREATE — inline SVG from client file)

**Role:** UI primitive — renders the Marginalia brand logo as inline SVG. Used by `SiteNav` (h-8) and `SiteFooter` (h-10).
**Data flow:** Pure render.

**Analog:** `public/next.svg` (same convention as SocialIcon — asset-level inline SVG). Existing file shows: `<svg xmlns="..." fill="none" viewBox="0 0 394 80"><path fill="#000" d="..."/></svg>`.

**D-01/D-03 gate:** The real logo SVG file has NOT been provided yet. Executor receives `public/logo.svg` at start of execution shift.

**Pattern for the component body:**

```tsx
// components/ui/Logo.tsx  (Server Component — NO "use client")
// Source: Marginalia brand asset (public/logo.svg, provided by client)
// Color controlled via currentColor — parent sets text-[--color-text-primary] etc.

export default function Logo({
  className = '',
  'aria-label': ariaLabel = 'Marginalia',
}: {
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 XXX YYY"  // FROM public/logo.svg provided file
      fill="currentColor"    // D-02: color via currentColor so hover states work
      role="img"
      aria-label={ariaLabel}
    >
      {/* <path d="..."/> — copy from client's logo.svg */}
    </svg>
  );
}
```

**Fallback if logo file not yet provided at execution time (from RESEARCH Runtime State Inventory):**

```tsx
// Wordmark fallback — render the word "Marginalia" in Nimbus Sans Bold
// until public/logo.svg arrives. TODO comment flags for removal.
export default function Logo({ className = '' }: { className?: string }) {
  // TODO: Replace with inline SVG from public/logo.svg when client file arrives
  return (
    <span className={`font-sans font-bold text-[--color-text-primary] ${className}`}>
      Marginalia
    </span>
  );
}
```

**Sizing pattern (used in consumers, not here):**
- SiteNav uses `<Logo className="h-8 w-auto text-[--color-text-primary]" />` (32px height)
- SiteFooter uses `<Logo className="h-10 w-auto text-[--color-text-primary]" />` (40px height)

**`currentColor` rule (D-02):** All `fill` / `stroke` on `<path>` elements must be `"currentColor"` so the parent's text color cascades. Do NOT hardcode `fill="#FFFFFF"` or similar.

---

## Shared Patterns

### Shared Pattern 1: `"use client"` Directive Placement

**Source:** `app/keystatic/keystatic-app.tsx` line 1 (only existing example in repo).
**Apply to:** `NavLinks.tsx`, `MobileMenu.tsx` (and NO other file in Phase 2 per D-06).

```tsx
'use client';

import { ... } from '...';
```

**Rules:**
- Single-quoted, semicolon-terminated (project style).
- MUST be the literal first line of the file (no comments above it, no blank line above it).
- Follow immediately with imports.
- NEVER add `"use client"` to `SiteNav.tsx`, `SiteFooter.tsx`, `Container.tsx`, `Logo.tsx`, `SocialIcon.tsx`, `app/layout.tsx`, or `app/page.tsx` (STATE.md rule: leaf-only boundary).

**Anti-pattern to avoid (RESEARCH line 489):** `"use client"` on `SiteNav` or `app/layout.tsx` forces the entire tree client-rendered, killing SSR benefits.

---

### Shared Pattern 2: Import Path Convention

**Source:** `tsconfig.json` line 22 (`"@/*": ["./*"]`) + `app/keystatic/keystatic-app.tsx` line 4 (uses relative `../../` — this is pre-Phase-2 scaffold convention).

**Apply to:** All files under `components/`, `app/`, `lib/` created in Phase 2.

```tsx
// PREFERRED for cross-tree imports (Phase 2 convention):
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { reader } from '@/lib/keystatic';
import Logo from '@/components/ui/Logo';
import SocialIcon from '@/components/ui/SocialIcon';

// ACCEPTABLE for sibling imports within the same directory:
// (inside components/layout/SiteNav.tsx)
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';
import Container from './Container';
```

**Rule:** Cross-tree imports use `@/...`; sibling-directory imports use `./`. This matches Next.js App Router ecosystem norms and is already enabled in `tsconfig.json`.

---

### Shared Pattern 3: Tailwind v4 Token Access

**Source:** `02-RESEARCH.md` Pattern 1 (lines 221-256) + `app/globals.css` (after Phase 2 rewrite).

**Apply to:** All components in Phase 2 that reference design tokens.

**Three patterns, all valid (use whichever reads cleaner per context):**

```tsx
// Pattern A — Auto-generated utility (for namespaced tokens: --color-*, --font-*, --text-*)
<div className="bg-surface text-text-primary font-sans text-body">
  {/* --color-surface → bg-surface; --font-sans → font-sans */}
</div>

// Pattern B — Arbitrary value referencing CSS var (for non-namespaced: --space-*, --nav-height-*)
<header className="h-[var(--nav-height-mobile)] md:h-[var(--nav-height-desktop)]">
<div style={{ padding: 'var(--space-md)' }}>

// Pattern C — Arbitrary value with CSS-variable color (works for all --color-* tokens too)
<a className="text-[--color-text-primary] hover:text-[--color-accent-lime]">
```

**Rule of thumb (from RESEARCH "CRITICAL NOTE" lines 250-256):**
- Colors/fonts/text: prefer Pattern A (auto-utility) where it reads clean; Pattern C when doing hover/variant pairings.
- Spacing: use Tailwind defaults (`p-4` = 16px = `--space-md`) where equivalent; use Pattern B (`p-[var(--space-md)]`) only where the semantic name matters.
- Layout constants: use Pattern B (`h-[var(--nav-height-mobile)]`) — there is no Tailwind equivalent.

---

### Shared Pattern 4: Accessibility Attributes on Interactive Elements

**Source:** WCAG 2.5.5 AAA (RESEARCH line 507) + aria-current pattern (RESEARCH Pitfall #8).

**Apply to:** `NavLinks`, `MobileMenu`, `SocialIcon`, Incubation footer items.

| Element | Required Attributes |
|---------|--------------------|
| Active nav link | `aria-current="page"` |
| Inactive nav link | no `aria-current` (omit, don't set to `"false"`) |
| Hamburger button | `aria-label`, `aria-expanded={open}`, `aria-controls="mobile-nav-overlay"`, `type="button"` |
| Mobile overlay | `role="dialog"`, `aria-modal="true"`, `aria-hidden={!open}`, matching `id` |
| External link (SocialIcon) | `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` with platform name |
| Disabled-like anchor (Incubation) | prefer `<span aria-disabled="true" class="cursor-not-allowed opacity-40">` over `<a href="#">` (Open Question #4) |
| Decorative SVG inside link | `aria-hidden="true"` on `<svg>` (anchor's `aria-label` carries the semantic) |
| Touch targets | ≥44×44px via padding wrapper (D-13) — NEVER by scaling the icon |

---

### Shared Pattern 5: Server-vs-Client Boundary (STATE.md rule)

**Source:** `.planning/STATE.md` — "`use client` only on leaf/interactive components — never page-level."

**Apply to:** All 10 files in Phase 2.

| File | Boundary |
|------|----------|
| `app/layout.tsx` | Server (stays synchronous — can render async child `<SiteFooter />`) |
| `app/globals.css` | N/A (CSS) |
| `public/fonts/` | N/A (assets) |
| `components/layout/SiteNav.tsx` | **Server** (no directive) |
| `components/layout/NavLinks.tsx` | **Client** (`"use client"`) |
| `components/layout/MobileMenu.tsx` | **Client** (`"use client"`) |
| `components/layout/SiteFooter.tsx` | **Server, async** (awaits reader) |
| `components/layout/Container.tsx` | **Server** |
| `components/ui/Logo.tsx` | **Server** |
| `components/ui/SocialIcon.tsx` | **Server** |

**Verification command (pre-flight test, from RESEARCH line 966):**

```bash
grep -l 'use client' components/layout/ components/ui/
# Must return ONLY: components/layout/NavLinks.tsx + components/layout/MobileMenu.tsx
```

---

## No Analog Found

Files with no close match in the codebase — planner MUST use `02-RESEARCH.md` code examples and `02-UI-SPEC.md` as the authoritative source:

| File | Role | Data Flow | Reason | Source to Use |
|------|------|-----------|--------|---------------|
| `components/layout/SiteNav.tsx` | layout shell (Server) | request-response | No prior `components/` tree; no nav in repo | RESEARCH Pattern 3 |
| `components/layout/MobileMenu.tsx` | interactive (Client) | event-driven | No `useState`/`useEffect` component analog | RESEARCH "MobileMenu skeleton" (lines 781-863) |
| `components/layout/Container.tsx` | layout primitive | pure render | No layout primitives exist yet | RESEARCH Pattern 5 |
| `components/ui/SocialIcon.tsx` | UI primitive (Server) | pure render | No React SVG-component analog | RESEARCH Pitfall #7 example |
| `components/ui/Logo.tsx` | UI primitive (Server) | pure render | Client logo file not yet delivered | Wordmark fallback → swap to inline SVG on file arrival |

Files WITH a partial analog (pattern-lift primarily comes from RESEARCH, but one convention rule or structural element lifts from existing code):

| File | Analog | What Lifts |
|------|--------|------------|
| `components/layout/NavLinks.tsx` | `app/keystatic/keystatic-app.tsx` | `"use client"` directive line-1 convention + default export pattern |
| `components/layout/SiteFooter.tsx` | `lib/keystatic.ts` | `reader` singleton import + `@/lib/keystatic` alias |
| `app/layout.tsx` | itself (current version) | Metadata import, `Readonly<{children}>` prop shape, `min-h-full flex flex-col` body classes |
| `app/globals.css` | itself (current version) | `@import "tailwindcss"` line 1 |

---

## Pre-Flight Blockers (research-surfaced — planner must address)

| # | Blocker | Source | Required Action |
|---|---------|--------|-----------------|
| 1 | `content/site-config.yaml` does NOT exist | RESEARCH line 15, 461, 521, Open Question #1 | Planner decides: option (a) `read()` + fallback [recommended] OR option (b) pre-flight "seed singleton via /keystatic" step. Amends D-14. |
| 2 | `public/fonts/` does NOT exist | RESEARCH line 522 | Executor creates empty directory; D-08 pre-flight check emits non-blocking warning if woff2 files absent. |
| 3 | `public/logo.svg` NOT yet provided | RESEARCH line 523 | Plan gates on logo file arrival; if absent, `Logo.tsx` uses wordmark fallback with TODO comment. |
| 4 | UI-SPEC `body { overflow-x: hidden }` breaks sticky nav | RESEARCH Pitfall #2, Open Question #2 | Amend to `overflow-x: clip` + `@supports not (clip)` fallback to `hidden`. Planner-approvable. |

---

## Metadata

**Analog search scope:** `app/`, `lib/`, `public/`, `components/` (not yet created), `keystatic.config.ts`, `tsconfig.json`, `package.json`, `postcss.config.mjs`, `next.config.ts`.
**Files scanned:** 13 source files; repo has only 5 `.tsx` files total (all scanned).
**Pattern extraction date:** 2026-04-22
**Codebase state note:** Pre-Phase-2, the repo is the Phase 1 infrastructure baseline — Keystatic configured + admin routes + reader, but no UI components. Phase 2 is a near-greenfield UI layer on top of the CMS backbone. Most pattern authority therefore comes from `02-RESEARCH.md` (code-grade prescriptions) and `02-UI-SPEC.md` (token block + visual contract), not from existing source files.

---

*Phase 2 pattern mapping complete. Ready for `gsd-planner`.*
