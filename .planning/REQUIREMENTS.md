# Requirements: Marginalia

**Defined:** 2026-04-04
**Core Value:** A living, branded label hub where the music, artists, and culture of Marginalia are showcased with the visual weight and editorial control the label deserves.

## v1 Requirements

### Infrastructure

- [ ] **INFRA-01**: Project deploys to Cloudflare Workers via `@opennextjs/cloudflare`
- [ ] **INFRA-02**: Keystatic CMS admin accessible at `/keystatic` in local mode
- [ ] **INFRA-03**: Keystatic schema is fully defined before any content is entered
- [ ] **INFRA-04**: Image paths configured correctly (`public/images/X` + `/images/X` publicPath)
- [ ] **INFRA-05**: Next.js builds without errors in Cloudflare Workers mode

### Design System

- [ ] **DSYS-01**: Tailwind v4 configured via `@theme {}` in CSS (no tailwind.config.js)
- [ ] **DSYS-02**: Neutral base color palette that lets release artwork set the tone
- [ ] **DSYS-03**: Bold graphic typography — strong headings, clean body text
- [ ] **DSYS-04**: Site is fully responsive across mobile, tablet, and desktop
- [ ] **DSYS-05**: Global layout shell — navigation and footer — implemented and shared across all pages

### Releases

- [ ] **REL-01**: Releases catalog page displays all releases in a bold artwork-led grid
- [ ] **REL-02**: Individual release page shows artwork, title, artist, date, genre, and description
- [ ] **REL-03**: SoundCloud embed loads on release page (client-only, hydration-safe)
- [ ] **REL-04**: Beatport and Spotify links displayed on release page
- [ ] **REL-05**: Featured releases appear on the homepage
- [ ] **REL-06**: Release pages have correct Open Graph metadata (artwork as OG image)
- [ ] **REL-07**: Release pages include JSON-LD MusicAlbum structured data

### Artists

- [ ] **ARTST-01**: Artists roster page displays all artists with photo and name
- [ ] **ARTST-02**: Individual artist page shows bio, photo, and social links
- [ ] **ARTST-03**: Artist page links to their releases on Beatport, SoundCloud, Spotify, Instagram
- [ ] **ARTST-04**: Artist pages have correct Open Graph metadata

### Podcasts / Mixes

- [ ] **POD-01**: Podcasts page lists all mixes/podcasts with date and description
- [ ] **POD-02**: SoundCloud or Mixcloud embed loads on each podcast entry (client-only)

### Press

- [ ] **PRESS-01**: Press page lists coverage entries with publication, headline, date, and link
- [ ] **PRESS-02**: Entries link out to original articles

### Showcases / Events

- [ ] **SHOW-01**: Showcases page lists upcoming and past events
- [ ] **SHOW-02**: Each event shows venue, city, date, and ticket link (if available)
- [ ] **SHOW-03**: Past events are visually distinguished from upcoming events

### Static Pages

- [ ] **PAGE-01**: Home page has hero section, featured releases, and artist roster teaser
- [ ] **PAGE-02**: Home page surfaces the Beatport "Hype Label of the Month" accolade
- [ ] **PAGE-03**: About page tells ELIF's story and the Marginalia philosophy
- [ ] **PAGE-04**: Merch page links out to the existing merch store

### Forms

- [ ] **FORM-01**: Demo submission form collects artist name, email, genre, and SoundCloud/streaming link
- [ ] **FORM-02**: Demo form sends submission to label email via Resend
- [ ] **FORM-03**: Demo form includes honeypot field for basic spam protection
- [ ] **FORM-04**: Subscribe form captures email for newsletter list via Brevo
- [ ] **FORM-05**: Management contact form sends inquiry via Resend
- [ ] **FORM-06**: All forms show clear success/error feedback to the user

### SEO

- [ ] **SEO-01**: All pages have correct `<title>` and `<meta description>` via Next.js metadata API
- [ ] **SEO-02**: Open Graph tags set correctly on all pages
- [ ] **SEO-03**: `sitemap.xml` generated and accessible
- [ ] **SEO-04**: `robots.txt` configured

### Content Management

