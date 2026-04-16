# Project Research Summary

**Project:** Marginalia — Music Label Website
**Domain:** Indie electronic music label (melodic house & techno / indie dance)
**Researched:** 2026-04-04
**Confidence:** HIGH

---

## Executive Summary

Marginalia is a Barcelona-based label that needs a purpose-built hub to replace its Squarespace site: a content-managed, artwork-driven platform that feels like a record label, not a portfolio. The research is clear that the right approach is Next.js 15 App Router with static generation (SSG), Keystatic as a git-native CMS with zero external services, and Cloudflare Workers for free-tier commercial hosting. Every content page should be pre-rendered at build time from YAML files committed to the repo. Interactive elements — audio embeds, forms — layer on top as client islands.

The one non-obvious constraint that shapes the entire project: **Keystatic's GitHub OAuth flow has a confirmed bug on Cloudflare Workers (issue #1497, unresolved as of April 2026).** This means GitHub mode cannot be used for production content editing. The correct v1 workflow is local-mode editing on localhost, committing content files to git, and letting Cloudflare Workers rebuild automatically on push. This is a workflow change, not a blocker — the public site is unaffected. It should be documented clearly before content entry begins.

The critical path risk is schema design. Keystatic has no migration tooling. Every content file is a YAML/JSON flat file — changing the schema after content is entered means editing every file by hand. The schema must be finalized in Phase 1 before any content is touched, including all optional fields that might be needed later (catalog number, sort order, featured flag, genre tags, all platform URLs). Getting this right upfront is the highest-leverage decision in the entire project.

---

## Key Findings

### Recommended Stack

The stack is tightly constrained by two requirements: zero paid infrastructure, and Keystatic CMS. Keystatic's Reader API requires Node.js filesystem access, which rules out Edge runtime deployments. `@opennextjs/cloudflare` (Cloudflare Workers with Node.js compat) is the only free-tier hosting option that satisfies both the commercial-use requirement and the Node.js runtime requirement. Vercel Hobby is prohibited for commercial use. `@cloudflare/next-on-pages` (Cloudflare Pages) is deprecated. These are not preferences — they are the only viable path.

Tailwind v4 is the correct choice: CSS-first config via `@theme {}` with no `tailwind.config.js`, significantly faster builds, and container queries built-in. Forms use React Hook Form + Zod + `useActionState` (React 19 API) bound to server actions via `action=` prop. Email splits across two free services: Resend for transactional (form confirmations) and Brevo for newsletter list management — neither tool can replace the other on free tiers.

**Core technologies:**
- **Next.js 15.x** — App Router, React 19, stable server actions, SSG with `generateStaticParams`; stay on 15.x (16 not yet confirmed compatible with Keystatic)
- **TypeScript 5.x** — Keystatic exports `Entry<>` generic for fully typed content; use throughout
- **Tailwind CSS v4** — CSS-first config (`@theme {}`); dark-first baseline; no `tailwind.config.js`; do not use `dark:` variant system (no light mode needed)
- **Keystatic 0.5.x** — local mode in development; GitHub mode blocked by issue #1497 on Workers; v1 workflow is local-edit → git push → Workers rebuild
- **@opennextjs/cloudflare** — replaces deprecated `@cloudflare/next-on-pages`; runs on Workers (not Pages); supports Node.js, image optimization, and ISR
- **Resend ^4.x** — transactional email only; 3,000/month free; import via `server-only`
- **Brevo** — newsletter list management; 300 emails/day, unlimited contacts; API-based (no embedded form HTML)
- **react-hook-form ^7.x + zod ^3.x** — form state + server-side validation; use `useActionState` with `action=` on `<form>`, not `onSubmit`
- **react-lite-youtube-embed** — YouTube facade (saves ~1.5MB per embed); always `next/dynamic({ ssr: false })`
- **server-only** — enforce server boundary; add to any module with API keys or Reader API calls

### Expected Features

The full feature set maps directly to what credible independent electronic labels publish. Every item below is expected by fans, press, and industry contacts who land on the site. Nothing exotic is required for v1.

