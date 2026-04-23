# Phase 5: Secondary Content Pages — Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase builds every remaining content section of the Marginalia site:
- `/` — homepage with YouTube video hero, featured releases grid, Beatport accolade badge, artist roster teaser
- `/podcasts` — accordion list; clicking an entry expands it to show artwork + SoundCloud player in-place
- `/press` — coverage list with publication, headline, date, and external link
- `/showcases` — upcoming and past events as visually distinct groups
- `/about` — Keystatic-managed editorial page with ELIF's story and label philosophy
- `/merch` — Shopify Storefront embedded via iframe

This phase also adds two schema changes (new Keystatic fields):
1. `heroVideoUrl` + `heroVideoMobileUrl` on the `homePage` singleton
2. New `about` singleton with `headline`, `body` (document), and `photo` fields

</domain>

<decisions>
## Implementation Decisions

### Homepage Hero
- **D-01:** Video background hero. Desktop: YouTube iframe (16:9 unlisted video), autoplays muted with loop, no controls. Mobile: a separate YouTube video (9:16 vertical, also unlisted), same autoplay treatment.
- **D-02:** The Marginalia graphic logo (`<Logo>` component) is centered over the video — NOT a text headline. No tagline text overlay.
- **D-03:** The YouTube video URLs are managed via two new `homePage` singleton fields: `heroVideoUrl` (desktop) and `heroVideoMobileUrl` (mobile). Both are optional URL fields.
- **D-04:** The CSS switches between desktop and mobile video using responsive visibility (desktop video hidden on mobile via CSS, mobile video hidden on desktop). Both iframes load their respective video.
- **D-05:** IMPORTANT — YouTube requires videos to be at minimum **unlisted** (not private) for iframe embed to work. Note this in plan acceptance criteria.

### Homepage Sections (below hero)
- **D-06:** Beatport accolade — slim badge/banner section immediately below the hero, before the featured releases grid. Uses `homePage.beatportAccolade` field (already in schema). If the field is empty, this section is omitted.
- **D-07:** Featured releases grid — artwork-only square cards, same visual style as `/releases` catalog grid (Phase 3). Reuse `ReleaseCard` component. Only releases with `featured: true` appear. If no featured releases, section is omitted entirely (no "Coming soon" filler).
- **D-08:** Artist roster teaser — photo grid using `ArtistCard` component (Phase 4). Uses `homePage.featuredArtistSlugs` to filter which artists appear. If `featuredArtistSlugs` is empty, show all artists from the collection.

### Homepage Section Order
Hero video → Beatport badge → Featured releases grid → Artist roster teaser

### Podcasts Page (/podcasts)
- **D-09:** Accordion list — all episodes listed, collapsed by default showing: episode title, artist name, date. Clicking an entry expands it in-place.
- **D-10:** Expanded state layout: artwork (square cover image) on the left, SoundCloud embed + description text on the right. Side-by-side at `md+`. Stacked on mobile (artwork top, embed below).
- **D-11:** SoundCloud embed uses `next/dynamic({ ssr: false })` — only the `SoundCloudEmbed` component (already exists in `components/releases/`) or a similar pattern. `EmbedSkeleton` as loading state.
- **D-12:** Only one entry can be expanded at a time (accordion behavior — opening one closes the previous). This requires a Client Component with `useState` for the active slug.
- **D-13:** Sort order: date descending (newest first).
- **D-14:** No separate `/podcasts/[slug]` detail pages needed — everything on the list page.

### Press Page (/press)
- **D-15:** List of entries, sorted date descending. Each entry shows: headline (linked to `url`), publication name, date, excerpt text (if present). Type badge (Review / Interview / Feature / Chart) is Claude's discretion.
- **D-16:** All links `target="_blank" rel="noopener noreferrer"`.
- **D-17:** No individual press detail pages.

### Showcases Page (/showcases)
- **D-18:** Two sections: "Upcoming" and "Past". Upcoming shown first. If no upcoming events, that section is omitted (not shown as empty).
- **D-19:** Visual distinction between upcoming and past: Claude's discretion — at minimum, separate section headings. Options: grayscale treatment on past cards, or muted border/opacity. Both use the same card component.
- **D-20:** Each event shows: title, venue, city+country, date. Ticket URL → CTA button (upcoming only). Aftermovie URL → YouTube link (past only). Flyer image if available.

