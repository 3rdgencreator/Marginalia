# Phase 2: Design System & Layout Shell - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase establishes the visual language of the Marginalia site in code. Deliverables:
- Tailwind v4 design tokens in `app/globals.css` under `@theme {}` (colors, spacing, typography)
- Nimbus Sans self-hosted font wiring via `@font-face`
- Five shared layout components: `SiteNav`, `MobileMenu`, `SiteFooter`, `SocialIcon`, `Container`
- `app/layout.tsx` updated to use the new design system and layout shell

This phase does NOT implement any content pages. The nav links and footer quick links render
as placeholder `href="/"` or correct route strings — the pages they link to are built in Phases 3–5.

</domain>

<decisions>
## Implementation Decisions

### Logo Treatment
- **D-01:** The real Marginalia logo SVG file is available (user has it). It will be provided before execution starts (beginning of next shift).
- **D-02:** Logo renders as an **inline SVG component** — a React component that outputs raw `<svg>` JSX. Color controlled via `currentColor` so CSS hover states work. Used in both `SiteNav` and `SiteFooter`.
- **D-03:** Logo file placed at `public/logo.svg`; component at `components/ui/Logo.tsx`.

### Active Nav Link
- **D-04:** Active link detection implemented in Phase 2 using a **thin client wrapper**: a `NavLinks` Client Component that calls `usePathname()` and applies the lime bottom border (`border-b-2 border-[--color-accent-lime]`) to the matching link.
- **D-05:** `SiteNav` itself remains a Server Component. It renders `<NavLinks />` (client) for the primary link list. `MobileMenu` is already a Client Component and handles its own active state inline.
- **D-06:** `"use client"` boundary is on `NavLinks` and `MobileMenu` only — not on `SiteNav`, not on any page component.

### Font File Sourcing
- **D-07:** Nimbus Sans woff2 files are placed **manually by the user** before execution. Executor assumes `public/fonts/NimbusSans-Regular.woff2` and `public/fonts/NimbusSans-Bold.woff2` already exist.
- **D-08:** Executor must include a pre-flight check: if either font file is missing, log a warning in the plan's acceptance criteria noting the manual step, but do NOT fail the build — the site will render with the system fallback until fonts are in place.
- **D-09:** Font Squirrel is the recommended download source (URW Nimbus Sans, free for web use). The `@font-face` declarations in the UI-SPEC are final and must not be modified.

### Social Icon SVGs
- **D-10:** `SocialIcon` uses **Simple Icons SVG paths** — MIT-licensed, inline, no npm package required. SVG `viewBox="0 0 24 24"` paths copied directly into the component for each platform.
- **D-11:** Platforms to implement in Phase 2 (matching `siteConfig` singleton fields): Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook.
- **D-12:** `SocialIcon` renders `null` when its URL prop is empty or undefined — no broken link, no empty icon.
- **D-13:** Icon size: 20×20px. Touch target: 44×44px achieved via padding wrapper (`p-[12px]` on the anchor), not by stretching the SVG.

### Keystatic Reader in Footer
- **D-14:** `SiteFooter` is an **async Server Component** that calls `reader.singletons.siteConfig.readOrThrow()` to pull social URLs and tagline from the Keystatic singleton. No client-side fetching.
- **D-15:** Claude's Discretion: reader import from `lib/keystatic.ts` (already exists from Phase 1 as `createReader` export).

### Claude's Discretion
- CSS implementation details beyond what UI-SPEC specifies (class naming, utility composition)
- Exact TypeScript prop interfaces for each component
- Tailwind v4 utility class patterns for spacing/color tokens
- Nav height implementation (CSS variable + padding vs. fixed-height div)
- MobileMenu animation implementation details (200ms ease-in-out per UI-SPEC)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design Contract
- `.planning/phases/02-design-system-layout-shell/02-UI-SPEC.md` — Complete visual contract: token values, component specs, breakpoints, interaction states, full `@theme {}` CSS block. Executor must implement these values exactly.

### Keystatic Schema & Reader
- `keystatic.config.ts` — `siteConfig` singleton fields (instagramUrl, soundcloudUrl, beatportUrl, youtubeUrl, tiktokUrl, facebookUrl, tagline, siteName)
- `lib/keystatic.ts` — `createReader` export pattern established in Phase 1

### Phase 1 Foundation
- `.planning/STATE.md` — Critical decisions: no `tailwind.config.js`, Tailwind v4 CSS-first, `"use client"` boundary rules

### Requirements
- `.planning/REQUIREMENTS.md` §Design System — DSYS-01 through DSYS-05

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/keystatic.ts`: `createReader` export — use in `SiteFooter` to read `siteConfig`
- `keystatic.config.ts`: `siteConfig` singleton schema defines all social URL field names
- `app/globals.css`: Currently has create-next-app defaults — will be fully replaced in Phase 2

### Established Patterns
- No `components/` directory yet — Phase 2 creates it
- `app/layout.tsx` uses Geist fonts from `next/font/google` — Phase 2 removes this entirely, replaces with Nimbus Sans `@font-face` in globals.css
- Tailwind v4 already installed via `@import "tailwindcss"` in globals.css — just needs the `@theme {}` block populated

### Integration Points
- `app/layout.tsx`: Phase 2 adds `<SiteNav />` and `<SiteFooter />` wrapping `{children}`
- `app/page.tsx`: Placeholder "Coming soon" page — remains as-is in Phase 2 (visual test surface)

</code_context>

<specifics>
## Specific Ideas

- Real Marginalia logo SVG will be provided at start of execution (next shift). Executor must create a `components/ui/Logo.tsx` inline SVG component from the provided file.
- Simple Icons paths verified against simpleicons.org — all 6 platforms (Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook) are available.
- Nav "Incubation" links (Management, Mix & Mastering, Production Classes, Mentoring) appear in footer Column 3 as `aria-disabled="true"` anchors per UI-SPEC — no visible "(coming soon)" text, just `href="#"` with disabled cursor.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-design-system-layout-shell*
*Context gathered: 2026-04-21*