- [ ] **CMS-01**: Label can add/edit releases via Keystatic admin
- [ ] **CMS-02**: Label can add/edit artists via Keystatic admin
- [ ] **CMS-03**: Label can add/edit podcasts via Keystatic admin
- [ ] **CMS-04**: Label can add/edit press entries via Keystatic admin
- [ ] **CMS-05**: Label can add/edit showcase events via Keystatic admin
- [ ] **CMS-06**: Label can edit site config (social links, merch URL) via Keystatic singleton

## v2 Requirements

### Persistent Audio Player

- **AUDIO-01**: Music plays continuously across page navigation
- **AUDIO-02**: Player shows current track, artist, and artwork
- **AUDIO-03**: Player has play/pause, next/previous controls

### Artist Portal

- **PORTAL-01**: Demo submitter can check status of their submission
- **PORTAL-02**: Artists can access a private page with assets and info

### Services

- **SVC-01**: Mix & mastering service with booking calendar and payment
- **SVC-02**: Production lesson booking system

### Advanced CMS

- **CMS-ADV-01**: Keystatic GitHub mode enabled (pending fix of OAuth issue #1497)
- **CMS-ADV-02**: Content editors can manage content from any machine without local setup

## Out of Scope

| Feature | Reason |
|---------|--------|
| File upload for demo submissions | Industry standard is streaming links; file uploads create storage costs and security risk |
| Custom merch checkout | Existing store handles fulfillment; integration adds fragility for no v1 gain |
| Mix/Mastering booking | Deferred to v2; Squarespace covers this in the interim |
| Production lessons platform | Deferred to v2 |
| Real-time audio streaming | High complexity and cost; embeds cover the use case |
| User accounts / login | No authenticated user functionality needed for label site |
| Keystatic GitHub mode in v1 | Known OAuth bug on Cloudflare Workers (#1497); local mode + git push is the v1 workflow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| DSYS-01 | Phase 2 | Pending |
| DSYS-02 | Phase 2 | Pending |
| DSYS-03 | Phase 2 | Pending |
| DSYS-04 | Phase 2 | Pending |
| DSYS-05 | Phase 2 | Pending |
| REL-01 | Phase 3 | Pending |
| REL-02 | Phase 3 | Pending |
| REL-03 | Phase 3 | Pending |
| REL-04 | Phase 3 | Pending |
| REL-05 | Phase 3 | Pending |
| REL-06 | Phase 3 | Pending |
| REL-07 | Phase 3 | Pending |
| ARTST-01 | Phase 4 | Pending |
| ARTST-02 | Phase 4 | Pending |
| ARTST-03 | Phase 4 | Pending |
| ARTST-04 | Phase 4 | Pending |
| POD-01 | Phase 5 | Pending |
| POD-02 | Phase 5 | Pending |
| PRESS-01 | Phase 5 | Pending |
| PRESS-02 | Phase 5 | Pending |
| SHOW-01 | Phase 5 | Pending |
| SHOW-02 | Phase 5 | Pending |
| SHOW-03 | Phase 5 | Pending |
| PAGE-01 | Phase 5 | Pending |
| PAGE-02 | Phase 5 | Pending |
| PAGE-03 | Phase 5 | Pending |
| PAGE-04 | Phase 5 | Pending |
| FORM-01 | Phase 6 | Pending |
| FORM-02 | Phase 6 | Pending |
| FORM-03 | Phase 6 | Pending |
| FORM-04 | Phase 6 | Pending |
| FORM-05 | Phase 6 | Pending |
| FORM-06 | Phase 6 | Pending |
| SEO-01 | Phase 7 | Pending |
| SEO-02 | Phase 7 | Pending |
| SEO-03 | Phase 7 | Pending |
| SEO-04 | Phase 7 | Pending |
| CMS-01 | Phase 1 | Pending |
| CMS-02 | Phase 1 | Pending |
| CMS-03 | Phase 1 | Pending |
| CMS-04 | Phase 1 | Pending |
| CMS-05 | Phase 1 | Pending |
| CMS-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 48 total
- Mapped to phases: 48
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 after initial definition*
