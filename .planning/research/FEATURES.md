# Feature Research

**Domain:** Indie electronic music label website (melodic house & techno)
**Researched:** 2026-04-04
**Confidence:** MEDIUM-HIGH (web research + competitor pattern analysis)

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors assume exist. Missing = site feels incomplete or amateur.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Release catalog with artwork | Core label identity — fans expect a visual discography | LOW | Artwork-driven grid; link out to Beatport/SoundCloud per release |
| Embedded audio players per release | Fans want to preview before buying/following | LOW | SoundCloud or Beatport widget embed; avoid hosting audio directly |
| Artist roster pages | Labels are judged by their roster; each artist needs a presence | MEDIUM | Bio, photo, releases, social links per artist |
| About / label story | Context for who Marginalia is and what ELIF built | LOW | ELIF's origin story + label philosophy (the "marginalia" concept) |
| Podcast / mix archive | Expected from any credible electronic label | LOW | Embed from SoundCloud/Mixcloud; list with metadata |
| Press / EPK section | Industry contacts, journalists, bookers expect this | LOW | Media coverage list + downloadable EPK assets |
| Showcases / events | Live presence is core to label culture | LOW | Past + upcoming; simple list or cards |
| Demo submission form | Artists expect a clear, professional submission path | MEDIUM | See Demo Submission section below |
| Newsletter signup | Fan retention baseline — email owns the audience | LOW | Simple inline form; integrate with Mailchimp or similar |
| Management contact | Booking agents and managers need a direct line | LOW | Separate contact form or mailto; distinct from demo form |
| Mobile-responsive design | 90%+ of music discovery happens on mobile | LOW | Non-negotiable; thumb-friendly nav, fast load |
| Social links in footer/header | Expected from any artist or label site | LOW | Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook |

### Differentiators (Competitive Advantage)

Features that separate serious label sites from template-built ones.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Artwork-driven visual identity | Release artwork IS the brand — let it dominate the layout | LOW | Full-bleed grids, hover reveals, artwork as background in hero |
| Beatport "Hype Label" social proof | Marginalia has an accolade worth surfacing; builds credibility fast | LOW | Display on homepage or about page with Beatport logo |
| Per-release purchase/stream links | Frictionless path from discovery to purchase | LOW | Link buttons per release: Beatport, SoundCloud, Spotify, etc. |
| Curated editorial voice | Label sites that read like a label — not a portfolio — feel authoritative | MEDIUM | Short release notes or editorial blurbs in catalog entries |
| Press quote pull-outs | Social proof from media coverage surfaced visually, not buried in a list | LOW | Pick 2-3 strong quotes, feature on homepage or about |
| Genre / mood filtering in catalog | Useful for a growing discography; helps visitors navigate | MEDIUM | Simple tag/genre filter — defer if catalog is small at launch |
| Showcase archive with visual media | Photos + video from past events builds culture and FOMO | MEDIUM | Embed Instagram posts or YouTube for past showcases |
| EPK download | Bookers and press want one-click assets | LOW | PDF + hi-res artwork zip; link from press page |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| File upload on demo form | "Higher quality than links" | Large files bloat server, break free-tier hosting, create storage cost; 85% of labels reject files anyway | Require SoundCloud/Bandcamp/Dropbox private link only |
| Auto-playing audio on page load | "Immersive experience" | Immediately alienates mobile users; kills accessibility; users close the tab | Use visible play buttons with prominent placement instead |
| Persistent cross-page audio player (v1) | "Seamless listening" | Requires complex state management, routing architecture changes; high dev cost for low v1 ROI | Defer to v2; embed per-page players suffice for launch |
| Merch checkout embedded on-site | "Keep users on site" | Existing store has inventory, fulfillment, payment — duplicating this is high effort with no gain | Link out to existing merch store cleanly; open in new tab |
| Custom CMS-managed social feed pull | "Live, always fresh" | API rate limits, token management, breakage risk; requires ongoing maintenance | Embed Instagram widget or link to profile |
| Star ratings / fan reviews | "Engagement" | Not a pattern on label sites; feels like a streaming platform; dilutes editorial voice | Use press quotes and editorial blurbs instead |
| Gig ticketing / booking integrated | "One-stop" | Ticketing is a solved problem (RA, Dice, Resident Advisor); adds complexity with no benefit | Link to RA / external event pages from showcases |

