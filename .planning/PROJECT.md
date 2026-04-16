# Marginalia

## What This Is

A fully custom website for Marginalia — a Barcelona-based melodic house & techno / indie dance label founded in 2023 by Turkish-born DJ and producer ELIF. The site replaces the existing Squarespace build with a proper custom platform: bold, graphic, artwork-driven, and content-managed via Keystatic CMS.

## Core Value

A living, breathing label hub — where the music, artists, and culture of Marginalia are showcased with the visual weight and editorial control the label deserves.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Home page with hero section, featured releases, and artist roster teaser
- [ ] About page — ELIF's story, label philosophy, the Marginalia concept
- [ ] Releases / Catalog — full discography with artwork, metadata, and embedded players
- [ ] Artists — individual pages per artist with bio, releases, and social links
- [ ] Podcasts / Mixes — hosted or embedded audio content
- [ ] Press — media coverage, EPK assets
- [ ] Showcases — events, live appearances, past and upcoming
- [ ] Merch — links or integration with existing merch store
- [ ] Demo Submission — structured form for artist submissions
- [ ] Subscribe — newsletter / mailing list signup
- [ ] Management — contact form for artist management inquiries
- [ ] Keystatic CMS admin UI for content management (releases, artists, podcasts, press, showcases)

### Out of Scope

- Mix & Mastering booking — deferred to v2 (Squarespace covers this for now)
- Production Lessons — deferred to v2
- Custom e-commerce / merch checkout — link out to existing store
- Artist portal / demo status tracking — v2 feature
- Persistent audio player (cross-page) — v2 feature

## Context

- **Existing site:** marginalialabel.com (Squarespace) — covers most pages but lacks design quality and CMS flexibility
- **Label founder:** ELIF — Turkish-born, Barcelona-based DJ and producer
- **Genre:** Melodic house & techno, indie dance
- **Label philosophy:** Absolute sonic freedom; named after medieval manuscript marginalia — uninhibited creativity in the blank spaces
- **Artist roster:** Althoff, Snirco, James Harcourt, Latteo, Manti, Tenvin, Xinobi, Alex Medina, Auggië, Dodi Palese, I Promised Mom, Radeckt, Alican, REBRN + upcoming artists
- **Beatport:** Hype Label of the Month (March 2025) — growing profile in the scene
- **Socials:** Instagram, SoundCloud, YouTube, TikTok, Facebook, Beatport

## Constraints

- **CMS:** Keystatic — free, git-based, no external service or database required
- **Hosting:** Vercel (free tier compatible)
- **Budget:** Free tooling only — no paid CMS, no paid infrastructure
- **Tech Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Keystatic

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keystatic over Sanity/Contentful | Free, git-based, no external service — content lives in repo | — Pending |
| Next.js App Router | Best fit for content-heavy label site with good SEO and static generation | — Pending |
| Full redesign (not Squarespace) | More design control, better performance, proper CMS | — Pending |
| Skip services for v1 | Focus on label/music identity first; mix/mastering and lessons are secondary | — Pending |
| Bold graphic visual direction | Release artwork drives the aesthetic — strong grid, high contrast | — Pending |

---
*Last updated: 2026-04-04 after initialization*
