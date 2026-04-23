# Phase 5: Secondary Content Pages — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 05-secondary-content-pages
**Areas discussed:** Homepage hero, Podcast entries, About page content, Merch page

---

## Homepage Hero

| Option | Description | Selected |
|--------|-------------|----------|
| Typographic | Bold centered label name + tagline on dark background | |
| Artwork background | Featured release cover art fills hero background | |
| Split layout | Text left, large featured artwork right | |
| Video background | YouTube autoplay background (custom, see notes) | ✓ |

**User's choice:** YouTube autoplay video background — desktop 16:9 video and separate mobile 9:16 video, both uploaded as unlisted YouTube videos. Marginalia graphic logo centered as overlay (no text headline).

**Notes:** User specified "will upload a private/unlisted video to YouTube" for both desktop and mobile versions. Schema change needed: add `heroVideoUrl` and `heroVideoMobileUrl` to `homePage` singleton.

---

## Beatport Accolade Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Below hero, before releases | Slim badge/banner between hero and releases grid | ✓ |
| Inside hero, below logo | Small badge beneath Marginalia logo in video overlay | |
| After releases | Comes after releases grid | |

**User's choice:** Below hero, before releases.

---

## Homepage Sections (featured releases + artist teaser)

| Option | Description | Selected |
|--------|-------------|----------|
| Same grid as /releases | Artwork-only square cards, reuse ReleaseCard | ✓ |
| Larger cards, fewer columns | 2-col mobile / 3-col desktop | |
| Horizontal scroll row | Single scrollable row | |

**Featured releases choice:** Same grid as /releases (ReleaseCard reused).

| Option | Description | Selected |
|--------|-------------|----------|
| Photo grid with names | ArtistCard component, photo + name | ✓ |
| Name list only | Text links, no photos | |
| Single featured artist | One large card, others listed below | |

**Artist teaser choice:** Photo grid with names (ArtistCard reused).

---

## Podcast Entries

| Option | Description | Selected |
|--------|-------------|----------|
| List + inline embeds | Embed visible on list page without navigation | |
| Card list → detail pages | Clicking navigates to /podcasts/[slug] | |
| Expandable accordion | Custom (see notes) | ✓ |

**User's choice:** List with accordion expansion — when a podcast is selected, it expands in-place showing artwork on the left and SoundCloud embed on the right. No separate detail pages.

**Notes:** User said "seçilen podcast büyüsün artwork de gözüksün" (selected podcast should grow/expand with artwork visible). Expanded layout: artwork left + SoundCloud player right (side-by-side at md+, stacked on mobile). Only one entry expanded at a time.

---

## About Page Content

| Option | Description | Selected |
|--------|-------------|----------|
| Keystatic singleton | Elif can update bio via admin without code changes | ✓ |
| Static copy in page | Hardcoded in app/about/page.tsx | |
| Static MDX file | content/about.mdx, requires git push to update | |

**User's choice:** Keystatic singleton.

**About page layout:**

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width editorial | Headline + optional photo + body text column | ✓ |
| Two-column: photo left + text right | Same pattern as artist detail pages | |

**User's choice:** Full-width editorial.

**Notes:** New `about` singleton with fields: `headline` (text), `body` (document/rich text), `photo` (optional image).

---

## Merch Page

| Option | Description | Selected |
|--------|-------------|----------|
| Simple page + 'Visit Store' button | Real /merch page with CTA linking to siteConfig.merchUrl | |
| Server redirect | next.js redirect() to siteConfig.merchUrl | |
| Nav link only | No /merch route, nav links directly to external URL | |
| Shopify Storefront iframe | Full Shopify store embedded on /merch | ✓ |

**User's choice:** Shopify Storefront iframe ("direk shopify storum embed ile /merch un içinde olsun" — embed Shopify store directly on /merch).

**Notes:** User confirmed iframe approach when offered Buy Button vs iframe options. Risk noted: Shopify's default theme may block framing via X-Frame-Options. Elif needs to verify her store allows embedding. Fallback "Visit Store" button added if iframe fails.

---

## Claude's Discretion

- Press entry type badge styling
- Showcases past events visual treatment (grayscale, muted opacity, or heading-only)
- Podcast accordion animation style
- Homepage section heading labels
- Pagination / load-more for long lists

## Deferred Ideas

- Persistent audio player (cross-page) — v2
- Free downloads page (/free-downloads) — deferred to later phase
- Press EPK assets download — potential Phase 7 addition
- YouTube/Spotify secondary links on podcast entries — possible enhancement after Phase 5