**Must have (table stakes):**
- Release catalog with artwork grid + embedded audio + buy/stream links per release (Beatport, SoundCloud, Spotify)
- Artist roster with individual pages: bio, photo, releases, social links
- About page — ELIF's story and the Marginalia concept ("uninhibited creativity in blank spaces")
- Podcast / mix archive with SoundCloud embeds per episode
- Press page with coverage list and EPK download link
- Showcases — past and upcoming events
- Demo submission form — streaming links only (SoundCloud/Bandcamp/Dropbox); no file uploads
- Newsletter signup in footer — Brevo API via server action; no Mailchimp embedded HTML
- Management contact form — separate from demo form
- Merch — navigation link to existing store (no embed, no checkout)
- Mobile-responsive dark design — 90%+ of music discovery is mobile
- Social links — Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook

**Should have (competitive differentiators):**
- Beatport "Hype Label of the Month (March 2025)" accolade surfaced on homepage
- Per-release platform links with distinct CTAs (Buy on Beatport, Listen on SoundCloud)
- Editorial release notes/blurbs in the catalog — makes the site read like a label, not a portfolio
- Press quote pull-outs on homepage or about page (2-3 strong quotes)
- SEO: `MusicAlbum`, `MusicGroup`, `PodcastEpisode`, `Event` JSON-LD structured data
- Open Graph images using release artwork (critical for social sharing)
- `sitemap.xml` generated from CMS content

**Defer to v2:**
- Genre/mood filtering in catalog — add when catalog exceeds ~20 releases
- Persistent cross-page audio player — high architectural cost, low v1 ROI
- Artist portal / demo status tracking — requires auth layer
- Showcase video recap embeds — add when YouTube content exists
- Mix & Mastering booking / Production Lessons — Squarespace covers this now

**Anti-features — do not build:**
- File upload on demo form (use streaming links only)
- Auto-playing audio
- Embedded merch checkout (link out)
- Live social feed pull (link out)
- Star ratings or fan reviews

### Architecture Approach

The architecture is SSG-heavy: all public content pages pre-rendered at build time from Keystatic YAML files via `generateStaticParams`. Client components are islands only — `"use client"` on interactive leaf nodes (embeds, forms), never on page-level components. All audio/video embeds load client-side only via `next/dynamic({ ssr: false })` to prevent hydration errors. Server actions handle all form submissions with server-side Zod validation before any email or data operation. A single `reader` instance in `lib/keystatic.ts` is shared across all server components.

**Major components:**
1. **Server Pages** (`app/**/page.tsx`) — async Server Components; fetch via Keystatic reader; pass typed props to UI components; never `"use client"`
2. **Keystatic Admin** (`app/keystatic/[[...params]]/page.tsx`) — requires Node.js runtime; local mode only for v1; do not expose in production without Node compat flag
3. **Embed Components** (`components/embeds/`) — `'use client'`; always wrapped in `next/dynamic({ ssr: false })` at usage site; SoundCloudEmbed, SpotifyEmbed, LiteYouTubeEmbed
4. **Server Actions** (`app/*/actions.ts`) — `'use server'`; Zod validation first; Resend for transactional email; Brevo API for newsletter; `server-only` import on all action files with API keys
5. **Layout Shell** (`app/layout.tsx`) — nav, footer, font loading, global CSS; `color-scheme: dark` at root; no `dark:` variants

**Content model (Keystatic collections):** `releases`, `artists`, `podcasts`, `press`, `showcases`

**Content model (Keystatic singletons):** `homePage`, `aboutPage`, `siteSettings`

**Route rendering strategy:**

| Route | Rendering |
|-------|-----------|
| `/`, `/about`, `/releases`, `/artists`, `/podcasts`, `/press`, `/showcases`, `/merch` | SSG |
| `/releases/[slug]`, `/artists/[slug]` | SSG + `generateStaticParams` |
| `/demo`, `/subscribe`, `/management` | Dynamic (Server Actions) |
| `/keystatic/[...]` | Dynamic (Node.js runtime required) |

### Critical Pitfalls

1. **Vercel Hobby commercial use prohibition** — Marginalia is a commercial label; Vercel Hobby bans commercial use. Use Cloudflare Workers free tier (`@opennextjs/cloudflare`) from day one. Never deploy production to Vercel Hobby. Address in Phase 1 before first deploy.