## Demo Submission UX

**Recommendation: Streaming link only — no file uploads.**

Evidence from the industry is clear: top EDM labels (604 Records, Armada, and others) explicitly reject MP3/WAV attachments. Security filters block them, or they go to spam. SoundCloud private links are the professional standard.

### Fields to Collect

| Field | Required | Notes |
|-------|----------|-------|
| Artist name | Yes | |
| Email address | Yes | For reply |
| SoundCloud / Bandcamp / Dropbox link | Yes | Private link strongly preferred; must be streamable |
| Genre / style description | Yes | Short field; helps triage |
| Bio or artist background | No | Optional short text |
| Social links (SoundCloud profile, Instagram) | No | Helps vet the artist |
| Additional notes / message | No | Free text for context |

### UX Best Practices

- State clearly at the top: "We only accept streaming links (SoundCloud, Bandcamp, Dropbox). No attachments."
- Set expectations on response time: "We listen to every demo but can only respond to tracks we want to pursue."
- Confirm submission with a success message (not just a blank redirect).
- Do not promise a response timeline you cannot keep — no-response is normal and expected in the industry.
- Keep the form short. Lengthy forms deter good artists.

## Content Model Needs

### Release

| Field | Type | Notes |
|-------|------|-------|
| Title | Text | |
| Catalog number | Text | e.g. MGNL001 |
| Release date | Date | |
| Artwork | Image | High-res; drives the visual identity |
| Artists | Relation (Artist[]) | One or more |
| Label | Text | Marginalia (or sub-label if applicable) |
| Genre / style tags | Tags | e.g. melodic house, techno |
| Format | Select | EP / Single / Album / Compilation |
| Tracklist | Array of {title, duration} | |
| SoundCloud embed URL | URL | For preview player |
| Beatport URL | URL | Buy link |
| Spotify URL | URL | Stream link |
| Other platform URLs | URL[] | Apple Music, Traxsource, etc. |
| Editorial note | Rich text (short) | Optional label blurb about the release |
| Featured | Boolean | Surfaces on homepage |

### Artist

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | |
| Slug | Text | URL path |
| Photo | Image | High-res, ideally consistent aspect ratio |
| Bio | Rich text | |
| Origin / location | Text | Optional |
| Releases | Relation (Release[]) | Backfilled from Release model |
| SoundCloud URL | URL | |
| Instagram URL | URL | |
| Beatport URL | URL | |
| Other social URLs | URL[] | |
| Featured on roster | Boolean | Show on main Artists page |

### Podcast / Mix

| Field | Type | Notes |
|-------|------|-------|
| Title | Text | e.g. "Marginalia Podcast 012" |
| Episode number | Number | |
| Date | Date | |
| Artist / host | Relation (Artist) | |
| Cover image | Image | Optional; fallback to label artwork |
| SoundCloud embed URL | URL | Primary embed source |
| Mixcloud embed URL | URL | Alternative |
| Tracklist | Rich text | Optional |
| Description | Text | Short summary |

### Press Item

| Field | Type | Notes |
|-------|------|-------|
| Publication | Text | e.g. Resident Advisor, Mixmag |
| Title / headline | Text | |
| Date | Date | |
| URL | URL | Link to original article |
| Excerpt / quote | Text | Pull quote for display |
| Type | Select | Review / Interview / Feature / Mention |
| Featured | Boolean | Surface quote on homepage or about page |

### Showcase / Event

| Field | Type | Notes |
|-------|------|-------|
| Title | Text | Event name |
| Date | Date | |
| Venue | Text | |
| City / country | Text | |
| Status | Select | Upcoming / Past |
| Artists on bill | Relation (Artist[]) | |
| Ticket URL | URL | External link to RA / Dice |
| Flyer / image | Image | |
| Recap notes | Rich text | Optional; for past events |
| Video / recap URL | URL | YouTube embed for past events |

## Newsletter Patterns

**Recommendation: Mailchimp free tier via embedded form (not a separate subscribe page).**