### About Page (/about)
- **D-21:** Content from a new `about` Keystatic singleton. Schema fields:
  - `headline` — text (e.g. "About Marginalia")
  - `body` — document field (rich text, same settings as `releases.description`)
  - `photo` — image field, `directory: 'public/images/about'`, `publicPath: '/images/about/'`
- **D-22:** Layout: full-width editorial. Headline at top. Optional photo of Elif below headline (if set). Rich text body below photo. Constrained reading column width (max ~65ch or use `prose` class).
- **D-23:** `body` is rendered via Keystatic `DocumentRenderer` component — same approach as release descriptions.
- **D-24:** If `body` is empty (singleton not yet filled), show a graceful placeholder: page renders with the headline only, no broken state.

### Merch Page (/merch)
- **D-25:** `/merch` is a real Next.js page (not a redirect). It embeds the Shopify store via a full `<iframe>` using `siteConfig.merchUrl` as the `src`.
- **D-26:** IMPORTANT — Shopify's default storefront may block framing via `X-Frame-Options: DENY`. Elif must check that her Shopify store allows embedding (via Shopify admin settings or custom theme). Note this risk in plan acceptance criteria.
- **D-27:** Iframe should be full-width and tall (min-height 80vh or similar). Falls back gracefully: if `siteConfig.merchUrl` is empty, show "Merch store coming soon" placeholder text instead of a broken iframe.
- **D-28:** The `siteConfig.merchUrl` field is already in the Keystatic schema from Phase 1 — no schema change needed for merch.

### Schema Changes
- **D-29:** `keystatic.config.ts` — add to `homePage` singleton:
  - `heroVideoUrl: fields.url({ label: 'Hero Video URL (desktop 16:9)', description: 'Unlisted YouTube URL for desktop hero background' })`
  - `heroVideoMobileUrl: fields.url({ label: 'Hero Video URL (mobile 9:16)', description: 'Unlisted YouTube URL for mobile portrait hero background' })`
- **D-30:** `keystatic.config.ts` — add new `about` singleton:
  - Path: `content/about`
  - Fields: `headline` (text), `body` (document, formatting+links), `photo` (image, directory `public/images/about`, publicPath `/images/about/`)

### Claude's Discretion
- Press entry type badge styling (color coding per type, or plain text label)
- Showcases past events visual treatment (grayscale vs muted opacity vs no visual change beyond section heading)
- Exact podcast accordion animation (CSS transition on max-height, or instant toggle)
- Homepage section headings ("Releases", "Artists" labels, or no headings — artwork speaks for itself)
- Pagination or load-more for podcasts/press/showcases lists (if collection grows large, implement simple load-more or show all — no requirement set)
- About page photo aspect ratio and position (square, 16:9 banner, or free-form)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Keystatic Schema (source of truth)
- `keystatic.config.ts` — all collection and singleton schemas. Phase 5 adds `heroVideoUrl`, `heroVideoMobileUrl` to `homePage` singleton and a new `about` singleton.

### Keystatic Reader Pattern
- `lib/keystatic.ts` — `reader` export; use `reader.singletons.X.readOrThrow()` for singletons, `reader.collections.X.list()` / `reader.collections.X.read(slug)` for collections.

### Existing Components (reuse, don't recreate)
- `components/releases/ReleaseCard.tsx` — artwork-only square card for releases grid
- `components/artists/ArtistCard.tsx` — photo + name card for artist teaser
- `components/releases/SoundCloudEmbed.tsx` — SoundCloud player (already `next/dynamic ssr:false`)
- `components/releases/EmbedSkeleton.tsx` — loading skeleton for embeds
- `components/layout/Container.tsx` — max-width wrapper for all new pages
- `components/ui/Logo.tsx` — Marginalia logo for hero overlay

### Design System Tokens
- `app/globals.css` — all `--color-*`, `--text-*`, `--space-*` tokens. Use `(--color-*)` syntax (Tailwind v4 — NOT `[--color-*]`).

