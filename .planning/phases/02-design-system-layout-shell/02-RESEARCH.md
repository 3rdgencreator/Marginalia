# Phase 2: Design System & Layout Shell — Research

**Researched:** 2026-04-22
**Domain:** Next.js 15 App Router + Tailwind CSS v4 CSS-first design system; shared layout shell (nav, footer, container); self-hosted fonts; inline brand SVGs; async Server Component reading Keystatic singleton
**Confidence:** HIGH (core stack verified via Context7; project constraints read from CONTEXT.md + UI-SPEC.md)

---

## Summary

Phase 2 implements the global visual contract locked by UI-SPEC.md: Tailwind v4 design tokens in `@theme {}`, self-hosted Nimbus Sans via `@font-face`, a shared `SiteNav` (Server Component with a `NavLinks` Client child using `usePathname`), a `MobileMenu` Client Component, and an async `SiteFooter` Server Component that reads `siteConfig` via the Keystatic Reader API. All decisions are already locked in CONTEXT.md — research here is prescriptive, not exploratory.

The seven critical questions from the phase prompt all resolve cleanly: Tailwind v4 `@theme` namespaces map directly to the UI-SPEC token block, `@font-face` works as declared (with the understood tradeoff that `next/font/local` would be more performant but the UI-SPEC locked the manual approach), `readOrThrow()` is the right method for a required singleton, `"use client"` belongs on `NavLinks` and `MobileMenu` leaves only, `usePathname` has no Suspense caveats for simple nav usage, Simple Icons is CC0-licensed with `viewBox="0 0 24 24"` confirmed for all six brands, and `Container` is a simple max-width wrapper with responsive padding — no config needed.

Two **runtime blockers** were found that must be surfaced in the plan: (1) the `public/fonts/` directory does not exist yet (the user must place woff2 files before the site renders branded text), and (2) `content/site-config.yaml` does not exist yet (calling `readOrThrow()` on siteConfig will throw at runtime until the user saves the singleton via `/keystatic`). These are handled by D-08 for fonts; the footer needs an analogous graceful fallback or a pre-flight seed.

**Primary recommendation:** Follow UI-SPEC.md verbatim for tokens, components, and typography; build `SiteFooter` with a defensive `read()` (not `readOrThrow()`) + fallback so the site does not crash on first render before the singleton is saved; flag the missing font files and missing site-config singleton as manual prerequisites in the plan's acceptance criteria.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Logo Treatment**
- **D-01:** The real Marginalia logo SVG file is available (user has it). It will be provided before execution starts (beginning of next shift).
- **D-02:** Logo renders as an **inline SVG component** — a React component that outputs raw `<svg>` JSX. Color controlled via `currentColor` so CSS hover states work. Used in both `SiteNav` and `SiteFooter`.
- **D-03:** Logo file placed at `public/logo.svg`; component at `components/ui/Logo.tsx`.

**Active Nav Link**
- **D-04:** Active link detection implemented in Phase 2 using a **thin client wrapper**: a `NavLinks` Client Component that calls `usePathname()` and applies the lime bottom border (`border-b-2 border-[--color-accent-lime]`) to the matching link.
- **D-05:** `SiteNav` itself remains a Server Component. It renders `<NavLinks />` (client) for the primary link list. `MobileMenu` is already a Client Component and handles its own active state inline.
- **D-06:** `"use client"` boundary is on `NavLinks` and `MobileMenu` only — not on `SiteNav`, not on any page component.

**Font File Sourcing**
- **D-07:** Nimbus Sans woff2 files are placed **manually by the user** before execution. Executor assumes `public/fonts/NimbusSans-Regular.woff2` and `public/fonts/NimbusSans-Bold.woff2` already exist.
- **D-08:** Executor must include a pre-flight check: if either font file is missing, log a warning in the plan's acceptance criteria noting the manual step, but do NOT fail the build — the site will render with the system fallback until fonts are in place.
- **D-09:** Font Squirrel is the recommended download source (URW Nimbus Sans, free for web use). The `@font-face` declarations in the UI-SPEC are final and must not be modified.

**Social Icon SVGs**
- **D-10:** `SocialIcon` uses **Simple Icons SVG paths** — MIT-licensed, inline, no npm package required. SVG `viewBox="0 0 24 24"` paths copied directly into the component for each platform.
- **D-11:** Platforms to implement in Phase 2 (matching `siteConfig` singleton fields): Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook.
- **D-12:** `SocialIcon` renders `null` when its URL prop is empty or undefined — no broken link, no empty icon.
- **D-13:** Icon size: 20×20px. Touch target: 44×44px achieved via padding wrapper (`p-[12px]` on the anchor), not by stretching the SVG.

**Keystatic Reader in Footer**
- **D-14:** `SiteFooter` is an **async Server Component** that calls `reader.singletons.siteConfig.readOrThrow()` to pull social URLs and tagline from the Keystatic singleton. No client-side fetching.
- **D-15:** Claude's Discretion: reader import from `lib/keystatic.ts` (already exists from Phase 1 as `createReader` export).

### Claude's Discretion
- CSS implementation details beyond what UI-SPEC specifies (class naming, utility composition)
- Exact TypeScript prop interfaces for each component
- Tailwind v4 utility class patterns for spacing/color tokens
- Nav height implementation (CSS variable + padding vs. fixed-height div)
- MobileMenu animation implementation details (200ms ease-in-out per UI-SPEC)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