- Inline signup form in footer (always visible) and optionally a homepage hero module.
- Single-field form (email only) at point of capture — name can be collected post-subscribe.
- Confirmation page / success state should affirm what they subscribed to ("You'll hear from us on new releases, events, and mixes").
- Send cadence: release-triggered, not calendar-scheduled. Send when there's news.
- Content pattern for electronic music: new release announcement + SoundCloud embed + Beatport link + short label note. Keep it short — this audience scans, not reads.
- Avoid generic "subscribe for updates" — use specific value prop: "First to hear new releases, mixes, and Barcelona showcases."

## SEO

**Priority: Structured data + Open Graph for every content type.**

### Structured Data (JSON-LD)

| Type | Schema | Applied To |
|------|--------|------------|
| Music label | `Organization` | Sitewide (layout) |
| Release (EP/Album) | `MusicAlbum` | Each release page |
| Artist | `MusicGroup` or `Person` | Each artist page |
| Podcast episode | `PodcastEpisode` | Each podcast page |
| Event | `Event` | Each showcase page |

Key fields for `MusicAlbum`: `name`, `byArtist`, `datePublished`, `image`, `url`, `genre`, `track` (array of `MusicRecording`).

### Open Graph

Every page type needs:
- `og:title` — release title, artist name, or page name
- `og:description` — editorial note or bio excerpt
- `og:image` — release artwork (at minimum 1200×630px crop)
- `og:type` — `music.album` for releases, `profile` for artists, `website` for static pages
- `og:url` — canonical URL

Release artwork as OG image is the biggest win — when shared to Instagram Stories, Twitter, or Slack, the artwork should render, not a generic placeholder.

### Twitter / X Cards

Use `summary_large_image` card type for releases so artwork renders full-width when linked.

### Technical SEO

- Canonical URLs on all pages (Next.js metadata API handles this)
- `sitemap.xml` generated from CMS content (releases, artists, podcasts, showcases)
- `robots.txt` allowing full crawl
- Page titles follow pattern: `[Release Title] — Marginalia` / `[Artist Name] — Marginalia`

## Merch Integration

**Recommendation: Clean link-out — no embed.**

The existing merch store handles fulfillment, inventory, and payment. Embedding creates maintenance cost and iframe issues. The right approach:

- Navigation item "Merch" links to external store (new tab)
- Optionally: feature 1-3 hero products on homepage with direct product links
- No cart integration, no inventory sync — this is v1 scope

## Social Integration

### Beatport

- Display label's Beatport URL in navigation or footer
- On release pages: direct "Buy on Beatport" CTA button
- Surface the "Hype Label of the Month (March 2025)" accolade on homepage — screenshot or badge
- No embed widget needed; links suffice

### SoundCloud

- Embed SoundCloud player widgets on release pages and podcast pages using standard iframe embed
- SoundCloud widget API allows color customization — match to label palette
- Link to label SoundCloud profile in navigation/footer

### Instagram

- Footer link to Instagram (no live feed embed — API fragility risk)
- For showcases: link to Instagram posts as recap media (not embedded)

## Feature Dependencies

```
Artist pages
    └──requires──> Artist content model in Keystatic

Release catalog
    └──requires──> Release content model in Keystatic
    └──requires──> Artist pages (for relation links)
    └──enhances──> SoundCloud embed (per release)
    └──enhances──> Beatport link (per release)

Podcast archive
    └──requires──> Podcast content model in Keystatic
    └──enhances──> Artist pages (host relation)

Press page
    └──requires──> Press content model in Keystatic

Showcases
    └──requires──> Showcase content model in Keystatic
    └──enhances──> Artist pages (lineup relation)

Newsletter signup
    └──requires──> Mailchimp account + embed code

Demo submission
    └──requires──> Form handler (Formspree / Netlify Forms / similar serverless)

SEO (OG + schema)
    └──requires──> Release and Artist pages exist
    └──requires──> Next.js metadata API configuration
```

## MVP Definition

### Launch With (v1)

- [ ] Home page — hero, featured releases, artist roster teaser, newsletter signup
- [ ] Release catalog — full discography grid with artwork, player embeds, buy links
- [ ] Artist roster — individual pages per artist with bio and releases
- [ ] About page — ELIF story + label philosophy
- [ ] Podcast archive — episode list with SoundCloud embeds
- [ ] Press page — coverage list + EPK download link
- [ ] Showcases — past + upcoming events
- [ ] Merch — navigation link to existing store
- [ ] Demo submission — streaming-link form with Formspree or equivalent
- [ ] Newsletter signup — Mailchimp embed in footer
- [ ] Management contact — separate contact form

