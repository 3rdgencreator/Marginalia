# Roadmap: Marginalia

**Project:** Marginalia — Music Label Website
**Core Value:** A living, branded label hub where the music, artists, and culture of Marginalia are showcased with the visual weight and editorial control the label deserves.
**Created:** 2026-04-04
**Granularity:** Standard (7 phases)
**Coverage:** 48/48 v1 requirements mapped

---

## Phases

- [ ] **Phase 1: Infrastructure & Schema Foundation** — Project scaffolding, Cloudflare Workers deploy pipeline, and fully locked Keystatic schema before any content is touched
- [ ] **Phase 2: Design System & Layout Shell** — Tailwind v4 design tokens, global nav and footer, and the visual primitives every page shares
- [ ] **Phase 3: Releases** — The core label identity: artwork-led catalog grid, individual release pages, embedded audio players, and release SEO
- [ ] **Phase 4: Artists** — Roster page and individual artist profiles with bio, photo, releases, and social links
- [ ] **Phase 5: Secondary Content Pages** — Podcasts, press, showcases, about, homepage, and merch link-out
- [ ] **Phase 6: Forms & Email** — Demo submission, newsletter signup, and management contact with server actions and email delivery
- [ ] **Phase 7: SEO & Polish** — Metadata audit, sitemap, structured data verification, and Lighthouse pass across all pages

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure & Schema Foundation | 0/3 | Planned | - |
| 2. Design System & Layout Shell | 0/4 | Planned | - |
| 3. Releases | 0/? | Not started | - |
| 4. Artists | 0/? | Not started | - |
| 5. Secondary Content Pages | 0/5 | Planned | - |
| 6. Forms & Email | 0/? | Not started | - |
| 7. SEO & Polish | 0/? | Not started | - |

---

## Phase Details

### Phase 1: Infrastructure & Schema Foundation

**Goal:** The project builds and deploys to Cloudflare Workers without errors, and the complete Keystatic schema is locked — every field for all 5 collections and 2 singletons is defined and image paths are verified end-to-end — before any content is entered.

**Depends on:** Nothing (first phase)

**Requirements:** INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06

**Success Criteria** (what must be TRUE):
1. Running `npm run dev` opens the app and `/keystatic` shows the CMS admin UI with all collections (releases, artists, podcasts, press, showcases) and singletons (siteConfig) visible
2. A test image uploaded via the Keystatic admin appears correctly at `/images/releases/[filename]` when the dev server is running — confirming `directory` and `publicPath` are correctly paired
3. Running the OpenNext build command (`npx @opennextjs/cloudflare build`) completes without errors and a placeholder page deploys successfully to Cloudflare Workers
4. The `keystatic.config.ts` schema includes every field that any future phase will need (catalog number, featured flag, all platform URL fields, genre, sort order) — no field is added after content entry begins
5. The CMS local-mode workflow is documented: edit on localhost, commit YAML files to git, push to trigger Workers rebuild

**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Next.js 15 scaffold + Cloudflare Workers config + dependencies
- [x] 01-02-PLAN.md — Complete Keystatic CMS schema (all collections + singletons + admin routes)
- [x] 01-03-PLAN.md — OpenNext build verification + image path test + CMS workflow docs

---

### Phase 2: Design System & Layout Shell

**Goal:** The visual language of Marginalia is established in code — dark-first color tokens, bold typographic scale, and a shared nav and footer that are present and correct on every page of the site.

**Depends on:** Phase 1

**Requirements:** DSYS-01, DSYS-02, DSYS-03, DSYS-04, DSYS-05

**Success Criteria** (what must be TRUE):
1. Every page on the site shares the same nav (with working navigation links) and footer (with social links wired to the siteConfig singleton) without any per-page duplication
2. The color palette uses a neutral dark base — artwork, when placed on any page, reads as the dominant visual element rather than competing with background UI color
3. Headings render in the bold typographic style defined in `@theme {}` at all viewport widths, and body text is clean and legible at 16px on mobile
4. Resizing from 375px to 1440px shows no broken layouts, overflow, or content clipping on any page shell
5. There is no `tailwind.config.js` file in the project — all token definitions live in `globals.css` under `@theme {}`