2. **Keystatic GitHub OAuth bug on Cloudflare Workers (issue #1497)** — OAuth state generation fails on Workers; GitHub mode cannot be used for CMS editing in production. v1 mitigation: local mode on localhost, push content via git. Monitor the issue for a fix. Do not block launch on this — the public site is unaffected. Address in Phase 1 as a documented workflow decision.

3. **Content schema lock-in** — Keystatic has no migration tooling. Changing a schema field after content is entered requires editing every YAML file manually. The schema must be 100% finalized — including optional fields — before any content is entered. One wrong choice here can cost hours of manual remediation. Address in Phase 1 before touching content.

4. **Audio embed hydration mismatches** — SoundCloud and Spotify iframes cause React hydration errors if server-rendered. Rule: every embed component uses `next/dynamic({ ssr: false })`. No exceptions. Address in Phase 3 when embeds are first integrated; verify with zero console hydration warnings.

5. **Static export incompatibility** — `output: 'export'` in `next.config.ts` breaks Keystatic (no API routes) and server actions. Do not use it. Use OpenNext + Workers which supports mixed rendering. Address in Phase 1.

6. **Keystatic image path misconfiguration** — `directory` and `publicPath` in image fields must be coordinated exactly; mismatch causes broken images in production with no build error. Test the full workflow (upload → check filesystem → verify on frontend) during Phase 1 CMS setup.

7. **`"use client"` on page-level components** — wrapping entire pages loses SSR, SEO, and streaming. Client components should only be interactive leaf nodes. Establish this convention in Phase 2 and enforce it throughout.

---

## Implications for Roadmap

The phase order is driven by two hard constraints: (a) the schema must be locked before content entry, and (b) embeds and forms can only be built after the pages they live on exist. Everything else flows from there.

### Phase 1: Infrastructure and Schema Foundation

**Rationale:** Every subsequent phase depends on the hosting config being correct and the Keystatic schema being final. These decisions are expensive to reverse. Get them right first, before any content is entered or any UI is built.

**Delivers:**
- Next.js 15 project scaffolded with TypeScript, Tailwind v4, `@opennextjs/cloudflare`, Wrangler
- `wrangler.jsonc` configured with `nodejs_compat` and `global_fetch_strictly_public` flags
- `keystatic.config.ts` with fully designed schema: all 5 collections (releases, artists, podcasts, press, showcases) and 3 singletons (homePage, aboutPage, siteSettings)
- `lib/keystatic.ts` reader singleton
- Image field paths tested end-to-end (upload → filesystem → frontend)
- `globals.css` with Tailwind v4 `@theme {}` color tokens and dark baseline
- Cloudflare Workers deploy pipeline working (even if site is just a placeholder)
- CMS workflow documented: local mode → git push → Workers rebuild

**Pitfalls addressed:** Vercel commercial use (#1), Keystatic OAuth bug (#2), schema lock-in (#3), static export incompatibility (#5), image path misconfiguration (#6)

**Research flag:** No additional research needed — patterns are well-documented and decisions are firm.

---

### Phase 2: Layout and Design System

**Rationale:** Establish the visual language and shared shell before building any content pages. Nav, footer, typography, and spacing tokens are used by every page — doing this first prevents rework.

**Delivers:**
- `app/layout.tsx` with Nav and Footer shells (with real navigation items and social links wired to `siteSettings` singleton)
- Typography scale, color tokens, and spacing system in `@theme {}`
- `ReleaseCard` and `ArtistCard` component primitives (visual design established)
- Dark-first baseline (`color-scheme: dark`; `bg-label-black text-label-white` on body)
- Reusable layout components: grids, section wrappers, heading styles
- 404 page (`not-found.tsx`) with label branding
- Favicon, apple-touch-icon, site.webmanifest

**Pitfall addressed:** Server/client component boundary convention established here — document that `"use client"` never goes on page-level components.

**Research flag:** No additional research needed — Tailwind v4 and Next.js App Router patterns are well-documented.

---

### Phase 3: Releases and Artists (Core Content)

**Rationale:** Releases and artists are the core identity of a label site. They are also the most complex pages (embeds, relations, image-heavy) and everything else references them. Build these before secondary content pages.

**Delivers:**
- `/releases` catalog grid — artwork-first, responsive (2→3→4→5 columns), hover reveals
- `/releases/[slug]` detail pages — cover art, metadata, SoundCloud/Spotify/YouTube embeds, Beatport link, editorial note
- `/artists` roster grid
- `/artists/[slug]` profile pages — photo, bio, releases list, social links
- `SoundCloudEmbed`, `SpotifyEmbed`, `LiteYouTubeEmbed` components (all `next/dynamic({ ssr: false })`)
- `generateStaticParams` on both `[slug]` routes
- `generateMetadata` with Open Graph (release artwork as OG image) on both content types
- JSON-LD: `MusicAlbum` on release pages, `MusicGroup`/`Person` on artist pages
- `next/image` with correct `sizes` prop and `priority` on first visible image

**Pitfall addressed:** Audio embed hydration (#4) — zero hydration warnings required before moving on.

**Research flag:** No additional research needed — embed patterns and image optimization are well-documented in STACK.md.

---

### Phase 4: Secondary Content Pages

**Rationale:** Podcasts, press, and showcases are table-stakes for a credible label site but have simpler implementations than releases. Build them after the core content pattern is established.

**Delivers:**
- `/podcasts` — episode list with SoundCloud embeds, episode metadata
- `/press` — coverage list, excerpt pull-quotes, EPK download link
- `/showcases` — past and upcoming events, venue/city/date
- `/about` — ELIF's story, label philosophy, Beatport "Hype Label" accolade, press quote pull-outs
- Home page (`/`) — hero, featured releases grid, artist roster teaser, newsletter signup, press quote
- `/merch` — navigation link out to existing store
- `generateMetadata` and JSON-LD (`PodcastEpisode`, `Event`) on each page type

**Research flag:** No additional research needed — these are standard static content pages.

---

### Phase 5: Forms and Email

**Rationale:** Forms depend on server actions, email services, and validation logic. Build after pages exist so forms can be tested in context.

**Delivers:**
- `/demo` — Demo submission form: artist name, email, streaming link (required), genre description, optional bio/social/notes; Resend confirmation email to submitter; no file upload
- `/subscribe` — Newsletter signup: email only; Brevo API contact addition; success message with value prop copy
- `/management` — Contact form: name, email, message; Resend notification to label
- All forms: `useActionState` + React Hook Form + Zod server-side validation + field-level errors + loading state + success message
- Rate limiting consideration (honeypot fields at minimum; document Upstash Redis as v1.5 option if spam emerges)

**Pitfall addressed:** API keys stay server-side; `server-only` import on all action files.

**Research flag:** No additional research needed — STACK.md has complete form patterns including exact Resend and Brevo API calls.

---

### Phase 6: SEO and Polish

**Rationale:** SEO metadata, structured data, and sitemap can only be completed once all pages exist. Do this last, systematically.

**Delivers:**
- `sitemap.xml` generated from all CMS collections (releases, artists, podcasts, showcases)
- `robots.txt` allowing full crawl
- `generateMetadata` audit — every page has unique title (`[Content] — Marginalia`), description, and OG tags
- Open Graph image verified on all content pages (release artwork, artist photo)
- `summary_large_image` Twitter card on release pages
- JSON-LD audit — all structured data types verified via Google Rich Results Test
- Canonical URL on all pages
- Lighthouse performance score > 90 on release pages (image `sizes` prop, `priority` on first image)
- Loading/error state audit — Suspense boundaries, skeleton fallbacks on embeds
- Mobile responsiveness audit at 375px viewport
- Keystatic admin workflow tested on deployed URL (even if local-mode only in v1)

**Research flag:** No additional research needed — patterns are fully specified in FEATURES.md and PITFALLS.md.

---

### Phase Ordering Rationale

- **Schema before content, infrastructure before schema** — Keystatic schema changes are costly post-content; hosting config must be right before first deploy; this forces Phase 1 first.
- **Design system before pages** — Nav, footer, and token system are shared by every page; doing this in Phase 2 prevents visual inconsistency and rework.
- **Releases before secondary pages** — Releases and artists are the most complex and most important; the embed pattern established in Phase 3 is reused in Phase 4 (podcasts).
- **Forms after pages** — Forms need context; testing a demo form is meaningless without a `/demo` page that looks right.
- **SEO last but not optional** — Structured data and metadata require complete pages to be meaningful; the audit approach in Phase 6 catches gaps systematically.

### Research Flags

**No phases require additional `/gsd:research-phase` during planning.** All technology choices, integration patterns, API calls, and pitfall mitigations are fully documented in the four research files. The research is unusually complete for this stack.

**Phases with well-documented standard patterns (skip research-phase):**
- Phase 1: Infrastructure — wrangler.jsonc config, OpenNext setup, Keystatic local mode all documented with exact config
- Phase 2: Design System — Tailwind v4 `@theme {}` pattern documented; dark-first pattern documented
- Phase 3: Releases/Artists — `generateStaticParams`, `dynamic({ ssr: false })`, `next/image` patterns all documented with code examples
- Phase 4: Secondary Pages — standard SSG pages, no novel patterns
- Phase 5: Forms — complete server action patterns, Resend and Brevo API calls documented with exact code in STACK.md
- Phase 6: SEO — JSON-LD schema types specified per content type in FEATURES.md

**One open issue to monitor (not a blocker):** Keystatic GitHub OAuth bug (issue #1497). Check the Keystatic GitHub repo before Phase 1 is complete — if resolved, update the CMS workflow to GitHub mode for production editing comfort.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology choices verified against official docs, GitHub issues, and Cloudflare engineering blog. Version compatibility table in STACK.md. |
| Features | MEDIUM-HIGH | Competitor analysis + industry sources. Feature set is clear; some v2 scope decisions may shift based on content volume at launch. |
| Architecture | HIGH | Patterns verified against Keystatic and Next.js official docs. Component boundaries and route rendering strategy are well-established. |
| Pitfalls | HIGH | Each pitfall verified via official docs and GitHub issue tracker. Recovery costs assessed. Keystatic OAuth bug confirmed via issue link. |

**Overall confidence: HIGH**

### Gaps to Address

- **Keystatic GitHub OAuth (issue #1497):** Unresolved as of research date. The v1 local-mode workflow is a viable mitigation, but GitHub mode would improve the content editing experience long-term. Check the issue before finalizing the CMS workflow spec in requirements.

- **Git repo image bloat at scale:** Storing release artwork in the repo is acceptable for v1 (up to ~50 releases). Recovery is expensive (history rewriting). Requirements should specify a maximum source image size (1200×1200px, under 500KB) and document that v2 will need external image storage if the catalog grows significantly.

- **Rate limiting on forms:** Demo submission form has no rate limiting specified for v1. Honeypot fields are the minimum; Upstash Redis is the documented option if spam becomes an issue. Flag this in demo form requirements.

- **Keystatic v2 edit workflow:** Once issue #1497 is resolved, the CMS workflow should be updated to GitHub mode so ELIF can edit content on the deployed site without needing a local dev environment. This is a planned v1.5 upgrade, not an architectural change.

---

## Sources

### Primary (HIGH confidence)
- [OpenNext Cloudflare docs](https://opennext.js.org/cloudflare) — OpenNext adapter setup, image optimization, Workers config
- [Cloudflare Workers Next.js guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) — deprecation of next-on-pages confirmed
- [Cloudflare blog: OpenNext deployment](https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/) — official announcement
- [Keystatic installation: Next.js](https://keystatic.com/docs/installation-next-js) — API route requirements, Node.js dependency
- [Keystatic GitHub mode docs](https://keystatic.com/docs/github-mode) — OAuth setup, environment variables
- [Keystatic Reader API](https://keystatic.com/docs/reader-api) — Server component patterns, `Entry<>` type
- [Keystatic issue #1497](https://github.com/Thinkmill/keystatic/issues/1497) — Cloudflare Workers OAuth state bug (opened January 2026, unresolved)
- [Keystatic image field docs](https://keystatic.com/docs/fields/image) — directory and publicPath configuration
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, `@theme`, no tailwind.config.js
- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) — stable server actions, current stable version
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) — commercial use restriction confirmed
- [Resend pricing](https://resend.com/pricing) — 3,000/month, 100/day free tier confirmed

### Secondary (MEDIUM confidence)
- [React Hook Form + Next.js 15 patterns](https://markus.oberlehner.net/blog/using-react-hook-form-with-react-19-use-action-state-and-next-js-15-app-router) — useActionState integration
- [Brevo newsletter API](https://medium.com/@guptagunal/power-up-your-next-js-newsletter-with-brevos-api-2cda549e88b5) — contact list API
- [Keystatic OAuth redirect fix](https://vedantbhagwat.com/blog/fixing-keystatic-oauth-redirect-uri-localhost-error) — proxy header workaround
- [Demo submission industry norms](https://unison.audio/demo-submission/) — streaming link standard confirmed
- [Schema.org MusicAlbum](https://schema.org/MusicAlbum) — structured data fields
- [react-lite-youtube-embed](https://github.com/ibrahimcesar/react-lite-youtube-embed) — facade pattern, 1.5MB saving confirmed
- [Vercel common App Router mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) — server/client boundary pitfalls

---
*Research completed: 2026-04-04*
*Ready for roadmap: yes*