### Phase 3 Release Detail Pattern
- `app/releases/[slug]/page.tsx` — two-column sticky layout, SoundCloud embed, DocumentRenderer usage.

### Phase 4 Artist Pattern
- `app/artists/page.tsx` — ArtistCard grid usage pattern.
- `app/artists/[slug]/page.tsx` — two-column layout example.

### Project State (critical rules)
- `.planning/STATE.md` — `next/dynamic({ ssr: false })` for ALL embeds; `"use client"` on leaf components only; image path pairing rule.

### Requirements
- `.planning/REQUIREMENTS.md` §Podcasts (POD-01–02), §Press (PRESS-01–02), §Showcases (SHOW-01–03), §Static Pages (PAGE-01–04).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/releases/ReleaseCard.tsx` — exact component for featured releases grid on homepage. Already handles artwork fallback.
- `components/releases/ReleaseGrid.tsx` — grid wrapper for ReleaseCard list. Check whether it accepts a subset (featured only).
- `components/artists/ArtistCard.tsx` — artist photo + name + role card. Reuse for artist teaser section on homepage.
- `components/releases/SoundCloudEmbed.tsx` / `SoundCloudPlayer.tsx` — two embed components exist; verify which one takes a URL prop and renders the iframe.
- `components/releases/EmbedSkeleton.tsx` — loading state for embeds; reuse for podcast accordion.
- `lib/releases.ts` → `buildSoundCloudEmbedUrl()` — constructs the SoundCloud iframe URL from a premiere URL. Reuse for podcast embeds.
- `lib/releases.ts` → `plainTextFromDocument()` — extracts plain text from Keystatic document. Reuse for about page meta description.

### Established Patterns
- Server Components for data fetching, `"use client"` on leaf interactive components only.
- `next/dynamic({ ssr: false })` for all audio/video embeds — no exceptions.
- `reader.singletons.X.readOrThrow()` for singleton data.
- Tailwind v4 CSS variable syntax: `bg-(--color-surface)` NOT `bg-[--color-surface]`.

### Integration Points
- `app/layout.tsx` — `<SiteNav>` already wired; nav has links to `/about`, `/podcasts`, `/showcases`, `/press`, `/merch`. All routes need real pages in Phase 5.
- `app/page.tsx` — placeholder "Coming soon" — replaced entirely in Phase 5.
- `keystatic.config.ts` — needs two new singleton fields and one new singleton (about). Schema changes go here first; then content/about directory is created by the Keystatic admin when Elif first edits it (or by the executor as a seed file).

</code_context>

<specifics>
## Specific Ideas

- **Hero video:** Elif will upload two unlisted YouTube videos — one 16:9 (desktop), one 9:16 (mobile portrait). The YouTube video IDs are pasted into the Keystatic `homePage` admin. These MUST be unlisted (not private) or the iframe embed will be blocked by YouTube.
- **Beatport accolade text:** "Hype Label of the Month — March 2025" (or whatever is in the Keystatic `homePage.beatportAccolade` field). Display as a badge or styled inline element.
- **Shopify iframe risk:** Shopify's default storefront restricts framing. If Elif's store has a default theme, the iframe will show a blank page. The plan must include a note for Elif to verify her Shopify store allows embedding, and to provide a fallback "Visit Store" button if the iframe fails.

</specifics>

<deferred>
## Deferred Ideas

- Persistent audio player (cross-page): v2 feature per REQUIREMENTS.md out-of-scope list.
- Free downloads page (`/free-downloads` link exists in nav): not in Phase 5 requirements — deferred to a later phase or separate ticket.
- Press EPK assets download: mentioned in PROJECT.md, not in v1 requirements. Note as potential Phase 7 addition.
- YouTube podcast embeds on podcast page: the schema has `youtubeUrl` and `spotifyUrl` per episode — Phase 5 only implements SoundCloud embed. YouTube/Spotify links could be added as secondary platform links beneath the player.

</deferred>

---

*Phase: 05-secondary-content-pages*
*Context gathered: 2026-04-23*