**Plans:** 4 plans (waves 1, 1, 2, 3)

Plans:
- [ ] 02-01-PLAN.md — globals.css @theme tokens + @font-face + public/fonts/.gitkeep (Wave 1, DSYS-01/02/03)
- [ ] 02-02-PLAN.md — Container + Logo + SocialIcon primitives (Wave 1, DSYS-05)
- [ ] 02-03-PLAN.md — SiteNav + NavLinks + MobileMenu navigation system (Wave 2, DSYS-04/05)
- [ ] 02-04-PLAN.md — SiteFooter (async reader with fallback) + app/layout.tsx wiring + font preload (Wave 3, DSYS-03/04/05)

---

### Phase 3: Releases

**Goal:** A visitor can browse the full Marginalia catalog in a bold artwork-led grid and click any release to see its artwork, metadata, embedded audio, and buy/stream links — and each release page is shareable with correct social preview images.

**Depends on:** Phase 2

**Requirements:** REL-01, REL-02, REL-03, REL-04, REL-05, REL-06, REL-07

**Success Criteria** (what must be TRUE):
1. The `/releases` page displays all seeded releases as a responsive artwork-first grid (2 columns on mobile, expanding on wider viewports) with no console hydration errors
2. Clicking a release card opens a detail page showing the cover artwork, title, artist name, release date, genre, and description as entered in Keystatic
3. A SoundCloud embed loads on the release detail page client-side only — the page renders with a skeleton placeholder first, then the player appears without any hydration error in the browser console
4. Beatport and Spotify links are visible and clickable on the release detail page, linking to the correct external pages
5. Sharing a release URL on social media (verified via og:debugger or similar) shows the release artwork as the preview image with the correct title and description
6. The release page HTML source includes a valid `MusicAlbum` JSON-LD block with title, artist, and release date fields populated

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Releases catalog page + ReleaseCard + ReleaseGrid
- [ ] 03-02-PLAN.md — Release detail page + SoundCloud embed + platform links
- [ ] 03-03-PLAN.md — Release OG metadata + JSON-LD MusicAlbum structured data

---

### Phase 4: Artists

**Goal:** A visitor can browse the full Marginalia artist roster and click any artist to see their bio, photo, and links to their music across platforms — and artist pages are shareable with correct social preview images.

**Depends on:** Phase 3

**Requirements:** ARTST-01, ARTST-02, ARTST-03, ARTST-04

**Success Criteria** (what must be TRUE):
1. The `/artists` page displays all artists in a photo-and-name grid with no missing images or placeholder broken states
2. Clicking an artist opens a profile page showing their photo, full bio, and all available social/platform links (Beatport, SoundCloud, Spotify, Instagram) — links that were left blank in Keystatic are not rendered as empty or broken elements
3. Sharing an artist URL shows the artist photo as the social preview image with the artist name in the title
4. Artists with no content entered in Keystatic do not appear on the roster (the grid reflects only published entries)

**Plans:** 3 plans

Plans:
- [ ] 04-01-PLAN.md — Artists roster page + ArtistCard component
- [ ] 04-02-PLAN.md — Artist detail page + bio + social links
- [ ] 04-03-PLAN.md — Artist OG metadata

---

### Phase 5: Secondary Content Pages

**Goal:** A visitor can navigate to every section of the Marginalia site — podcasts, press coverage, upcoming and past events, the label's story, and the homepage — and find real content presented correctly, with the homepage serving as a credible first impression that surfaces the label's catalog, roster, and Beatport accolade.

**Depends on:** Phase 4

**Requirements:** POD-01, POD-02, PRESS-01, PRESS-02, SHOW-01, SHOW-02, SHOW-03, PAGE-01, PAGE-02, PAGE-03, PAGE-04

**Success Criteria** (what must be TRUE):
1. The homepage (`/`) shows a hero section, a grid of featured releases (those marked featured in Keystatic), a teaser of the artist roster, and a visible reference to the Beatport "Hype Label of the Month" accolade
2. The `/podcasts` page lists all podcast entries with date and description, and each entry loads a SoundCloud or Mixcloud embed client-side without hydration errors
3. The `/press` page lists all coverage entries with publication name, headline, date, and a working external link to the original article
4. The `/showcases` page displays upcoming and past events as visually distinct groups — at minimum via different section headings or visual treatment — each with venue, city, and date
5. The `/about` page tells ELIF's story and the Marginalia philosophy in prose, as entered in Keystatic or as static copy
6. The `/merch` page (or nav link) routes a visitor to the external merch store without loading a blank or broken page

