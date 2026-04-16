# Phase 1: Infrastructure & Schema Foundation — Context

**Gathered:** 2026-04-16
**Status:** Ready for planning
**Source:** Client Q&A (Elif, April 2026) + project research

<domain>
## Phase Boundary

Scaffold the Next.js 15 project, configure Cloudflare Workers deployment via @opennextjs/cloudflare, and define the complete Keystatic CMS schema for all 5 collections and 2 singletons. No content is entered and no UI is built in this phase — the deliverable is a running app that deploys and a locked schema.

</domain>

<decisions>
## Implementation Decisions

### Stack (All Locked)
- Framework: Next.js 15 (App Router) + TypeScript
- Styling: Tailwind CSS v4 (CSS-first config, no tailwind.config.js)
- CMS: Keystatic 0.5.x in local mode only (GitHub OAuth bug #1497 on Workers, unresolved)
- Hosting: Cloudflare Workers via @opennextjs/cloudflare (NOT @cloudflare/next-on-pages — deprecated)
- No `output: 'export'` — breaks Keystatic admin

### Releases Collection Schema
Fields locked from Q&A:
- `title` (slug field)
- `catalogNumber` — MRGNL-format (e.g., MRGNL001), searchable; optional display
- `releaseDate` (date)
- `releaseType` — select: Single / EP / Album / Compilation / Edit
- `artistSlugs` — array of text (multiple artists ALWAYS — never one artist per release)
- `coverArt` — image field, directory: `public/images/releases`, publicPath: `/images/releases/`
- `genres` — multiselect: Melodic House, Techno, Indie Dance, Organic House, Afro House
- `description` — document field
- `featured` — checkbox (homepage feature flag)
- Platform URLs (all optional):
  - `beatportUrl`
  - `spotifyUrl`
  - `appleMusicUrl`
  - `soundcloudUrl` (premiere link, not embed)
  - `bandcampUrl`
  - `traxsourceUrl`
  - `layloUrl` (presave stage)
  - `youtubeUrl`
  - (Other Proton Distribution platforms: Tidal, Deezer, Boomkat, Juno — add as `otherUrls` array or individual fields)
- `soundcloudPodcastUrl` — linked podcast SC URL (optional, for related podcast episodes)

### Artists Collection Schema
Fields from Q&A (3 roster artists at launch: ELIF, Liminal, Predex):
- `name` (slug field)
- `role` — text (e.g., "Founder & DJ", "Producer")
- `bio` — document field
- `photo` — image field, directory: `public/images/artists`, publicPath: `/images/artists/`
- `soundcloudUrl` (optional)
- `spotifyUrl` (optional)
- `beatportUrl` (optional)
- `instagramUrl` (optional)
- `residentAdvisorUrl` (optional)
- `youtubeUrl` (optional)
- `layloUrl` (optional)
- `bookingEmail` (optional)
- `featured` — checkbox

### Podcasts Collection Schema
Linked to catalog numbers (usually 1 per release, sometimes a/b/c variants):
- `title` (slug field, e.g., "Marginalia Podcast 012")
- `episodeNumber` — number
- `episodePart` — select: A / B / C / single (for multi-part episodes)
- `catalogNumber` — text (links to release catalog number)
- `date` (date)
- `artistSlug` — text (host/featured artist)
- `soundcloudUrl` — primary embed source (SoundCloud platform)
- `spotifyUrl` — Spotify podcast link (ELIF full mixes)
- `youtubeUrl` — YouTube set link (ELIF sets every 3 weeks)
- `applePodcastsUrl` (optional)
- `description` — text (multiline)
- `coverImage` — image (optional, fallback to label artwork)

### Press Collection Schema
- `headline` (slug field)
- `publication` — text
- `date` (date)
- `url` — URL (link to original article)
- `excerpt` — text (pull quote for display)
- `type` — select: Review / Interview / Feature / Mention / Chart
- `featured` — checkbox (surface quote on homepage)

### Showcases Collection Schema
- `title` (slug field)
- `date` (date)
- `venue` — text
- `city` — text
- `country` — text
- `status` — select: Upcoming / Past (auto-derive from date but allow override)
- `artistSlugs` — array (Marginalia artists on bill)
- `ticketUrl` — URL (optional, for upcoming events — RA, Dice links)
- `layloSignupUrl` — URL (optional, save-the-date before tickets)
- `flyer` — image (event artwork), directory: `public/images/showcases`, publicPath: `/images/showcases/`
- `aftermovieUrl` — YouTube URL (optional, for past events)
- `recapPhotos` — array of image (optional, for past events)

### Singletons

**siteConfig** (global settings):
- `siteName` — "Marginalia" (default)
- `tagline` — text (TBD — ELIF is open to suggestions)
- `instagramUrl`
- `soundcloudUrl`
- `beatportUrl`
- `youtubeUrl`
- `tiktokUrl`
- `facebookUrl`
- `merchUrl` (external merch store)
- `demoEmail` — "elif@marginalialabel.com" (default)
- `newsletterProvider` — text (Brevo list ID)

**homePage** (homepage config):
- `heroHeadline` — text
- `heroSubtext` — text
- `featuredReleaseSlug` — text (manually curated featured release)
- `featuredArtistSlugs` — array (roster preview)
- `beatportAccolade` — text (e.g., "Hype Label of the Month, March 2025")
- `showSpotifyPlaylist` — checkbox
- `spotifyPlaylistUrl` — URL (v2 feature but field locked now)

### Navigation Structure (affects siteConfig)
Primary nav: Home · About · Releases · Free Downloads · Merch · Podcasts · Showcases · Demo · Subscribe · Press
Secondary/Incubation: Management Roster · Mix & Mastering · Production Classes · Mentoring

### Content Manager
- Day-to-day: Fabio (via Keystatic admin on localhost → git push)
- Approval: ELIF

### CMS Workflow (Local Mode)
1. Edit content at localhost:3000/keystatic
2. Keystatic writes YAML files to content/ directory
3. `git commit && git push`
4. Cloudflare Workers rebuilds automatically via GitHub integration

### Claude's Discretion
- Exact Proton Distribution platform list (check with Fabio)
- Whether to use `fields.relationship` or `artistSlugs` array for relations (use slugs — Keystatic has no join queries)
- Exact slug patterns for catalog entries
- wrangler.jsonc configuration details
- Whether to create a `freeDownloads` collection or handle via external HypeEdit (deferred until Fabio clarifies)
- Whether to include a `merch` singleton or keep it as a siteConfig URL

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Research Files
- `.planning/research/STACK.md` — Full stack decisions, version compatibility, installation commands
- `.planning/research/ARCHITECTURE.md` — Project structure, Keystatic patterns, route table, data flow
- `.planning/research/PITFALLS.md` — Critical pitfalls for Phase 1 (image paths, schema lock-in, static export)
- `.planning/research/FEATURES.md` — Complete content model specs, feature dependencies
- `.planning/REQUIREMENTS.md` — All 48 v1 requirements with phase mapping
- `.planning/ROADMAP.md` — Phase 1 success criteria and requirement IDs

### Critical Rules
- `@opennextjs/cloudflare` ONLY — not `@cloudflare/next-on-pages` (deprecated)
- Keystatic local mode ONLY in v1 (GitHub mode blocked by unresolved bug #1497)
- NO `output: 'export'` in next.config.ts
- Schema must be complete before any content is entered (no migration tooling)
- Image fields: always pair `directory: 'public/images/X'` with `publicPath: '/images/X/'`

</canonical_refs>

<specifics>
## Specific Implementation Notes

### Installation Command (from STACK.md)
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias="@/*" --yes
npm install @keystatic/core @keystatic/next
npm install @opennextjs/cloudflare
npm install -D wrangler
npm install react-hook-form zod zod-form-data resend react-lite-youtube-embed sonner server-only
npm install -D prettier prettier-plugin-tailwindcss @next/bundle-analyzer
```

### wrangler.jsonc (from STACK.md)
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

### Keystatic Route Setup (from ARCHITECTURE.md)
Required files:
- `app/keystatic/layout.tsx` — Keystatic layout
- `app/keystatic/[[...params]]/page.tsx` — Keystatic admin catch-all
- `app/api/keystatic/[...params]/route.ts` — Keystatic API handler

### Content Directory Structure
```
content/
  releases/    (*.yaml per release)
  artists/     (*.yaml per artist)
  podcasts/    (*.yaml per episode)
  press/       (*.yaml per item)
  showcases/   (*.yaml per event)
  home.yaml    (singleton)
  site-config.yaml (singleton)
public/
  images/
    releases/
    artists/
    showcases/
```

### Existing Placeholder Files to Remove
The following placeholder files were created before the Next.js scaffold and must be deleted or overwritten by create-next-app:
- `index.html`
- `css/style.css`
- `js/main.js`
- `assets/` directory
These are superseded by the Next.js project structure.

</specifics>

<deferred>
## Deferred Ideas

- Free Downloads page — HypeEdit integration vs. native system (Fabio to clarify). Add a `freeDownloads` collection in schema as optional placeholder.
- Presave / fan links system — currently via HypeEdit. Not in v1 schema.
- v2 persistent audio player — Spotify playlist embed on homepage (field locked in siteConfig as `spotifyPlaylistUrl` but feature deferred)
- Mix & Mastering / Production Classes booking — under "Incubation" subcategory, deferred to v2
- Keystatic GitHub mode — blocked by bug #1497; monitor before Phase 1 closes

</deferred>

---

*Phase: 01-infrastructure-schema-foundation*
*Context gathered: 2026-04-16 from Client Q&A*