### Research-Surfaced Amendment to D-14 (for planner review)
D-14 specifies `readOrThrow()` for siteConfig. That method throws if the YAML file does not exist. At time of research (2026-04-22), `content/site-config.yaml` does NOT yet exist in the repo — calling `readOrThrow()` in the root layout's footer will crash every page render until the user saves the singleton once via `/keystatic`. Recommend the planner either (a) change to `read()` with an explicit fallback object whose values match the UI-SPEC tagline fallback "Barcelona · Melodic House & Techno" and empty social URLs, or (b) add a pre-flight acceptance-criteria item that the user saves siteConfig in `/keystatic` BEFORE running `npm run dev` on Phase 2 output. Option (a) is more robust.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSYS-01 | Tailwind v4 configured via `@theme {}` in CSS (no tailwind.config.js) | Confirmed: `@theme {}` is the v4 CSS-first mechanism; `--color-*`, `--font-*`, `--text-*`, `--spacing-*`, `--breakpoint-*` namespaces auto-generate utility classes. See `## Architecture Patterns`. |
| DSYS-02 | Neutral base color palette that lets release artwork set the tone | `--color-bg: #1F1F21` + `--color-surface: #2A2A2C` per UI-SPEC locks the neutral dark base. Accent colors reserved for CTAs/active indicators only. |
| DSYS-03 | Bold graphic typography — strong headings, clean body text | Nimbus Sans Bold (700) for display/heading, Regular (400) for body. 16px body on mobile (success criterion). `@font-face` declarations in globals.css; `--font-sans` theme token drives `font-sans` utility. |
| DSYS-04 | Site is fully responsive across mobile, tablet, and desktop | Breakpoints 375/768/1024/1440 per UI-SPEC. `Container` component enforces max-width 1280px + 20px/32px responsive padding. `overflow-x: hidden` on body as safety net (with caveat — see pitfall #7). |
| DSYS-05 | Global layout shell — navigation and footer — implemented and shared across all pages | `SiteNav` + `SiteFooter` rendered in `app/layout.tsx` wrapping `{children}`. No per-page duplication. Nav is sticky top-0 z-50. |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Design tokens (colors, spacing, typography) | CDN / Static (CSS) | — | Declared once in `globals.css @theme {}`, compiled by Tailwind v4 to utility classes; no runtime cost |
| Self-hosted font files | CDN / Static (Workers assets) | — | Served from `public/fonts/*.woff2` via OpenNext assets binding; browser caches per standard cache headers |
| Nav shell + link list | Frontend Server (SSR) | — | `SiteNav` is a Server Component; HTML is emitted during SSR; zero client JS for the shell itself |
| Active-link indicator | Browser / Client | — | `NavLinks` is `"use client"` because `usePathname` is a browser-time hook; only the link-list island hydrates |
| Mobile hamburger + overlay | Browser / Client | — | `MobileMenu` owns `useState` for open/closed, keyboard Escape handling, and body-scroll-lock; full client island |
| Footer social URLs + tagline | Frontend Server (SSR) | Database / Storage (filesystem YAML) | `SiteFooter` is async Server Component; reads `content/site-config.yaml` at build/request time via Keystatic Reader; data origin is filesystem (in local mode) |
| Inline social icon SVGs | CDN / Static (JS bundle) | — | Paths copied into `SocialIcon.tsx` Server Component; SVG markup ships in the server-rendered HTML, no extra request |
| Container max-width + padding | CDN / Static (CSS) | — | Pure layout wrapper, no JS |
| Focus ring / keyboard a11y | Browser / Client (CSS only) | — | `:focus-visible` handled by stylesheet; no JS required |

**Why this matters:** All Phase 2 components that can be Server Components remain so. `"use client"` is used only where `usePathname` and `useState` are genuinely required, preserving SSR for the rest of the tree. This matches the `"use client"` boundary rule locked in STATE.md ("only leaf/interactive components — never page-level").

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.2.4 | App Router, layouts, Server Components | [VERIFIED: npm registry, 2026-04-22] — project is pinned; note STACK.md originally targeted 15.x but Phase 1 moved to 16 and `@keystatic/next` peerDep is `next: >=14`, so 16 is supported [VERIFIED: `npm view @keystatic/next peerDependencies`] |
| `react` / `react-dom` | 19.2.5 | UI + hooks | [VERIFIED: npm registry, 2026-04-22] |
| `tailwindcss` | 4.2.4 | CSS-first utility framework | [VERIFIED: npm registry, 2026-04-22] — `@theme {}` directive is the canonical v4 customization mechanism [CITED: tailwindcss.com/docs/theme] |
| `@tailwindcss/postcss` | 4.x | PostCSS plugin for Tailwind v4 | [VERIFIED: package.json] — already wired via `postcss.config.mjs` |
| `@keystatic/core` | 0.5.50 | Reader API + config | [VERIFIED: npm registry, 2026-04-22] — singleton reader used in `SiteFooter` |
| `typescript` | 5.x | Type safety | [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| No new runtime dependencies | — | — | Phase 2 adds ZERO new npm packages. Simple Icons paths are inlined (CC0); Nimbus Sans is self-hosted via `@font-face`; no icon library, no animation library, no form library touched in this phase. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@font-face` in globals.css | `next/font/local` | `next/font/local` gives automatic preload, zero-CLS size-adjust, and CSS-variable injection via `variable: '--font-nimbus'` [CITED: nextjs.org/docs/app/api-reference/components/font]. It is measurably more performant. **BUT** D-09 locks the `@font-face` approach per UI-SPEC, so this is NOT adopted. Research-surfaced note: if the planner has authority to revisit D-09 in a future phase, migration is a one-file swap in `app/layout.tsx`. |
| Simple Icons inline paths | `react-icons`, `lucide-react`, `@iconify/react` | Adds npm dependency + larger bundle for just 6 icons. D-10 locks inline paths. Confirmed correct. |
| `next/link` `NavLink` active state hack | Custom `NavLinks` with `usePathname` | `next/link` has no built-in active-state prop in App Router. `usePathname` is the canonical pattern [CITED: nextjs.org/docs/app/api-reference/functions/use-pathname]. D-04 locks this. |
| `readOrThrow()` on siteConfig | `read()` with fallback | `readOrThrow()` crashes if the YAML file doesn't exist. `read()` returns `null`. Since `content/site-config.yaml` does not exist yet in the repo, `read()` + fallback is safer. See amendment note in User Constraints. |
| `overflow-x: hidden` on body | `overflow-x: clip` | `hidden` on html/body creates a scrolling context that breaks `position: sticky` on descendants [CITED: polypane.app/blog/getting-stuck-all-the-ways-position-sticky-can-fail]. `clip` preserves sticky. See pitfall #7. UI-SPEC specifies `hidden`; recommend amending to `clip` with `hidden` as a progressive-enhancement fallback via `@supports`. |

**Installation:** No install step. Phase 2 uses packages already in `package.json`.

**Version verification performed:**
- `npm view tailwindcss version` → 4.2.4 (2026-04-22)
- `npm view next version` → 16.2.4 (2026-04-22)
- `npm view @keystatic/core version` → 0.5.50 (2026-04-22)
- `npm view @keystatic/next version` → 5.0.4 (2026-04-22)
- `npm view react version` → 19.2.5 (2026-04-22)
- `npm view @opennextjs/cloudflare version` → 1.19.3 (2026-04-22)

All installed versions match or are compatible with latest published.

---

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  Request: GET /any-page                                           │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│  app/layout.tsx (Server Component — async if footer awaits)      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ <html className="...">                                     │  │
│  │   <body>                                                   │  │
│  │     <SiteNav>                                              │  │
│  │       ├─ <Logo/> (Server, inline SVG)                     │  │
│  │       ├─ <NavLinks/> ─── "use client" ─► usePathname()    │  │
│  │       │                                  (hydration island)│  │
│  │       └─ <MobileMenu/> ─ "use client" ─► useState()       │  │
│  │                                          (hydration island)│  │
│  │     {children}  ◄─── page tree (Server by default)        │  │
│  │     <SiteFooter> ─── async Server Component               │  │
│  │       │                                                    │  │
│  │       └─ await reader.singletons.siteConfig.read()        │  │
│  │            │                                               │  │
│  │            ▼                                               │  │
│  │       ┌────────────────────────┐                          │  │
│  │       │ content/site-config.yaml│  ◄── Keystatic YAML     │  │
│  │       │  (filesystem, local    │      written by /keystatic│  │
│  │       │   mode in v1)          │      admin UI            │  │
│  │       └────────────────────────┘                          │  │
│  │       │                                                    │  │
│  │       └─► Returns {instagramUrl, soundcloudUrl, ...}      │  │
│  │            SocialIcon renders null for empty URLs          │  │
│  │   </body>                                                  │  │
│  │ </html>                                                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
              Browser: rendered HTML + hydrates 2 small islands
              Static assets: /fonts/*.woff2 served by Workers via
              OpenNext assets binding (preload via <link> in <head>)
```

**Data flow trace — first request for `/`:**
1. Workers receives GET `/`.
2. `app/layout.tsx` (root) runs on the server as an async Server Component (because it awaits `SiteFooter`).
3. `SiteNav` (Server) renders the logo + link list HTML; the `NavLinks` island is a placeholder with props (`href`, `label`) ready to hydrate.
4. `{children}` resolves to `app/page.tsx` (the "Coming soon" placeholder, a Server Component).
5. `SiteFooter` (async Server) calls `await reader.singletons.siteConfig.read()`, gets either the parsed YAML object or `null`, then renders the footer with social URLs (or empty state).
6. HTML streams to client. Two hydration islands register: `NavLinks` reads `usePathname()`, `MobileMenu` manages `useState`.
7. CSS loaded from `globals.css` compiled by Tailwind v4; `@font-face` triggers download of `/fonts/NimbusSans-*.woff2`.

### Recommended Project Structure

```
marginalia-label/
├── app/
│   ├── globals.css            # FULL REPLACE — UI-SPEC @theme block + @font-face
│   ├── layout.tsx             # UPDATE — import globals, render SiteNav + SiteFooter
│   └── page.tsx               # KEEP AS-IS — placeholder "Coming soon"
├── components/                # NEW in Phase 2
│   ├── layout/
│   │   ├── SiteNav.tsx        # Server Component — shell + <NavLinks/> + <MobileMenu/>
│   │   ├── NavLinks.tsx       # "use client" — usePathname, desktop link list
│   │   ├── MobileMenu.tsx     # "use client" — useState, fullscreen overlay
│   │   ├── SiteFooter.tsx     # async Server Component — reader.singletons.siteConfig
│   │   └── Container.tsx      # Server Component — max-w-[1280px] px-5 md:px-8 mx-auto
│   └── ui/
│       ├── Logo.tsx           # Server Component — inline SVG from client's logo file
│       └── SocialIcon.tsx     # Server Component — per-platform inline Simple Icons path
├── lib/
│   └── keystatic.ts           # EXISTING from Phase 1 — createReader export
└── public/
    └── fonts/                 # NEW (created by user manually before Phase 2 exec)
        ├── NimbusSans-Regular.woff2
        └── NimbusSans-Bold.woff2
```

### Pattern 1: Tailwind v4 `@theme {}` Namespaces → Utility Classes

**What:** In Tailwind v4 there is no `tailwind.config.js`. All design tokens live in `globals.css` inside `@theme {}`. Variable names under specific namespaces auto-generate utility classes.

**When to use:** This IS the Phase 2 design-system mechanism. Every color/spacing/font token from UI-SPEC becomes a CSS variable and a utility class simultaneously.

**Key namespaces (Context7-verified):**

| Namespace | Example Variable | Generates Utility |
|-----------|------------------|-------------------|
| `--color-*` | `--color-accent-lime: #9EFF0A` | `bg-accent-lime`, `text-accent-lime`, `border-accent-lime`, `fill-accent-lime` |
| `--font-*` | `--font-sans: 'Nimbus Sans', ...` | `font-sans` |
| `--text-*` | `--text-heading: 1.5rem` | `text-heading` |
| `--breakpoint-*` | `--breakpoint-3xl: 1440px` | `3xl:` variants |
| `--spacing` (root) | `--spacing: 0.25rem` | controls `p-4`, `m-8`, etc. via `calc(var(--spacing) * N)` |

**Example — UI-SPEC token block compiled to usable classes:**
```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  --color-bg: #1F1F21;           /* → bg-bg, text-bg */
  --color-accent-lime: #9EFF0A;  /* → bg-accent-lime, text-accent-lime, border-accent-lime */
  --font-sans: 'Nimbus Sans', 'Helvetica Neue', Arial, sans-serif;  /* → font-sans */
  --text-heading: 1.5rem;        /* → text-heading */
}
```

**CRITICAL NOTE on `--space-*` tokens in UI-SPEC:** UI-SPEC declares `--space-xs`, `--space-sm`, etc. These do NOT sit in a namespace Tailwind v4 recognizes for utility generation [VERIFIED: Context7 tailwindcss.com docs list `--spacing` as the scale root, not `--space-*`]. Options:
1. **Use `var(--space-md)` in arbitrary-value utilities** — e.g., `p-[var(--space-md)]`. Works today, verbose.
2. **Rename to the default `--spacing` scale** — e.g., `--spacing: 0.25rem` (default) makes `p-4` = 16px. This is already the Tailwind v4 default; UI-SPEC tokens align perfectly (4/8/16/24/32/48/64 → `p-1 p-2 p-4 p-6 p-8 p-12 p-16`).
3. **Keep `--space-*` as CSS variables for `var()` consumption** AND use default Tailwind spacing utilities side-by-side.

**Planner recommendation:** Option 3 — keep UI-SPEC's `--space-*` variables as declared (they are documented semantic tokens) AND use Tailwind's default spacing utilities (`p-4 = 16px = --space-md`) in component JSX. No conflict, both work. Document the equivalence in a comment.

### Pattern 2: Self-Hosted Font via `@font-face` (Locked by D-07/D-09)

**What:** `@font-face` declarations in `globals.css` point to `/fonts/NimbusSans-*.woff2`. Tailwind v4 `--font-sans` token references the family name so `font-sans` utility produces the right stack.

**When to use:** Phase 2, per UI-SPEC contract. This is the locked approach.

**Example (from UI-SPEC lines 77-95, final):**
```css
/* Source: UI-SPEC.md lines 78-93; verified pattern at tailwindcss.com/docs/font-family */
@font-face {
  font-family: 'Nimbus Sans';
  src: url('/fonts/NimbusSans-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Nimbus Sans';
  src: url('/fonts/NimbusSans-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  --font-sans: 'Nimbus Sans', 'Helvetica Neue', Arial, sans-serif;
}
```

**Tradeoff (documented, not blocking):** This approach ships the fonts but misses `next/font/local`'s build-time optimizations: automatic `<link rel="preload">` in `<head>`, `size-adjust` to eliminate CLS, and a CSS variable generated for you. The planner accepts this tradeoff because D-09 locks `@font-face`. If the user later wants zero-CLS, migration is a one-file change in `app/layout.tsx` plus removing the `@font-face` blocks.

**Preload recommendation (optional, additive):** Planner MAY add manual `<link rel="preload">` tags in `app/layout.tsx` `<head>` to get some of the benefit of `next/font`:
```tsx
<head>
  <link rel="preload" href="/fonts/NimbusSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
  <link rel="preload" href="/fonts/NimbusSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
</head>
```

### Pattern 3: Server Component with Client Island for `usePathname` Active State

**What:** `SiteNav` stays a Server Component (SSR, zero client JS by default). Its primary link list is rendered by `<NavLinks />`, a Client Component that calls `usePathname()` to mark the active link.

**When to use:** Phase 2 nav active state. Canonical Next.js App Router pattern per docs.

**Example:**
```tsx
// components/layout/SiteNav.tsx  (Server Component — NO "use client")
// Source: CONTEXT.md D-05; pattern from nextjs.org/docs/app/getting-started/server-and-client-components
import Logo from '@/components/ui/Logo';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';
import Container from './Container';

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

export default function SiteNav() {
  return (
    <header
      className="sticky top-0 z-50 bg-[--color-surface] h-[var(--nav-height-mobile)] md:h-[var(--nav-height-desktop)]"
      aria-label="Main navigation"
    >
      <Container className="flex h-full items-center justify-between">
        <a href="/" aria-label="Marginalia — Home">
          <Logo className="h-8 w-auto text-[--color-text-primary]" />
        </a>
        {/* Desktop link list — client island for active state */}
        <NavLinks links={PRIMARY_LINKS} className="hidden md:flex" />
        {/* Mobile hamburger — client island for open/closed state */}
        <MobileMenu links={PRIMARY_LINKS} className="md:hidden" />
      </Container>
    </header>
  );
}
```

```tsx
// components/layout/NavLinks.tsx
'use client';
// Source: nextjs.org/docs/app/api-reference/functions/use-pathname
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type NavLink = { href: string; label: string };

export default function NavLinks({
  links,
  className = '',
}: {
  links: readonly NavLink[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={`flex items-center gap-6 ${className}`}>
      {links.map(({ href, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <li key={href}>
            <Link
              href={href}
              className={`text-label text-[--color-text-primary] hover:text-[--color-surface-purple] transition-colors duration-150 py-2 ${
                isActive ? 'border-b-2 border-[--color-accent-lime]' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

**Why this works:**
- `SiteNav` stays server-rendered — the full link list HTML is in the initial response for SEO and first paint.
- Only `NavLinks` and `MobileMenu` hydrate on the client. The rest of the tree is static HTML.
- `usePathname()` has no caveats for this usage; it is stable in App Router and does not require Suspense wrapping unless used alongside `useSearchParams` inside certain layout configurations [CITED: nextjs.org/docs/app/api-reference/functions/use-pathname — `useSearchParams` requires Suspense, `usePathname` does not].

### Pattern 4: Async Server Component Reading Keystatic Singleton

**What:** `SiteFooter` is an `async` function component that awaits the Keystatic Reader. Runs on the server, never hydrates.

**When to use:** Any time page/layout content depends on CMS-managed data. Canonical Next.js + Keystatic pattern.

**Example (research-recommended version using `read()` + fallback, NOT `readOrThrow()`):**
```tsx
// components/layout/SiteFooter.tsx  (async Server Component — NO "use client")
// Source: nextjs.org/docs/app/getting-started/fetching-data (async Server Components)
//         keystatic.com/docs/reader-api (reader.singletons.X.read)
import { reader } from '@/lib/keystatic';
import Container from './Container';
import SocialIcon from '@/components/ui/SocialIcon';
import Logo from '@/components/ui/Logo';

const FALLBACK_TAGLINE = 'Barcelona · Melodic House & Techno';

export default async function SiteFooter() {
  // Use read() (not readOrThrow) — site-config.yaml may not exist yet on first run.
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
  const year = new Date().getFullYear();

  return (
    <footer
      className="bg-[--color-surface] pt-12 pb-8 mt-auto"
      aria-label="Site footer"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 — Brand */}
          <div>
            <Logo className="h-10 w-auto text-[--color-text-primary]" />
            <p className="mt-4 text-label text-[--color-text-secondary]">{tagline}</p>
          </div>
          {/* Column 2 — Quick Links */}
          <nav aria-label="Footer quick links">
            {/* ... Releases, Artists, Podcasts, Press, Showcases, About ... */}
          </nav>
          {/* Column 3 — Social + Incubation */}
          <div>
            <ul className="flex flex-wrap gap-2">
              {socials.map(({ platform, url }) => (
                <li key={platform}>
                  <SocialIcon platform={platform} url={url} />
                </li>
              ))}
            </ul>
            {/* Incubation group with aria-disabled anchors */}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/8">
          <p className="text-label text-[--color-text-secondary]">
            © {year} Marginalia. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
```

**Why `read()` not `readOrThrow()`:** At time of research, `content/site-config.yaml` does not exist. `readOrThrow()` would crash the ENTIRE app on the very first `npm run dev` of Phase 2, because the footer is in the root layout. `read()` returns `null`, fallback fills gracefully. This is a research-surfaced deviation from D-14 that must go back to the planner for ratification — see the User Constraints amendment note.

### Pattern 5: Container — Max-Width Wrapper

**What:** A Server Component that caps width at 1280px and applies responsive horizontal padding. Used in SiteNav, SiteFooter, and later page-level content.

**Example:**
```tsx
// components/layout/Container.tsx  (Server Component)
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

No theme customization needed — `max-w-[1280px]`, `px-5` (20px), `md:px-8` (32px) all work out of the box. No `tailwind.config.js`.

### Anti-Patterns to Avoid

- **`"use client"` on `SiteNav` or `app/layout.tsx`:** Forces the entire tree client-rendered. Violates STATE.md rule and kills SSR benefits. Only `NavLinks` and `MobileMenu` are `"use client"`.
- **Importing `lib/keystatic` in a Client Component:** Reader API uses Node.js filesystem — build error at minimum. Enforce with `server-only` package (already in dependencies) if needed. `SiteFooter` is the only consumer.
- **Adding `tailwind.config.js`:** Explicitly forbidden by DSYS-01. Tailwind v4 is CSS-first.
- **Putting `overflow-x: hidden` on BOTH html AND body:** Creates two scroll contexts, breaks sticky nav. See pitfall #7.
- **Using `readOrThrow()` in the root layout when the YAML may not exist:** Crashes every route. Use `read()` + fallback.
- **Stretching social SVGs to fill 44×44 touch target:** Visually wrong. Use 20×20 SVG + padding wrapper per D-13.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS reset / base styles | Custom reset | Tailwind v4's built-in `@import "tailwindcss"` preflight | Preflight is already applied by the import; handles box-sizing, margin reset, form element normalization. UI-SPEC's explicit `* { box-sizing: border-box }` is redundant but harmless. |
| Active nav link detection | URL regex, context provider, scroll-observer | `usePathname()` from `next/navigation` | Single hook, server-driven, zero boilerplate. |
| Responsive breakpoints | `window.matchMedia` + JS state | Tailwind v4 responsive variants (`md:`, `lg:`, etc.) | CSS-only, zero JS, SSR-safe. |
| Social brand icons | Hand-draw SVGs or npm install 5MB icon library | Simple Icons CC0 SVG paths copied inline (6 icons) | [VERIFIED: simpleicons.org, CC0-1.0 license, viewBox 0 0 24 24, all 6 brands confirmed]. Zero deps, smallest possible bundle. |
| Font file delivery | Custom CDN, external font-loader script | Self-hosted `@font-face` + Workers assets | OpenNext serves `public/fonts/` via assets binding [VERIFIED: Phase 1 wrangler.jsonc]; browser caches per default headers; one less origin. |
| Touch target sizing | Hand-tuned per platform | 44×44px wrapper around any tappable element | WCAG 2.5.5 (AAA) + Apple HIG + Material guidelines all ≥44px [CITED: w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html]. Applied via padding, not SVG scaling. |
| Year in copyright | Hardcoded `2026` | `new Date().getFullYear()` in Server Component | Server-rendered, no hydration mismatch, auto-updates forever. |
| Container max-width | Tailwind's `container` utility | Explicit `max-w-[1280px] mx-auto px-5 md:px-8` | Tailwind v4's `container` utility requires theme config; explicit utilities are simpler and more predictable. |

**Key insight:** Phase 2 adds ZERO new npm dependencies. Everything is either already installed, inlined as CC0-licensed SVG, or built from Tailwind v4 primitives. This keeps the build lean and matches the label's "recede so music leads" ethos even at the dependency level.

---

## Runtime State Inventory

Phase 2 is additive (new files, one CSS replacement, one layout edit) — NOT a rename/refactor. This section is included because Phase 2 depends on external runtime state that does not yet exist in the repo.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `content/site-config.yaml` does NOT exist [VERIFIED: `find content/site-config*` returned nothing]. `SiteFooter` reads this singleton. | Two options (planner picks one): (a) research-recommended — use `reader.singletons.siteConfig.read()` + graceful fallback so first render works without any YAML, OR (b) add pre-flight acceptance-criteria item: user opens `/keystatic`, saves the siteConfig singleton once (even with all-empty URLs), commits the resulting YAML. Option (a) is more robust. |
| Stored data | `public/fonts/NimbusSans-Regular.woff2` and `public/fonts/NimbusSans-Bold.woff2` do NOT exist [VERIFIED: `ls public/fonts/` returned "no fonts dir yet"]. | D-07 handles: user places files manually before execution. D-08 adds a pre-flight check + warning (non-blocking). Executor creates `public/fonts/` directory if absent so subsequent file drop works. |
| Stored data | Client logo SVG file has NOT been provided yet (per D-01, it comes at the start of the next shift). | Plan must gate on logo file arrival. If the plan executes before the logo arrives, `Logo.tsx` uses a placeholder wordmark (Nimbus Sans Bold "Marginalia") and a TODO comment. |
| Live service config | None — Phase 2 is purely code/CSS. No n8n, no Datadog, no external services. | None. |
| OS-registered state | None. | None. |
| Secrets/env vars | None — Phase 2 makes no network calls, has no API keys, uses no secrets. | None. |
| Build artifacts / installed packages | No new packages installed in Phase 2. `node_modules/` unchanged. `.next/` cache will be regenerated on next `npm run dev`. | None. |

**Critical:** The footer's dependency on `content/site-config.yaml` is the single highest-risk runtime-state item in Phase 2. The locked D-14 (`readOrThrow`) + current absence of the YAML = crash on every request. The planner MUST address this before execution.

---

## Common Pitfalls

### Pitfall 1: `@theme {}` Variables Outside Recognized Namespaces Won't Generate Utilities

**What goes wrong:** Declaring `--space-md: 1rem` inside `@theme {}` does NOT create a `space-md` utility class. Tailwind only generates utilities for recognized namespaces: `--color-*`, `--font-*`, `--text-*`, `--font-weight-*`, `--tracking-*`, `--spacing` (single root), `--breakpoint-*`, `--animate-*`, `--ease-*`, `--radius-*`, etc.

**Why it happens:** UI-SPEC uses semantic names (`--space-xs`, `--space-md`) that read nicely but don't match Tailwind's namespace convention for utility generation [CITED: tailwindcss.com/docs/theme, "Theme variable namespaces"].

**How to avoid:**
1. Access via arbitrary value: `p-[var(--space-md)]` — always works.
2. Use Tailwind's default spacing scale where equivalent (`p-4` = 16px = `--space-md`).
3. The `--space-*` variables still work as CSS custom properties for direct use: `style={{ padding: 'var(--space-md)' }}` or in class `px-[var(--space-md)]`.

**Warning signs:** Class like `p-space-md` silently produces no styling; element has no padding in devtools.

### Pitfall 2: `overflow-x: hidden` on html OR body Breaks `position: sticky`

**What goes wrong:** UI-SPEC says `body { overflow-x: hidden }` as a safety net. But any ancestor with `overflow: hidden/auto/scroll` becomes the scroll container for descendant `position: sticky` elements — sticky sticks to that container, not the viewport. Result: sticky nav never sticks, or sticks incorrectly.

**Why it happens:** The CSS spec says `position: sticky` resolves against the nearest scrolling ancestor, not always the viewport [CITED: polypane.app/blog/getting-stuck-all-the-ways-position-sticky-can-fail, css-tricks.com/dealing-with-overflow-and-position-sticky/].

**How to avoid (two options):**
1. **Preferred:** Use `overflow-x: clip` instead of `hidden`. `clip` prevents overflow but does NOT create a scroll container, preserving sticky [CITED: terluinwebdesign.nl "CSS position:sticky not working? Try overflow: clip"]. Browser support is universal as of 2024.
2. Put `overflow-x: hidden` on a child wrapper (e.g., `<main>`) instead of `body`, so `body` remains sticky's scroll parent.

**Planner recommendation:** Amend the UI-SPEC `body` rule to:
```css
body {
  min-height: 100vh;
  overflow-x: clip; /* was: hidden — clip preserves position: sticky */
  background-color: var(--color-bg);
}
@supports not (overflow-x: clip) {
  body { overflow-x: hidden; } /* progressive enhancement fallback */
}
```

**Warning signs:** Sticky nav scrolls away with the page during viewport resize test (375px → 1440px).

### Pitfall 3: `readOrThrow()` Crashes Footer When Singleton YAML Is Missing

**What goes wrong:** Keystatic's `readOrThrow()` throws if the singleton YAML file does not exist. Because `SiteFooter` is in the root layout, this crash happens on EVERY route, not just one page. Site becomes completely unreachable until the YAML is seeded via `/keystatic`.

**Why it happens:** Keystatic Reader API semantics: `read()` returns `null` for missing entries, `readOrThrow()` throws [search result: keystatic.com/docs/reader-api mentions `read()`; `readOrThrow()` is the collection/singleton variant that throws — behavior consistent with `readOrThrow` naming convention]. The label has not yet opened `/keystatic` and saved the singleton once.

**How to avoid:** Use `read()` with a fallback object whose defaults match UI-SPEC copywriting contract (`tagline: "Barcelona · Melodic House & Techno"`, all URLs undefined → `SocialIcon` renders null per D-12).

**Warning signs:** `npm run dev` boots, hit any page, get a 500 with "File not found: content/site-config.yaml" in the Next.js overlay.

### Pitfall 4: Hydration Mismatch on `new Date().getFullYear()` Across Timezones

**What goes wrong:** Server renders `© 2026`, client briefly computes a different year on Dec 31 / Jan 1 boundaries due to server timezone vs client timezone, hydration mismatch warning.

**Why it happens:** Server may be UTC while client is UTC-8 on New Year's Eve.

**How to avoid:** Compute the year ONCE on the server (Server Component), pass as static string prop to any client-rendered descendant. Since `SiteFooter` is a Server Component computing `getFullYear()` directly, the string is already baked into the HTML — no client recompute. Safe.

**Warning signs:** Console warning "Text content does not match server-rendered HTML" on the copyright line, appearing near midnight UTC on December 31.

### Pitfall 5: `usePathname` Needs Suspense Only If Paired with `useSearchParams`

**What goes wrong:** Some guides claim `usePathname` requires a Suspense boundary. This is a confusion with `useSearchParams`, which DOES require Suspense in App Router static generation contexts [CITED: nextjs.org/docs/app/api-reference/functions/use-search-params — Suspense note applies to search params]. `usePathname` has no such requirement and is safe to call in any Client Component.

**Why it happens:** Documentation for `useSearchParams` includes Suspense warnings; developers misremember the scope.

**How to avoid:** Use `usePathname` directly in `NavLinks` with no Suspense wrapper. Only reach for Suspense if `useSearchParams` is added later (not in Phase 2).

**Warning signs:** Build warning "useSearchParams() should be wrapped in Suspense" — not applicable to Phase 2 since `NavLinks` uses `usePathname` only.

### Pitfall 6: Missing `public/fonts/` Directory Causes 404s on `@font-face src`

**What goes wrong:** Browser tries to fetch `/fonts/NimbusSans-Regular.woff2`, gets 404, silently falls back to the next font in the stack (`'Helvetica Neue'`). No build error, no console error beyond the 404 in network tab. Site looks "off" but no one knows why.

**Why it happens:** D-07 says the user places the woff2 files manually. If they forget, nothing breaks loudly — `font-display: swap` ensures fallback renders.

**How to avoid (D-08 handles this — implementation detail):**
- At plan-execution time, run a pre-flight check script (or a post-install sanity check) that verifies both woff2 files exist. If missing, write a warning to stdout but do not fail the build.
- Acceptance criterion in the plan: "Open dev tools network tab, confirm both woff2 files load with 200 status."

**Warning signs:** Headings render in Helvetica Neue instead of Nimbus Sans Bold; 404s for `/fonts/NimbusSans-*.woff2` in network tab.

### Pitfall 7: Simple Icons Paths Must Be Single `<path d="...">` — Some Have Multiple

**What goes wrong:** Copy-pasting an SVG expecting one `<path>` element but getting multiple (e.g., SoundCloud's cloud + bars are separate paths), then inlining only one — icon renders as a fragment.

**Why it happens:** Simple Icons normalizes most icons to a single path, but some brand marks with detached elements use multiple paths.

**How to avoid:**
1. Pull the icon from the official simple-icons GitHub repo (`icons/*.svg`) and inspect.
2. For `SocialIcon.tsx`, copy the FULL inner SVG contents (all `<path>` elements) into a per-platform record.
3. Verify visually at 20×20 render size during development.

**Example `SocialIcon` component structure:**
```tsx
// components/ui/SocialIcon.tsx  (Server Component)
// Source: simple-icons CC0 licence; paths from simple-icons/simple-icons@latest
// https://github.com/simple-icons/simple-icons/tree/develop/icons

const ICON_PATHS: Record<Platform, string> = {
  instagram: 'M12 0C8.74...', // full path
  soundcloud: 'M23.999...',
  beatport: 'M...',
  youtube: 'M23.498...',
  tiktok: 'M12.525...',
  facebook: 'M9.101 23...',
};

const LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  soundcloud: 'SoundCloud',
  beatport: 'Beatport',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

type Platform = 'instagram' | 'soundcloud' | 'beatport' | 'youtube' | 'tiktok' | 'facebook';

export default function SocialIcon({
  platform,
  url,
}: {
  platform: Platform;
  url: string | null | undefined;
}) {
  // D-12: render null when URL is empty/undefined
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${LABELS[platform]} — Marginalia`}
      className="inline-flex items-center justify-center p-3 text-[--color-text-secondary] hover:text-[--color-accent-lime] transition-colors"
      /* p-3 = 12px on 20px icon = 44px total touch target per D-13 */
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={ICON_PATHS[platform]} />
      </svg>
    </a>
  );
}
```

**Warning signs:** Icon appears truncated, missing elements, or wrong shape at render.

### Pitfall 8: Forgetting `aria-current="page"` on Active Nav Link

**What goes wrong:** Visually active link has the lime border, but assistive tech (screen readers) treats every link identically — no "current page" announcement.

**Why it happens:** Developers implement visual active state but skip the ARIA attribute.

**How to avoid:** In `NavLinks`, when `isActive`, set `aria-current="page"` on the `<Link>` (see Pattern 3 code).

**Warning signs:** axe DevTools flags "No current page indicator"; VoiceOver/NVDA reads each link the same way.

---

## Code Examples

### globals.css (full replacement per UI-SPEC)

See UI-SPEC lines 278-382 for the authoritative block. Recommended amendments:
1. Change `body { overflow-x: hidden }` → `overflow-x: clip` with `@supports not` fallback (Pitfall #2).
2. Optional: Add an `html { color-scheme: dark }` so browser UI (form controls, scrollbar) matches dark theme.

```css
/* Source: UI-SPEC.md with planner-approved amendments */
@import "tailwindcss";

/* ─── Nimbus Sans Self-Hosted Font ─────────────────────────── */
@font-face {
  font-family: 'Nimbus Sans';
  src: url('/fonts/NimbusSans-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Nimbus Sans';
  src: url('/fonts/NimbusSans-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  /* ...UI-SPEC block verbatim, lines 298-355... */
}

html { color-scheme: dark; }  /* NEW — matches dark theme for UA controls */

/* ... base rules per UI-SPEC ... */

body {
  min-height: 100vh;
  overflow-x: clip;  /* AMENDED from hidden — preserves position: sticky */
  background-color: var(--color-bg);
}
@supports not (overflow-x: clip) {
  body { overflow-x: hidden; }
}
```

### app/layout.tsx (updated)

```tsx
// Source: CONTEXT.md + UI-SPEC.md + nextjs.org/docs/app/api-reference/file-conventions/layout
import type { Metadata } from 'next';
import './globals.css';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Marginalia — Melodic House & Techno Label',
  description: 'Barcelona-based label for melodic house and techno.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Optional: preload hero fonts to improve LCP — see Pattern 2 */}
        <link rel="preload" href="/fonts/NimbusSans-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/NimbusSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-[--color-text-primary]">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
```

Note: `app/layout.tsx` does NOT need to be `async`. React Server Components can render an `async` child (`<SiteFooter />`) from a non-async parent. The parent composes synchronously; the child suspends independently.

### MobileMenu skeleton (animation + a11y)

```tsx
// components/layout/MobileMenu.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavLink = { href: string; label: string };

export default function MobileMenu({
  links,
  className = '',
}: {
  links: readonly NavLink[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on pathname change (link click navigates)
  useEffect(() => setOpen(false), [pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-nav-overlay"
        className="p-3 text-[--color-text-primary]"
      >
        {/* 3-line or X icon, 24x24 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" />
          )}
        </svg>
      </button>
      <div
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-[--color-bg] transition-all duration-200 ease-in-out ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="pt-[var(--nav-height-mobile)] px-5 flex flex-col gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-heading font-bold text-[--color-text-primary] ${
                pathname === href ? 'text-[--color-accent-lime]' : ''
              }`}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `theme.extend` | `@theme {}` in CSS | Tailwind v4.0 (Jan 2025) | No JS config file; tokens are pure CSS; faster builds |
| `tailwind.config.js` `fontFamily` mapping | `--font-*` variable under `@theme {}` | Tailwind v4.0 | `font-sans` utility driven by CSS variable |
| Google Fonts CDN links in `<head>` | `next/font/google` with `variable` prop | Next.js 13.2 (2023) | Zero external network; build-time self-hosting |
| Local font via manual `@font-face` | `next/font/local` with `variable` prop | Next.js 13.2 (2023) | Auto preload; zero CLS via size-adjust. **UI-SPEC locks `@font-face`; tradeoff accepted.** |
| `useFormState` from `react-dom` | `useActionState` from `react` | React 19 (2024) | Same API, canonical location. Not used in Phase 2 but relevant for Phase 6. |
| `output: 'export'` for static sites | ISR + `generateStaticParams` | Next.js 13+ | Full SSG with API routes intact (required for Keystatic admin). |
| `@cloudflare/next-on-pages` | `@opennextjs/cloudflare` | Cloudflare/OpenNext collaboration, 2024 | Node.js runtime enables Keystatic. Already done in Phase 1. |

**Deprecated/outdated:**
- `tailwind.config.js` — v3 maintenance only, v4 is the direction.
- Manual `<link href="https://fonts.googleapis.com">` in App Router — replaced by `next/font`.
- `useFormState` from `react-dom` — renamed to `useActionState` in React 19.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `readOrThrow()` throws synchronously when the YAML file is absent (not just when a field is null) | Pitfall #3, User Constraints amendment | LOW — even if it silently returns null, the `read()` + fallback recommendation is strictly safer. |
| A2 | Simple Icons' SoundCloud and Beatport brand marks are single-path SVGs | Pitfall #7 | LOW — if multi-path, copy all paths per platform. Verified visually during implementation. |
| A3 | OpenNext Workers adapter serves `public/fonts/*.woff2` at `/fonts/*.woff2` without config changes | Architecture Diagram | LOW — wrangler.jsonc from Phase 1 declares `assets: { directory: ".open-next/assets" }`; OpenNext copies `public/` into assets automatically. If wrong, a small wrangler.jsonc tweak suffices. |
| A4 | `font-display: swap` provides acceptable "no flash of invisible text" UX while fonts load | Pattern 2 | LOW — universal browser support; UI-SPEC explicitly chose `swap`. |
| A5 | `overflow-x: clip` is supported in all target browsers (Chrome 90+, Safari 16+, Firefox 81+) | Pitfall #2 | LOW — 95%+ coverage as of 2025; `@supports not` fallback to `hidden` handles the rest. |
| A6 | Next.js 16 + React 19 + Tailwind v4 + Keystatic 0.5.x combination works together (validated by Phase 1 success) | Stack | LOW — Phase 1 built and deployed successfully; this is the project's already-working baseline. |

---

## Open Questions

1. **Should D-14 be amended to use `read()` + fallback instead of `readOrThrow()`?**
   - What we know: `content/site-config.yaml` does not yet exist; `readOrThrow()` will crash the root layout on every route until it is seeded.
   - What's unclear: Whether the user prefers (a) graceful fallback in code, or (b) a pre-flight acceptance criterion requiring the YAML to exist before execution.
   - Recommendation: Planner should present this to the user during plan-check or discuss-phase; recommend option (a) for robustness. If the user prefers (b), plan must include a step: "user opens /keystatic, saves siteConfig, commits content/site-config.yaml."

2. **Should the UI-SPEC `body { overflow-x: hidden }` rule be amended to `clip` with `hidden` fallback?**
   - What we know: `hidden` can break sticky positioning; `clip` does not; broad 2025 browser support.
   - What's unclear: Whether the UI-SPEC is immutable (no amendments permitted) or whether research-surfaced safety improvements can be applied.
   - Recommendation: The UI-SPEC is listed as "final" in D-09 only for the `@font-face` declarations. The rest may be amended with planner authority. Apply the `clip` fix with `@supports` fallback.

3. **Should `app/layout.tsx` include `<link rel="preload">` for the woff2 files?**
   - What we know: `next/font/local` does this automatically; `@font-face` does not. Manual preload recaptures most of the LCP benefit.
   - What's unclear: None — this is purely additive and risk-free.
   - Recommendation: YES, add the two preload tags in `<head>`. Pattern 2 shows the code.

4. **Is the Incubation footer group just anchors with `aria-disabled="true"` or actual `<span>` elements?**
   - What we know: UI-SPEC (line 189 and 261) says "href='#' with aria-disabled='true'" and CONTEXT says aria-disabled anchors without "(coming soon)" text.
   - What's unclear: Whether `aria-disabled` on a real `<a href="#">` is preferable to a styled `<span>` (the latter is more semantically honest for "not yet a link").
   - Recommendation: Use `<span aria-disabled="true" className="cursor-not-allowed opacity-40">`. More accurate semantics. If the user prefers clickable anchors that navigate nowhere, switch to `<a href="#" aria-disabled="true" onClick={e => e.preventDefault()}>` (Client Component only).

---

## Environment Availability

Phase 2 is purely code/CSS changes — no external tools or services are invoked at execution time.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js build | ✓ (assumed from Phase 1) | per Phase 1 | — |
| npm | package operations | ✓ (assumed from Phase 1) | per Phase 1 | — |
| `public/fonts/NimbusSans-Regular.woff2` | `@font-face` rule | ✗ (file not placed) | — | Browser falls back to 'Helvetica Neue' / Arial / sans-serif per `--font-sans` stack |
| `public/fonts/NimbusSans-Bold.woff2` | `@font-face` rule | ✗ (file not placed) | — | Browser uses regular weight faux-bold |
| `content/site-config.yaml` | `SiteFooter` reader call | ✗ (file does not exist) | — | With `read()` + fallback: site renders with hardcoded tagline + empty social icons. With `readOrThrow()`: **crashes every route** |
| Client logo SVG file | `Logo.tsx` inline SVG | ✗ (file not provided yet — D-01 says "available before execution") | — | Wordmark fallback (Nimbus Sans Bold "Marginalia") |

**Missing dependencies with no fallback:**
- None that block execution. All missing items have either an explicit graceful-fallback plan (fonts → system stack; logo → wordmark; site-config → hardcoded defaults) or manual placement step (fonts, logo file).

**Missing dependencies with fallback:**
- All three font/logo/site-config cases above.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — project has no test runner in `package.json` |
| Config file | none |
| Quick run command | `npm run dev` (manual verification in browser) |
| Full suite command | `npm run build && npx @opennextjs/cloudflare build` (build-time verification) |
| Phase gate | All acceptance criteria pass manual verification at 375/768/1024/1440 viewports |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSYS-01 | No `tailwind.config.js`; `@theme {}` in globals.css | file-check | `test ! -f tailwind.config.js && grep -q '@theme' app/globals.css` | — |
| DSYS-02 | Neutral dark base; `--color-bg: #1F1F21` | file-check | `grep -q 'color-bg:.*#1F1F21' app/globals.css` | — |
| DSYS-03 | Body 16px on mobile; Nimbus Sans Bold for headings | manual | Open `/`, DevTools → Computed styles on `<body>` and an `<h1>` | — |
| DSYS-04 | No broken layout 375–1440px | manual | Chrome DevTools responsive mode, test at 375 / 768 / 1024 / 1440 | — |
| DSYS-05 | Nav + Footer rendered on every page | file-check + manual | `grep -q 'SiteNav' app/layout.tsx && grep -q 'SiteFooter' app/layout.tsx` | — |
| D-12 (implicit) | `SocialIcon` renders null when URL empty | manual | Save siteConfig with only Instagram URL → only Instagram icon appears in footer | — |
| D-06 (implicit) | `"use client"` only on NavLinks + MobileMenu | file-check | `grep -l 'use client' components/layout/ components/ui/` returns only NavLinks.tsx + MobileMenu.tsx | — |

### Sampling Rate
- **Per task commit:** Build check — `npm run build` exits 0
- **Per wave merge:** Full manual verification across 4 viewports + DevTools console clear of errors
- **Phase gate:** All 5 DSYS success criteria confirmed; no hydration errors; no 404s on fonts (if placed); footer renders with fallback tagline when YAML absent

### Wave 0 Gaps
- [ ] No automated test runner installed. Phase 2 relies on manual browser verification. Plan should NOT block on this (out of phase scope), but a future phase could introduce Playwright for layout regression.
- [ ] No `public/fonts/` directory exists. Plan must either (a) include `mkdir public/fonts` step, or (b) document that the user creates it before placing woff2 files.

*(No test framework install needed in Phase 2 — layout shell is visually verified.)*

---

## Security Domain

Phase 2 has no authentication, session management, data mutation, or network requests beyond font/asset loading. Security posture is minimal and limited to XSS prevention and link hygiene.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V1 Architecture | yes (lightly) | Server Components for data access (SiteFooter); no reader API exposed to client |
| V2 Authentication | no | Phase 2 has no auth surface |
| V3 Session Management | no | Phase 2 has no sessions |
| V4 Access Control | no | Phase 2 has no access controls |
| V5 Input Validation | no | Phase 2 accepts no user input |
| V6 Cryptography | no | Phase 2 makes no cryptographic operations |
| V7 Error Handling | yes | `read()` + fallback prevents crash on missing YAML; no stack traces leaked to user |
| V8 Data Protection | no | No sensitive data handled |
| V11 Business Logic | no | No business logic in Phase 2 |
| V14 Configuration | yes | External links use `rel="noopener noreferrer"` on `target="_blank"` |

### Known Threat Patterns for Next.js 15 App Router + Tailwind v4

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| `target="_blank"` tabnabbing | Tampering | All external links in `SocialIcon` and Incubation footer group include `rel="noopener noreferrer"` |
| Reader API leak to client bundle | Information Disclosure | `lib/keystatic.ts` imports `@keystatic/core/reader` — only consumed in Server Components; Phase 1 already established this boundary |
| SVG injection | Tampering | Inline SVG paths are hardcoded constants (not user-supplied); no `dangerouslySetInnerHTML` anywhere |
| CSP / inline styles | Tampering | Tailwind-generated styles are compiled, not inline; no style-src hash/nonce concerns |
| Clickjacking | Tampering | Not phase-relevant; would be addressed globally in Phase 7 via `X-Frame-Options` or CSP `frame-ancestors` |

**Verdict:** Phase 2 introduces no new attack surface beyond standard outbound-link hygiene (already handled).

---

## Project Constraints (from CLAUDE.md)

No `./CLAUDE.md` exists at the project root [VERIFIED: `find -name CLAUDE.md` returns only node_modules matches]. The only authoritative project guidance comes from:
- `.planning/STATE.md` — critical decisions (Tailwind v4 CSS-first, `"use client"` leaf-only rule, local Keystatic mode)
- `.planning/REQUIREMENTS.md` — DSYS-01 through DSYS-05
- `.planning/phases/02-design-system-layout-shell/02-CONTEXT.md` — Phase 2 locked decisions
- `.planning/phases/02-design-system-layout-shell/02-UI-SPEC.md` — UI design contract

All four are referenced throughout this research. No additional CLAUDE.md directives apply.

---

## Sources

### Primary (HIGH confidence — Context7 or official docs)
- `/tailwindlabs/tailwindcss.com` via Context7 — `@theme` directive, namespaces, `--spacing` semantics, `@font-face` custom font pattern (queried: "theme directive", "custom spacing scale arbitrary", "font-face self-hosted font-sans")
- `/websites/nextjs` via Context7 — `usePathname`, `next/font/local`, async Server Components, Client/Server boundary patterns, `generateStaticParams` (queried: "usePathname app router", "localFont woff2 subsets preload", "use client boundary server component children pattern")
- `https://keystatic.com/docs/reader-api` — `read()` for singletons and collections; Node.js runtime requirement; confirms `reader.singletons.X.read()` pattern
- `https://github.com/simple-icons/simple-icons` — CC0-1.0 license confirmed; viewBox="0 0 24 24"; all 6 required brands present (Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook)
- `https://w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html` — 44×44px target size (WCAG 2.5.5 AAA)
- `npm view` registry queries — all package versions verified 2026-04-22

### Secondary (MEDIUM confidence — community docs verified against primary)
- [Getting stuck: all the ways position:sticky can fail — Polypane](https://polypane.app/blog/getting-stuck-all-the-ways-position-sticky-can-fail/) — `overflow: hidden` vs `clip` sticky interaction
- [CSS 'position: sticky' not working? Try 'overflow: clip' — Terluin Web Design](https://www.terluinwebdesign.nl/en/blog/position-sticky-not-working-try-overflow-clip-not-overflow-hidden/)
- [Apply custom font family tailwindcss v4 / Next.js 15 — Tailwind GitHub Discussion #15923](https://github.com/tailwindlabs/tailwindcss/discussions/15923) — CSS variable + `<html>` element hierarchy for font resolution in Tailwind v4
- [Using Custom Fonts in Next.js + Tailwind CSS V4 — Medium (Divine Oseh Omo)](https://medium.com/@divineosehotue/using-custom-fonts-in-next-js-tailwind-css-v4-a37057b18f7f)
- [Add custom fonts to Next.js sites with Tailwind using next/font — Mike Bifulco](https://mikebifulco.com/posts/custom-fonts-with-next-font-and-tailwind) — `next/font/local` with `variable` prop pattern

### Tertiary (LOW confidence — flagged for validation if challenged)
- None — every material claim is backed by either Context7 or an official source.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry; stack is Phase-1-proven
- Architecture / patterns: HIGH — Tailwind v4 `@theme`, Next.js `usePathname`, async Server Components all Context7-verified
- Pitfalls: HIGH — sticky/overflow issue verified across 3 sources; missing YAML crash verified by filesystem check; token namespace issue verified in Context7
- User Constraints interpretation: HIGH — all D-01 through D-15 copied verbatim from CONTEXT.md with one research-surfaced amendment to D-14 (flagged, not applied unilaterally)

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (30 days — stable stack; Tailwind v4 is mature, Next.js 16.2 is current stable, Keystatic 0.5.x line is active but schema-stable)

**File:** `.planning/phases/02-design-system-layout-shell/02-RESEARCH.md`

---

*Phase 2 research complete. Ready for `/gsd-plan-phase 2`.*