**Plans:** 5 plans

Plans:
- [x] 05-01-PLAN.md — Keystatic schema additions (heroVideoUrl, heroVideoMobileUrl, about singleton) + seed YAML files (Wave 1)
- [x] 05-02-PLAN.md — Press page + PressEntry component + Showcases page + ShowcaseCard component (Wave 2)
- [x] 05-03-PLAN.md — About page with DocumentRenderer + Merch iframe page (Wave 2)
- [x] 05-04-PLAN.md — Podcasts page + PodcastAccordion + PodcastRow client components (Wave 2)
- [x] 05-05-PLAN.md — Homepage: YouTube video hero + Beatport badge + featured releases + artist teaser (Wave 2)

---

### Phase 6: Forms & Email

**Goal:** A visitor can submit a demo, sign up for the newsletter, or send a management inquiry — and each form validates their input, delivers the submission to the correct destination, and shows them a clear success or error response.

**Depends on:** Phase 5

**Requirements:** FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06

**Success Criteria** (what must be TRUE):
1. Submitting the demo form with valid data (artist name, email, genre, SoundCloud link) sends an email via Resend to the label inbox and shows a success message to the submitter
2. Submitting the demo form with a missing required field shows inline field-level error messages without a page reload
3. The demo form contains a honeypot field that is invisible to human users but causes bot submissions to be silently discarded
4. Submitting the subscribe form with a valid email adds the contact to the Brevo newsletter list and shows a confirmation message — no email is sent to the subscriber
5. Submitting the management form with name, email, and message sends a Resend notification to the label and shows a success message to the sender

**Plans:** 3 plans

Plans:
- [ ] 06-01-PLAN.md — Demo submission form + server action + honeypot
- [ ] 06-02-PLAN.md — Newsletter subscribe form + Brevo integration
- [ ] 06-03-PLAN.md — Management contact form + Resend email delivery

---

### Phase 7: SEO & Polish

**Goal:** Every page on the site has correct, unique metadata and structured data; the site is fully crawlable; and release pages pass a Lighthouse performance check above 90.

**Depends on:** Phase 6

**Requirements:** SEO-01, SEO-02, SEO-03, SEO-04

**Success Criteria** (what must be TRUE):
1. Every page on the site has a unique `<title>` in the format `[Content Name] — Marginalia` and a non-empty `<meta name="description">`, verified by checking page source
2. `sitemap.xml` is accessible at `https://marginalialabel.com/sitemap.xml` and includes URLs for all releases, artists, podcasts, and showcase pages
3. `robots.txt` is accessible and allows full crawl (no Disallow rules blocking content pages)
4. A Lighthouse run on any release detail page scores 90 or above on Performance — confirming correct `next/image` `sizes` prop, `priority` on the first image, and no render-blocking resources

**Plans:** 3 plans

Plans:
- [ ] 07-01-PLAN.md — Metadata audit + title/description for all pages
- [ ] 07-02-PLAN.md — sitemap.xml + robots.txt generation
- [ ] 07-03-PLAN.md — Lighthouse performance pass + next/image sizes audit

---

### Phase 8: Showcase Detail Enhancements — per-event merch (Shopify product handles), variable optional links (jsonb array), and multi-recording SoundCloud support

**Goal:** Each showcase detail page can display an optional set of external links, Shopify merch products, and multiple SoundCloud recordings — all managed from the admin form — giving Elif full per-event editorial control without code changes.

**Requirements:** D-01 through D-19 (tracked in 08-CONTEXT.md)

**Depends on:** Phase 7

**Plans:** 3/4 plans executed