### Add After Validation (v1.x)

- [ ] Genre/mood filtering in release catalog — add when catalog exceeds ~20 releases
- [ ] Showcase video recaps — add when YouTube content is available
- [ ] Press quote pull-outs on homepage — after 3+ quotable press items exist

### Future Consideration (v2+)

- [ ] Persistent cross-page audio player — high dev cost; revisit after v1
- [ ] Artist portal / demo status tracking — requires auth layer
- [ ] Mix & Mastering booking — Squarespace covers this now
- [ ] Production Lessons — out of scope

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Release catalog | HIGH | LOW | P1 |
| Artist pages | HIGH | LOW | P1 |
| Home page | HIGH | MEDIUM | P1 |
| About page | HIGH | LOW | P1 |
| Demo submission form | HIGH | LOW | P1 |
| Newsletter signup | HIGH | LOW | P1 |
| Podcast archive | MEDIUM | LOW | P1 |
| Press / EPK | MEDIUM | LOW | P1 |
| Showcases | MEDIUM | LOW | P1 |
| Management contact | MEDIUM | LOW | P1 |
| SEO / structured data | HIGH | LOW | P1 |
| Merch link-out | LOW | LOW | P1 |
| Beatport "Hype" social proof | MEDIUM | LOW | P2 |
| Genre filtering in catalog | MEDIUM | MEDIUM | P2 |
| Press quote pull-outs | LOW | LOW | P2 |
| Showcase recap media | LOW | MEDIUM | P2 |
| Persistent audio player | MEDIUM | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Anjunadeep | Ghostly Intl. | Ninja Tune | Marginalia Approach |
|---------|------------|---------------|------------|---------------------|
| Release catalog | Full discography grid with artwork | Editorial catalog with rich artwork | Full catalog + editorial | Artwork-first grid; SoundCloud embed + Beatport link per release |
| Artist pages | Full bio + release backlinks | Photo-heavy artist profiles | Detailed bios + discography | Bio + photo + releases + social links |
| Audio previews | Embedded Spotify/SoundCloud | Custom audio player | Embedded streams | SoundCloud iframe embeds; no custom player in v1 |
| Podcast section | Anjunadeep Explorations podcast page | No | No dedicated section | Podcast list with episode-level SoundCloud embeds |
| Merch | Integrated merch shop | Ghostly Store (integrated) | Ninja Tune store | Link-out to existing store |
| Demo submission | No public form (curated) | No public form | No public form | Yes — required for Marginalia's open, indie positioning |
| Press | Press/media section with coverage | Press section | Press section | Yes, with EPK download |
| Newsletter | Email signup in footer | Email signup in footer | Email signup in footer | Footer signup + homepage module |

## Sources

- [Demo Submission Dos & Don'ts 2025 — Unison Audio](https://unison.audio/demo-submission/)
- [Record Labels Accepting Demos — DropTrack](https://www.droptrack.com/record-labels-accepting-demos-in-2025-7-mistakes-youre-making-and-how-to-fix-them/)
- [How to Submit Demo — Armada Music](https://www.armadamusic.com/news/how-to-submit-your-demo)
- [Is Your Music Label Website Outdated — Qrolic](https://qrolic.com/blog/music-label-website-outdated-signs/)
- [Independent Electronic Music Release Strategy 2026 — Change Underground](https://change-underground.com/independent-electronic-music-release-strategy-2026/)
- [Schema Markup for Musicians — InClassics](https://inclassics.com/blog/seo-for-musicians-schema-markup)
- [MusicAlbum Schema.org Type](https://schema.org/MusicAlbum)
- [Beatport Unveils Artist-First Platform Changes 2025 — MN2S](https://mn2s.com/news/label-services-resources/beatport-unveils-artist-first-platform-enhancements-for-2025/)
- [Email Marketing for Musicians 2025 — Gravity Forms](https://www.gravityforms.com/blog/email-marketing-for-musicians-in-2025/)
- [Bandzoogle Schema Markup for Bands](https://bandzoogle.com/blog/how-to-optimize-your-band-schema)

---
*Feature research for: Marginalia music label website*
*Researched: 2026-04-04*