Plans:
- [x] 08-01-PLAN.md — DB schema (showcaseRecordings table + merch_handles + links columns) + drizzle-kit push [BLOCKING] + data migration (Wave 1)
- [x] 08-02-PLAN.md — Server actions (recordings CRUD + links/merch in create/update) + queries (getShowcaseRecordings) (Wave 2)
- [x] 08-03-PLAN.md — Public components (RecordingsList + ShowcaseMerchSection + ShowcaseLinksList) + showcase detail page update (Wave 3)
- [ ] 08-04-PLAN.md — Admin form updates ([slug] + new) + ShowcaseMerchPicker client component + /api/admin/shopify-products route (Wave 3)

---

## Coverage Validation

All 48 v1 requirements are mapped to exactly one phase. No orphans.

| Requirement | Phase |
|-------------|-------|
| INFRA-01 | Phase 1 |
| INFRA-02 | Phase 1 |
| INFRA-03 | Phase 1 |
| INFRA-04 | Phase 1 |
| INFRA-05 | Phase 1 |
| CMS-01 | Phase 1 |
| CMS-02 | Phase 1 |
| CMS-03 | Phase 1 |
| CMS-04 | Phase 1 |
| CMS-05 | Phase 1 |
| CMS-06 | Phase 1 |
| DSYS-01 | Phase 2 |
| DSYS-02 | Phase 2 |
| DSYS-03 | Phase 2 |
| DSYS-04 | Phase 2 |
| DSYS-05 | Phase 2 |
| REL-01 | Phase 3 |
| REL-02 | Phase 3 |
| REL-03 | Phase 3 |
| REL-04 | Phase 3 |
| REL-05 | Phase 3 |
| REL-06 | Phase 3 |
| REL-07 | Phase 3 |
| ARTST-01 | Phase 4 |
| ARTST-02 | Phase 4 |
| ARTST-03 | Phase 4 |
| ARTST-04 | Phase 4 |
| POD-01 | Phase 5 |
| POD-02 | Phase 5 |
| PRESS-01 | Phase 5 |
| PRESS-02 | Phase 5 |
| SHOW-01 | Phase 5 |
| SHOW-02 | Phase 5 |
| SHOW-03 | Phase 5 |
| PAGE-01 | Phase 5 |
| PAGE-02 | Phase 5 |
| PAGE-03 | Phase 5 |
| PAGE-04 | Phase 5 |
| FORM-01 | Phase 6 |
| FORM-02 | Phase 6 |
| FORM-03 | Phase 6 |
| FORM-04 | Phase 6 |
| FORM-05 | Phase 6 |
| FORM-06 | Phase 6 |
| SEO-01 | Phase 7 |
| SEO-02 | Phase 7 |
| SEO-03 | Phase 7 |
| SEO-04 | Phase 7 |

---

## Key Decisions Captured

| Decision | Rationale |
|----------|-----------|
| Schema locked in Phase 1 before any content | Keystatic has no migration tooling — changing schema after content entry means editing every YAML file by hand |
| Design system before content pages | Nav, footer, and tokens are shared by every page; doing this in Phase 2 prevents visual rework in Phases 3–7 |
| Releases before artists (Phase 3 before Phase 4) | Releases are the primary identity of the label; artist pages reference releases; embed pattern established in Phase 3 is reused in Phase 4 and 5 |
| Secondary pages after core content (Phase 5 after Phase 4) | Podcasts, press, and showcases follow the embed and SSG patterns already proven in Phases 3–4 |
| Forms after pages (Phase 6 after Phase 5) | Forms need their host pages to exist and look correct before they can be meaningfully tested in context |
| SEO last but mandatory (Phase 7) | Structured data and metadata audits only make sense once all pages are complete and populated with real content |
| Cloudflare Workers via @opennextjs/cloudflare | Only free-tier host compatible with Keystatic (Node.js runtime required); Vercel Hobby banned for commercial use; @cloudflare/next-on-pages is deprecated |
| Keystatic local mode only in v1 | GitHub OAuth bug on Workers (issue #1497) is unresolved; local-edit + git-push is the viable v1 workflow |

---

*Roadmap created: 2026-04-04*
*Phase 2 plans added: 2026-04-22*
*Phase 5 plans added: 2026-04-23*
*Phase 8 plans added: 2026-04-30*
*Next: `/gsd-execute-phase 8`*
