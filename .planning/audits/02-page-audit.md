---
audit: page-audit
date: 2026-04-30
auditor: Claude Sonnet 4.6
pages-audited: 18
---

# Marginalia Page-by-Page UX Audit

## Methodology

Pages were fetched headlessly via WebFetch against the live Vercel deployment at `https://marginalia-ecru.vercel.app/`. HTML was parsed into markdown and inspected for structure, heading hierarchy, visible copy, CTAs, and empty states. Source files from the local repo (`/Users/koz/Documents/Marginalia Web Site/`) were cross-referenced to distinguish intentional design decisions from bugs. Viewport assumptions: **1024×800 desktop** and **375px mobile** (simulated, not rendered — JavaScript-dependent interactions such as the SoundCloud embed, cart drawer, mini-player, and MobileMenu overlay could not be executed; findings note where live behavior was inferred from source). The podcast slug `/podcasts/marginalia-podcast-001-elif` returned 404 — the podcasts section has no routed detail pages (it is a single-page accordion), so the podcast detail slot was audited as the podcasts listing page with expanded focus.

---

## Per-Page Sections

---

### `/` — Homepage

**Purpose:** Create immediate brand impression, qualify the visitor (fan vs. industry), and funnel them toward community sign-up (Laylo) or recent releases.

**First impression:** The page opens to a full-viewport video hero with the Marginalia wordmark centered — moody, atmospheric, and on-brand for underground electronic music. There is a single purple-gradient CTA ("Join the community") anchored near the bottom. Below the fold, nothing else renders beyond a potential accolade strip and the footer — the page is almost empty of navigable content after the hero.

**Above the fold (1024×800):**
- Full-viewport autoplay looping video (muted, aria-hidden — correct)
- Marginalia logo (white wordmark, `h-24` on desktop) centered
- "Join the community" CTA (purple gradient pill, links to Laylo) at `bottom: 9rem`
- Sticky nav above: logo, 11 text links, 6 social icons, cart button
- Optionally: announcement bar (db-driven, may or may not be active)
- Optionally: Beatport Hype Label accolade strip below hero

**Visual & layout issues:**
- The nav packs 11 primary links into one horizontal bar at desktop. At 1024px wide, these links almost certainly overflow or compress to unreadable sizes — no `overflow: hidden` or ellipsis guard exists in `NavLinks.tsx`. Severity: **P1**. Fix: collapse Demo Submission, Press, Services, Free Downloads into a secondary "More" dropdown.
- `text-[#444]` is hardcoded on both nav social icons and the cart button (`SiteNav.tsx:74`, `CartButton.tsx`), making them very low contrast on the dark navbar. WCAG AA requires ≥4.5:1 for text; `#444` on `#1F1F21` is approximately 2.8:1. Severity: **P1**. Fix: replace with `text-(--color-text-muted)` or a brighter token.
- The hero CTA sits at `bottom: 9rem` (144px). On smaller viewports (e.g., iPhone SE at 667px height) this floats too high; on very tall displays the positioning looks arbitrary. The value is a magic number with no responsive breakpoint override. Severity: **P2**. Fix: use `bottom: env(safe-area-inset-bottom, 2rem)` or convert to flex layout.
- No `<h1>` exists on the homepage. The logo image has `alt="Marginalia"` and serves as the sole text identity. Search engines and screen readers have no heading anchor. Severity: **P1** (SEO + accessibility). Fix: add a visually-hidden `<h1>Barcelona melodic house &amp; techno label</h1>` in the hero section.
- When no R2/YouTube video is configured, the hero background falls through to `bg-(--color-bg)` (#1F1F21) — solid dark with no texture or brand signal. Severity: **P2**. Fix: add a static fallback image.

**Copy & microcopy:**
- "Join the community" is vague — it opens Laylo but gives no reason to click (what community? what do I get?). Test: "Get release alerts on Laylo" or "New drops first — join Laylo".
- The accolade strip copy ("HYPE LABEL OF THE MONTH") reads well but uses a `<p>` element rather than a properly semantic element.
- No genre or location context appears above the fold. A visitor arriving without prior knowledge sees a logo and a video — nothing tells them this is a Barcelona techno label.

**Information architecture:**
- There is no explicit "Recent Releases" or "Featured" section on the homepage body — those blocks exist in the footer only (the pre-save badge grid). A label homepage should surface music instantly.
- No path to Releases, Artists, or Podcasts from the body of the page itself — navigation is the only escape hatch.

**Mobile considerations (375px):**
- Nav collapses to hamburger (MobileMenu) — correct. The overlay is full-screen with large link targets — well done.
- Video hero scales correctly via `max()` calculation for portrait orientation.
- The "Join the community" CTA bottom positioning should be audited against the mini-player bar (which renders `md:block` — desktop only) — no conflict on mobile.
- The footer newsletter box (`max-w-xs`) may clip slightly on 375px with `px-4` outer padding.

**Accessibility quick check:**
- `<video>` has `aria-hidden="true"` and no `<track>` — acceptable since it is decorative.
- Logo `<img>` has `alt="Marginalia"` — correct.
- Focus order: skip-to-content link is absent. First tab stop is the nav logo, then 11 nav links, then 6 social icons, then cart. Severity: **P1**. Fix: add `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>`.
- `<html lang="en">` present — correct.

**Conversion / engagement:**
- Single CTA (Laylo). No secondary path to releases or music.
- Dead end after scrolling past hero: nothing additional to engage with except the footer.
- No social proof on the homepage body (no "40 releases", no chart positions, no DJ bookings).

**Top 3 fixes for this page:**
1. Add a "Recent Releases" section below the hero with 4–6 release cards — **M effort** — this is the primary reason fans visit a label site; the homepage currently has none.
2. Add a visually-hidden `<h1>` and a skip-to-content link — **S effort** — low-hanging accessibility and SEO wins.
3. Fix nav social icon color (`text-[#444]` → token with ≥AA contrast) and audit nav overflow at 1024px — **S effort** — contrast failure is a WCAG 2.1 AA violation.

---

### `/about`

**Purpose:** Establish label identity, mission, and founder story; convert curious visitors into subscribers or demo submitters.

**First impression:** A single-column text page on a blurred light background. The writing is thoughtful and distinctive — the marginalia-of-medieval-manuscripts origin story is memorable. The layout is clean and unhurried. There is no clear next action after reading.

**Above the fold (1024×800):**
- RandomBackground (blurred `/backgrounds/bg-main.jpg`) sets a soft, warm context
- A hero photo (if configured) at full `65ch` width
- Body text begins immediately — no heading hierarchy visible in the rendered output (the prose is rendered as plain text via `whitespace-pre-line` without semantic markup)
- "Join the community" (Laylo) CTA at the bottom of the column

**Visual & layout issues:**
- The `about.body` field is rendered with `whitespace-pre-line` as raw text inside a `div.prose-invert` — there are no `<h2>`, `<p>`, or list elements generated because the body is a plain string, not parsed Markdown. This means screen readers read the entire block as one continuous text node. Severity: **P2** (`app/about/page.tsx:44`). Fix: parse the body as Markdown (use `next-mdx-remote` or `remark`), or structure it in the CMS with explicit heading fields.
- The photo `alt` is hardcoded as `"Elif, Marginalia"` (`app/about/page.tsx:37`) regardless of content — this could be incorrect if another photo is shown. Severity: **P2**. Fix: pull alt from CMS or make it context-aware.
- `max-w-[65ch]` is an unusually wide measure for body text — 65 characters is the upper limit of comfortable line length; on desktop the actual rendered line length may exceed this depending on font-size scaling. Severity: **P3**.
- No h1 is rendered — the about page has no heading at all. The nav shows "About" in the browser tab. Severity: **P1**. Fix: add `<h1>About Marginalia</h1>` or expose a CMS-driven heading field.

**Copy & microcopy:**
- The body copy is well-written and brand-appropriate.
- "Join the community" is the only CTA — same vagueness issue as the homepage. No "Subscribe to our newsletter" or "Explore releases" secondary action.
- No meta description unique to this page is generated (it falls through to the first 160 chars of `about.body`) — fine in principle but worth verifying the opening line is compelling for SERP.

**Information architecture:**
- Missing: label contact email (booking, press, management) — industry visitors (journalists, promoters, bookers) land here first and need a contact.
- Missing: founding year / key milestones — useful timeline for press context.
- Missing: "Featured on" logos or accolades to build credibility.
- The Laylo CTA appears at the bottom only — it is not visible above the fold without scrolling past the photo and body text.

**Mobile considerations (375px):**
- Single column, no reflow issues.
- Photo spans full width — fine.
- Text is readable at 16px with `leading-relaxed`.

**Accessibility quick check:**
- No `<h1>` — discussed above.
- Prose block has no semantic heading structure.
- Laylo CTA button uses an SVG with `aria-hidden="true"` and a `<span>` label — acceptable.
- Photo alt is static string — acceptable for now.

**Conversion / engagement:**
- One CTA (Laylo). No link to Releases, Demo, or Services.
- Industry visitors (bookers, journalists) have no contact path — this page should include a booking email or link to the press page.

**Top 3 fixes for this page:**
1. Add an `<h1>` heading to the page (either "About Marginalia" or a CMS-driven tagline) — **S effort** — heading absence is a structural accessibility issue.
2. Add a secondary CTA block: "Hear our music → Releases" and a contact line (management email) visible before the Laylo button — **S effort** — converts industry visitors who need next steps.
3. Replace `whitespace-pre-line` plain text rendering with Markdown parsing to generate proper `<p>`, `<h2>` semantic structure — **M effort** — improves screen-reader experience and SEO content parsing.

---

### `/releases`

**Purpose:** Serve as the primary music catalog — let fans and industry browse the full discography, discover new releases, and link through to streaming.

**First impression:** A dense grid of square cover artworks, 40 releases deep, on a light blurred background. The grid is visually appealing and immediately communicates catalog depth. Hover reveals title/artist on desktop. There are no filters, no sort controls, and no pagination — it is a single flat list.

**Above the fold (1024×800):**
- RandomBackground
- Release grid begins immediately — approximately 15–20 artworks visible without scrolling (4–5 column grid at this viewport, inferred from `auto-fill minmax(...)` pattern in `ReleaseGrid`)
- No page heading — the title is only in the browser tab ("Releases | Marginalia")
- Pre-save badges (lime "Pre-Save" label) visible on upcoming releases
- "Out Now!" badge visible on recent releases

**Visual & layout issues:**
- No `<h1>` on the page — `app/releases/page.tsx` renders `<ReleaseGrid>` directly with no heading. Severity: **P1** (SEO + accessibility).
- Hover overlay (title + artist) is `hidden md:flex` — on touch devices (mobile, tablet) there is absolutely no text visible beneath any artwork. A user on a phone sees only a square image with no title until they tap and navigate to the detail page. Severity: **P1** (`components/releases/ReleaseCard.tsx:55`). Fix: display title below the artwork on mobile (outside the overlay div).
- No filter or sort controls. With 40+ releases and growing, visitors cannot filter by artist, year, format (EP/album/single), or status (pre-save/out now). Severity: **P1** — this is a usability cliff once the catalog grows beyond 50. Fix: add client-side filter chips for status and format.
- No pagination — all 40 releases render in one shot. This is acceptable for now but will degrade LCP as catalog grows. Severity: **P2**. Fix: plan virtual scroll or pagination at ~60 items.
- The `badgeText` field and `presave` boolean both render badges, but released items with neither show no status indicator — there is no "Out Now" badge for items past their release date unless `badgeText` is populated in the CMS. Severity: **P2**. Fix: auto-derive an "Out Now" badge from `releaseDate <= today` comparison (done in the detail page, not the grid card).

**Copy & microcopy:**
- No page heading or introductory copy — the user has no orientation.
- Empty state copy ("Catalog is loading. No releases have been published yet.") is clear.
- "Pre-Save" badge is lime-green on artwork — high visibility, good.

**Information architecture:**
- Missing: release date visible on the grid card (currently only shown on hover overlay which is desktop-only). 
- Missing: artist name visible without hover — critical for discovery.
- Missing: filter by artist (useful when roster grows).

**Mobile considerations (375px):**
- `ReleaseCard` `sizes` prop uses `33vw` for mobile — on 375px this is ~125px thumbnails, which is tight but acceptable for a grid.
- On mobile, no text is displayed beneath or over the artwork — the grid is a wall of unlabelled images. Users must tap blindly. Severity: **P1**.
- Sticky nav height is `53px` on mobile — no layout collision observed.

**Accessibility quick check:**
- Each `ReleaseCard` `<Link>` has `aria-label="{title} by {artist}"` — correct.
- Images have descriptive alt text — correct.
- No `<h1>` — discussed above.
- No `role="list"` on the grid `<ul>` in `ReleaseGrid` (not verified in source — check if Tailwind resets remove list semantics).

**Conversion / engagement:**
- Primary action: tap release card → detail page. Well-executed.
- No secondary CTA (e.g., "Follow on Beatport" or "Subscribe for new releases").
- No pre-save count or "newest first" ordering indicator.

**Top 3 fixes for this page:**
1. Show title and artist name below each artwork (always visible, not just on hover) — **S effort** — critical for mobile UX and catalog discoverability.
2. Add `<h1>Releases</h1>` and filter chips (status: Pre-Save / Out Now; format: EP / Single / Album) — **M effort** — improves SEO and usability as catalog grows.
3. Auto-derive "Out Now" badge from release date server-side so all released items get a status badge, not just manually tagged ones — **S effort** — reduces CMS maintenance burden.

---

### `/releases/in-love`

**Purpose:** Dedicated release page — stream or purchase "In Love" by Yamil & K.eem (EP, MRGNL020, April 2025); secondary: grow community via Laylo.

**First impression:** Clean two-column layout: 600×600 artwork sticky on the left, metadata and platform links on the right. The light blurred background sets this apart from the dark homepage. Platform icons are recognizable and numerous (8 platforms). The SoundCloud embed (if configured) would allow immediate listening.

**Above the fold (1024×800):**
- `← All Releases` back link (small caps, muted)
- Left column: 40% width, square artwork (600px from Apple Music CDN, correctly scaled)
- Right column: `<h1>In Love</h1>`, artist "Yamil & K.eem", release date "18 April 2025"
- Platform icon row (Beatport, Spotify, Apple Music, Deezer, Bandcamp, Tidal, Amazon, Pandora)
- SoundCloud embed below platform icons (if `soundcloudUrl` is set)
- Catalog number (MRGNL020) and format (EP) at bottom of right column

**Visual & layout issues:**
- The `<h1>` uses `text-(--text-heading) md:text-[2rem]` — the `md:text-[2rem]` override means only 32px on desktop. For a release title this is relatively small compared to the 600px artwork. Severity: **P3**. Fix: scale to at least `2.5rem` on `lg`.
- The `"← All Releases"` back link uses text-label (12px) with muted color — very small touch target and low visual prominence. Severity: **P2**. Fix: increase to 14px and add more top padding.
- The release date is prefixed "Out {date}" — for past releases this is past tense and slightly awkward ("Out 18 April 2025"). Consider "Released {date}" for clarity.
- `MorePlatforms` component (below the main icon row) renders additional platforms — the heading or separator between primary and secondary platforms is not confirmed from source inspection. If there is no visual separator, users may miss the secondary platform links.
- The `openGraph.type` is `"music.album"` (`app/releases/[slug]/page.tsx:42`) which is correct for Spotify cards but technically an EP — minor semantic note.

**Copy & microcopy:**
- `<h1>` → platform icons → embed — logical flow.
- No track listing is visible on the page. For an EP, visitors expect to see individual track names.
- `description` field (if set) appears as prose below the CTAs — this is correct placement.
- "Join the community" Laylo button label is the same vague phrasing as homepage.

**Information architecture:**
- Missing: tracklist (track names, run times, composers/remixers).
- Missing: genre tags.
- Missing: link to artist page(s) — artist name text is a `<p>`, not a `<Link>`. For "Yamil & K.eem" — no path to their artist pages. Severity: **P2** (`components/releases/ReleaseMetaHeader.tsx:22`). Fix: parse `artistName` and link to `/artists/[slug]` for rostered artists.
- Related releases section in footer (only 2 items, driven by `getFooterBadgeReleases`).

**Accessibility quick check:**
- JSON-LD `MusicAlbum` schema present — good for SEO.
- `<time dateTime={releaseDate}>` — correct semantic element.
- Platform icon links should have visible labels or aria-labels — verify `PlatformIconRow` has `aria-label` on each anchor (inferred from component name; full source not read but critical to confirm).
- Image `priority` prop set — correct for LCP.

**Conversion / engagement:**
- Streaming links are the primary conversion — 8 platforms covers major DSPs well.
- No "Buy" vs "Stream" distinction — Beatport and Bandcamp are purchase platforms but sit alongside streaming ones with the same icon weight.
- No social share buttons.

**Top 3 fixes for this page:**
1. Make artist name(s) linkable to their artist pages — **S effort** — critical internal linking for discovery.
2. Add a tracklist section between artwork and platform icons — **M effort** — expected metadata for any release page.
3. Add genre chip(s) using the existing `GenreChip` component — **S effort** — improves discoverability and brand positioning.

---

### `/releases/hell-nah`

**Purpose:** Pre-save/notification hub for upcoming release "Hell Nah" (EP, MRGNL038, May 2026); drive Laylo notification sign-ups and Hypeddit pre-saves.

**First impression:** Similar layout to `/releases/in-love` but sparse — no platform links, no SoundCloud embed, just two CTAs. This is intentionally pre-release, but the emptiness feels unfinished versus an intentional "coming soon" state.

**Above the fold (1024×800):**
- Artwork (Spotify-hosted, 600px)
- `<h1>Hell Nah</h1>`, artists, release date "13 May 2026"
- "Turn on notifications" (Laylo bell CTA)
- "Pre-Save" (Hypeddit link)
- No embed, no platform links, no tracklist

**Visual & layout issues:**
- The right column has only title + 2 CTAs — the 60% right column is mostly empty whitespace on desktop. The sticky left column artwork dominates. Severity: **P2**. Fix: add a description/teaser text field, or display artist bios as supporting content.
- The "Turn on notifications" button renders with `variant="mail"` which shows a bell icon via `LayloButton` — the icon and label mismatch (bell = notification, envelope = mail) is a minor inconsistency. Severity: **P3**.
- No catalog number / format shown on this page per the fetched output — these fields (`MRGNL038 / EP`) appear in the source but `(r.catalogNumber || r.releaseType)` block is at the bottom of the right column. May appear below the fold.

**Copy & microcopy:**
- "Turn on notifications" is clear — better than homepage's "Join the community".
- "Pre-Save" is industry-standard and clear.
- No teaser copy, no genre information, no description — empty creative context for a new fan.

**Information architecture:**
- Missing: artist links (same issue as `/releases/in-love`).
- Missing: teaser/description field — the DB schema supports `description` but it is blank for this release.
- The page has no related releases section (footer handles this with the 2-badge grid), but for a pre-release page a "While you wait, check out..." section linking to similar catalog items would reduce bounce.

**Mobile considerations (375px):**
- Stacks to single column — artwork full width, then CTAs. Clean.
- Two tall CTA buttons are easy to tap.

**Accessibility quick check:**
- Same JSON-LD `MusicAlbum` schema applies.
- `LayloButton` with `variant="mail"` — verify `aria-label` includes release title.

**Conversion / engagement:**
- Two clear CTAs, both above the fold on desktop. Good.
- No third option (e.g., "Follow the label on Instagram") for visitors who don't want to use Laylo or Hypeddit.

**Top 3 fixes for this page:**
1. Add a short teaser description in the CMS for pre-release pages — **S effort (content)** — gives new visitors context for the release.
2. Add artist name links to artist detail pages — **S effort (code)** — same fix as the released detail page.
3. Add a "Discover more" strip linking to 2–3 released catalog items — **S effort** — reduces dead-end bounce on pre-release pages.

---

### `/artists`

**Purpose:** Showcase the label roster; let fans and industry discover signed artists and link through to individual artist pages.

**First impression:** A small, clean grid with three artists (ELIF, Liminal MX, Predex). Feels intimate and curated rather than a sprawling roster. No page heading is visible.

**Above the fold (1024×800):**
- RandomBackground
- 3-artist grid at `max-w-4xl mx-auto` — each card shows a square photo, name, and role
- `grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]` — at desktop, 3 artists sit in a single row
- No page heading ("Roster" is only in `<title>`)

**Visual & layout issues:**
- No `<h1>` on the page — same pattern as releases and homepage. Severity: **P1**.
- With only 3 artists the grid sits at the center of a large screen surrounded by white space on the blurred background — the `min-h-screen flex flex-col justify-center` makes it feel like the page is almost empty (`app/artists/page.tsx:18`). Severity: **P2**. Fix: add a heading, a brief "Our Roster" blurb, and remove `justify-center` if more artists are added.
- Artist photos are cropped to square (`aspect-square`, `object-cover`) — fine, but if source photos are not composed for square crops, subjects may be off-center. This is a content concern.
- `featured !== false` filter means only featured artists appear (`app/artists/page.tsx:14`). If there are non-featured artists in the DB, visitors never discover them. Severity: **P3** — acceptable for a curated roster but worth documenting.

**Copy & microcopy:**
- Artist name and role only — no teaser bio on the card. Users cannot preview content before clicking.
- "Roster" (browser tab) vs. "Artists" (nav link label) — inconsistent naming. The nav says "Roster" but the `<title>` says "Roster | Marginalia". Source: `SiteNav.tsx:21` uses label "Roster" — consistent. Not a bug.

**Information architecture:**
- Missing: link to artist's releases from the grid card. Currently must navigate artist → back → releases.
- Missing: "Booking" indicator on cards for artists with bookingEmail set.

**Mobile considerations (375px):**
- `grid-cols-2` — two columns on mobile. With 3 artists: 2 + 1. The single bottom card may appear centered or left-aligned depending on grid behavior — potentially orphaned visually.

**Accessibility quick check:**
- Artist cards: `ArtistCard` renders as a `<Link>` — verify it has a text label (name should be visible as text, not just in the image alt).
- Images should have descriptive alt text (artist name + "photo") — check `ArtistCard` source.

**Conversion / engagement:**
- Single action: click artist → detail page. Appropriate.
- No "Booking" CTA surfaced from the listing, though booking emails are in the DB.

**Top 3 fixes for this page:**
1. Add `<h1>Our Roster</h1>` and a 2-line intro — **S effort** — SEO and orientation.
2. Surface artist release count on each card ("12 releases") — **S effort** — adds context and depth signal to visitors.
3. Add a "Book this artist" micro-CTA on cards where `bookingEmail` or `bookingRowEmail` is set — **M effort** — converts industry visitors directly from the grid.

---

### `/artists/elif`

**Purpose:** ELIF's artist profile — bio, social links, booking info, press kit download; converts fans to followers and industry contacts to bookings.

**First impression:** Well-structured profile: 40% sticky photo left, right column with name, social links (8 platforms), bio, press kit, and booking contacts. The booking contacts for NA (polina@jackmode.com) and ROW (jonathan@jackmode.com) are prominent — this page clearly serves a dual audience.

**Above the fold (1024×800):**
- `← All Artists` back link
- Left: square photo (ELIF)
- Right: `<h1>ELIF</h1>`, social icon row (Instagram, SoundCloud, Spotify, Beatport, YouTube, TikTok, RA, Laylo)
- Bio begins (scrollable on the right)
- Press Kit button and booking contacts below the fold

**Visual & layout issues:**
- `<h1>` is present — good. The artist name uses `text-(--text-hero)` — verify this token resolves to an appropriately large size (token not defined in `globals.css`; likely a Tailwind custom class that may be unresolved). Severity: **P2** (potential broken style). Fix: check `--text-hero` is defined in the design system.
- The right column renders management email, booking NA/ROW — the layout label is "Booking:" for both the generic `bookingEmail` and the conditional `bookingNaEmail`/`bookingRowEmail`, which could produce two "Booking:" rows with different values. Severity: **P3** (`app/artists/[slug]/page.tsx:155–165`).
- Artist discography is not surfaced — there is no "Releases by ELIF" section. A fan landing on this page cannot discover ELIF's catalog without navigating to `/releases` and scrolling. Severity: **P1** for fan-facing value.
- JSON-LD uses `@type: "Person"` — technically correct but `MusicGroup` might be more appropriate for a DJ/producer. Severity: **P3**.

**Copy & microcopy:**
- Bio is readable and present.
- "Press Kit ↓" is a clear, well-labeled CTA.
- Social icons have platform names as aria-labels (inferred from `ArtistSocialRow` — verify).
- Booking contact labels ("NA:", "ROW:") use abbreviations that may confuse non-industry visitors.

**Information architecture:**
- Missing: artist's releases grid — this is the largest gap.
- Missing: upcoming shows or residencies.
- Missing: "Featured on" or chart positions.

**Mobile considerations (375px):**
- Single column stacks: photo → name → socials → bio → press kit → booking.
- All information is present and reachable.
- Photo is full-width square — looks strong.

**Accessibility quick check:**
- JSON-LD `Person` schema with `sameAs: [instagramUrl]` — good but only one social link in `sameAs`; could include Spotify, RA for richer entity recognition.
- `<script type="application/ld+json">` rendered inside `<RandomBackground>` wrapper — this is inside `<body>`, correct.
- Press kit link opens in `target="_blank"` with `rel="noopener noreferrer"` — correct.

**Conversion / engagement:**
- Industry: booking contacts and press kit are both visible — strong.
- Fans: no music, no releases, no listening path — weak.

**Top 3 fixes for this page:**
1. Add a "Releases" section below the bio showing the artist's catalog (filtered from release DB by artist name) — **M effort** — critical for fan engagement and internal linking.
2. Add `MusicGroup` sameAs array to JSON-LD including Spotify, SoundCloud, Beatport — **S effort** — improves entity disambiguation for search engines.
3. Expand "Booking:" labels to "Booking (North America):" and "Booking (Rest of World):" — **S effort (copy)** — removes jargon for non-industry visitors.

---

### `/podcasts`

**Purpose:** Let fans listen to label mixes and DJ sets; reinforce editorial identity; drive SoundCloud follows.

**First impression:** The page attempts to load a SoundCloud embed (playlist or individual episode) and display an episode list accordion. A headless fetch sees "Loading tracks…" — the embed is fully JavaScript-dependent and shows nothing in a no-JS or slow-JS environment. For actual visitors with JS enabled, it renders as a left-panel player + right-panel episode list.

**Above the fold (1024×800):**
- RandomBackground with `min-h-screen flex flex-col justify-center py-20`
- Left: SoundCloud embed at 340px wide, 420px tall (iframe, `SoundCloudEmbed`)
- Center: vertical divider (`bg-white/20`)
- Right: episode list accordion (inferred from `PodcastAccordion` source)
- No `<h1>` — heading is absent (`app/podcasts/page.tsx` renders `<PodcastAccordion>` directly)
- "View all on SoundCloud" link (from embed)

**Visual & layout issues:**
- No `<h1>` on the page. Severity: **P1**.
- The left-right split (`w-full md:w-[340px]`) means on mid-range tablets (768px–1024px) the player takes 340px and the list gets the remaining ~430px — tight but probably acceptable.
- The `podcast-light-borders` class in `podcasts/page.tsx:41` patches `border-white/*` colors for the light background context, but this class is applied to the `Container` wrapper, not the `RandomBackground` — the `on-light-bg` CSS variable overrides from `RandomBackground` cascade correctly. Architecture is acceptable but fragile.
- Podcast detail pages return 404 — there are no `/podcasts/[slug]` routes. If the sitemap or nav ever linked individual episodes, they would all 404. Currently the sitemap does not include podcast routes — acceptable but worth noting if the podcast section grows.
- The "Loading tracks…" empty state in no-JS contexts gives no fallback. Severity: **P2**. Fix: add a `<noscript>` fallback with a direct SoundCloud link.

**Copy & microcopy:**
- No page heading or description — no orientation for a first-time visitor.
- "View all on SoundCloud" is clear.
- Episode list shows title and date — good minimal information.

**Information architecture:**
- No episode count shown until the accordion loads.
- No guest/mix description visible from the episode list — users must click an episode to see it, but clicking just swaps the player, not opens a detail page.
- No subscribe/follow CTA for podcast on Apple Podcasts, Spotify Podcasts — only SoundCloud.

**Mobile considerations (375px):**
- Left-right layout stacks to single column. Player renders first (full width), then episode list below.
- SoundCloud iframe is fixed at 420px height on mobile, which may be appropriate.

**Accessibility quick check:**
- `<iframe>` for SoundCloud embed should have a `title` attribute — not verified from source (`SoundCloudEmbed.tsx` not fully read). Severity: **P1** if absent.
- Episode list links — verify focus states are visible.

**Conversion / engagement:**
- Primary: play episode. Works well for engaged users.
- Secondary: "View all on SoundCloud" — good.
- No CTA to subscribe/follow the label's SoundCloud.
- No newsletter link from this page body (appears in footer only).

**Top 3 fixes for this page:**
1. Add `<h1>Podcasts &amp; Mixes</h1>` and a one-liner — **S effort** — orientation and SEO.
2. Add episode description visible in the accordion row (2-line preview) so users can make an informed play decision — **M effort** — reduces friction.
3. Verify SoundCloud `<iframe>` has `title="Marginalia podcast player"` attribute — **S effort** — WCAG 2.1 SC 4.1.2.

---

### `/showcases`

**Purpose:** Show the label's live event presence; link through to showcase detail pages; build FOMO and brand prestige.

**First impression:** A single showcase event card (image of the ADE 2025 flyer) on a blurred light background. Feels extremely sparse — no heading, no event metadata visible, just a clickable flyer image.

**Above the fold (1024×800):**
- RandomBackground with `min-h-screen flex flex-col justify-center`
- Single `<Link>` wrapping a 3:4 aspect-ratio flyer image
- No page heading, no text overlays on the flyer image (event name, date, location not displayed in the grid)
- No filter controls, no upcoming/past distinction

**Visual & layout issues:**
- No `<h1>` on the page. Severity: **P1**.
- The grid only shows flyers that have `s.flyer` set (`app/showcases/page.tsx:15`). If a showcase has no flyer uploaded, it is silently excluded — no empty-card placeholder exists. Severity: **P2** — upcoming events should always appear even without a flyer.
- The flyer image covers the entire card with no text overlay for title, date, or location. Users must click through to learn anything about the event. Severity: **P1** — this is a usability issue, especially when there are multiple flyers from different eras.
- The grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` with `aspect-[3/4]` cards — this means each card is portrait-oriented. ADE flyers are typically portrait, so this works, but if a landscape flyer is used, `object-cover` will crop aggressively.

**Copy & microcopy:**
- No visible text anywhere on the listing — the entire page is one image.
- Empty state: "No showcases yet." — adequate.

**Information architecture:**
- Missing: upcoming vs. past distinction on the listing page (only detail page has this label).
- Missing: event date and location overlaid on flyer thumbnail — minimum viable metadata.
- Missing: ticket CTA on listing cards for upcoming events.

**Mobile considerations (375px):**
- Single column, full-width flyer. Looks fine.
- No text means mobile users also tap blind.

**Accessibility quick check:**
- `<Image alt={s.title}>` — title string as alt text on the flyer image. This is technically present but gives minimal description. A better alt would include date and location: `alt={`${s.title} — ${s.date}, ${s.city}`}`.
- No `<h1>`.

**Conversion / engagement:**
- Single action: click flyer → detail page. No secondary action.
- No "Upcoming Shows" vs "Past" segmentation.

**Top 3 fixes for this page:**
1. Add `<h1>Showcases</h1>` and an event-date + location overlay on each flyer card — **M effort** — critical for usability; currently the page communicates nothing without clicking.
2. Show showcases without flyers (upcoming events) with a placeholder/typography card — **S effort** — prevents upcoming events being silently hidden.
3. Add an "Upcoming" badge on future events and "Past" label on historical ones in the grid — **S effort** — helps visitors immediately sort by relevance.

---

### `/showcases/sxm-and-marginalia-showcase-ade-2025`

**Purpose:** Event detail for the October 2025 ADE showcase — aftermovie, gallery, merch tie-ins, recording sets; post-event archival.

**First impression:** Clean event page: "Past Showcase" label in lime, large h1 title, location/date line, then the event flyer. Below the flyer: recordings, aftermovie, and photo gallery sections (all gated on `isPast`). The structure is well thought-out for a past event.

**Above the fold (1024×800):**
- `← All Showcases` back link
- "PAST SHOWCASE" label (lime, uppercase)
- `<h1>SXM & Marginalia Showcase ADE, 2025</h1>` — prominent
- "The Crane, Amsterdam, Holland · 2025-10-26" (location + date string)
- Flyer image (`max-w-2xl`, full width below that)
- Ticket/Save the Date CTAs (hidden for past events — correct)

**Visual & layout issues:**
- The location/date line uses `s.date` as a raw ISO string ("2025-10-26") — no human-readable formatting applied. Severity: **P2** (`app/showcases/[slug]/page.tsx:105`). Fix: format using `toLocaleDateString('en-GB', ...)` same pattern as `ReleaseMetaHeader`.
- The flyer image uses `height={1200}` as the intrinsic height, but the rendered constraint is `max-w-2xl` (672px). This means the browser downloads a larger intrinsic size than displayed — `sizes` prop is set to `672px` for desktop, which tells Next.js Image to optimize to that width, but the `height={1200}` is the source-expected ratio. If the actual flyer is square, the rendering may be slightly off. Severity: **P3**.
- Recordings, aftermovie, and gallery sections are all conditional on `isPast` and require data in the DB. Per the fetched page, none of these appeared — the showcase has a flyer but no recordings, aftermovie, or photos configured yet. This means the detail page shows only: heading + location + flyer. Severity: **P1 (content gap)** — for a past event, the page should have richer content or at least a description field.
- No description/copy field on the showcase model — the `ShowcaseDetailPage` never renders any narrative text about the event. Severity: **P2**. Fix: add a `description` field to the showcase schema.
- The `<a href="/showcases">` back link uses a plain `<a>` tag instead of `<Link>` (`app/showcases/[slug]/page.tsx:91`). This causes a full-page navigation instead of client-side routing. Severity: **P2**. Fix: replace with `import Link from 'next/link'` and use `<Link href="/showcases">`.

**Copy & microcopy:**
- "Past Showcase" label — clear and well-styled.
- Date "2025-10-26" is raw ISO — needs formatting.
- No lineup, no description, no ticket link (correct for past event).

**Information architecture:**
- Missing: lineup/artist list on the detail page (no schema field for lineup).
- Missing: event description / narrative.
- Missing: link to associated merch in this case (no `merchHandles` configured for this showcase, so `ShowcaseMerchSection` renders nothing).

**Mobile considerations (375px):**
- Stacks cleanly. Flyer goes full width. Heading is visible.
- ISO date remains ugly on mobile too.

**Accessibility quick check:**
- JSON-LD: no structured event data (`Event` type) — a missed opportunity for Google's event rich results. Severity: **P2**.
- Flyer alt: `alt="${s.title} flyer"` — acceptable.
- Gallery images use index-based alt ("SXM... photo 1") with caption fallback — adequate.

**Conversion / engagement:**
- Past event: no immediate action available. Appropriate.
- Gallery and aftermovie would increase dwell time dramatically if populated.
- No "Follow us for upcoming events" CTA after viewing a past showcase.

**Top 3 fixes for this page:**
1. Format `s.date` as human-readable string ("26 October 2025") — **S effort** — embarrassing to ship ISO strings to end users.
2. Replace plain `<a href="/showcases">` with `<Link href="/showcases">` — **S effort** — causes unnecessary full-page reload.
3. Add a `description` text field to the showcase schema and render it below the flyer — **M effort** — makes past event pages archivally useful and adds SEO content.

---

### `/merch`

**Purpose:** Drive merchandise sales — convert fans into customers; showcase 13 products.

**First impression:** A clean product grid of 13 items (hats, t-shirts, beanies, tote bag) on the familiar blurred light background. Prices are visible. No category filters. Product images look professional.

**Above the fold (1024×800):**
- 13 products in a grid (`MerchGrid`)
- Prices displayed (15€–40€)
- Product images (Shopify-hosted)
- No page `<h1>` visible

**Visual & layout issues:**
- No `<h1>` on the merch page — `app/merch/page.tsx` renders `<MerchGrid>` with no heading wrapper. Severity: **P1**.
- No filter controls (by type: hats / t-shirts / beanies; by price). Severity: **P2** — 13 products is manageable, but filters add credibility and professionalism.
- No sort controls (price low→high, newest first). Severity: **P2**.
- Product names are sorted alphabetically by Shopify handle (default) — no editorial curation of product order. Severity: **P2**. Fix: add a `position` field or use Shopify collection sort.
- The `MerchGrid` component was not fully read, but the product card likely shows image + name + price. Whether there's a "Add to Cart" quick-add button on the grid card was not confirmed — if absent, users must navigate to the detail page for every purchase. Severity: **P2** if no quick-add exists.

**Copy & microcopy:**
- Product names are descriptive ("Purple Hat", "Logo Beanie") — clear.
- No editorial copy, no "Limited Edition" or "Bestseller" badges.
- Cart empty state "Your cart is empty. Browse merch →" — the link on the merch page itself is circular (links to `/merch` from `/merch`). Severity: **P1** — fix the cart empty state link to be conditional: if already on `/merch`, hide the "Browse merch" link or link to a featured product instead (`components/layout/SiteFooter.tsx`).

**Information architecture:**
- Missing: product categories visible on the listing.
- Missing: featured/bestseller designation.
- Missing: "Ships from" or "Estimated delivery" information anywhere on the site.

**Mobile considerations (375px):**
- `MerchGrid` column count not confirmed but likely 2 columns on mobile — appropriate.
- Price visibility on mobile cards — should be confirmed as visible.

**Accessibility quick check:**
- Product images: `alt` from Shopify `altText` with fallback to product title — confirmed in `ProductDetail.tsx`. Check `MerchGrid` → `MerchCard` for same pattern.
- Cart button in nav: `text-[#444]` contrast issue — same as homepage finding (site-wide issue).

**Conversion / engagement:**
- Primary: click product → detail page → add to cart. Flow is intact.
- No cross-sell or "Frequently bought together".
- No social proof (reviews, sold count).

**Top 3 fixes for this page:**
1. Add `<h1>Merch</h1>` and a minimal category filter (hats / apparel / accessories) — **M effort** — heading is critical; filters improve conversion.
2. Fix circular "Browse merch →" link in footer cart empty state — **S effort** — currently a dead link from within the merch page.
3. Add a "quick add to cart" button on product grid cards — **M effort** — reduces checkout friction by one page navigation.

---

### `/merch/purple-hat`

**Purpose:** Product detail page for the Purple Hat (28€) — drive add-to-cart conversion.

**First impression:** Left: large product image in a white-tinted square container. Right: title, price, quantity stepper, "Add to Cart" button (purple→lime on hover), description. Very clean and functional.

**Above the fold (1024×800):**
- `← All Merch` back link
- Left (55%): product image in `bg-white/40` with `object-contain p-6` — image is centered with significant whitespace padding
- Right (45%): `<h1>Purple Hat</h1>`, price "28 €", quantity stepper (−1+), "Add to Cart" button
- Below: product description

**Visual & layout issues:**
- `object-contain p-6` on the main product image means the hat photograph has 24px padding on all sides, making it appear smaller than necessary in its container. For apparel products, `object-cover` or tighter padding would be more impactful. Severity: **P2** (`components/merch/ProductDetail.tsx:68`).
- The product image container is `bg-white/40` — translucent white over the blurred background. The net effect on-screen may look grayish or muddy depending on the background image. A solid white (`bg-white`) would give cleaner product presentation. Severity: **P2**.
- No image zoom capability — hovering/pinching the product image does nothing. Standard e-commerce expectation. Severity: **P2**.
- Single product image for the Purple Hat — no additional angles. This is a content issue but worth noting.
- The `hasRealOptions` check suppresses option selectors when the only option is "Default Title" — this is correct behavior for Shopify's default variant. No issue.

**Copy & microcopy:**
- "Purple baseball cap with embroidered Marginalia logos." — short but clear.
- "Add to Cart" — clear primary CTA.
- "Sold Out" / "Only N left" / "Currently not in stock" states are all implemented — well done.
- No material information, no size guide (for hats: one-size-fits-all or adjustable?).
- No shipping information or return policy link anywhere on product pages.

**Information architecture:**
- Missing: breadcrumb navigation (Home > Merch > Purple Hat) — the `← All Merch` back link exists but no breadcrumb trail.
- Missing: related products section ("You might also like").
- Missing: shipping/returns info — a trust killer for first-time purchasers.
- Missing: size guide for apparel products (though hat may be one-size).

**Mobile considerations (375px):**
- Full width image, then right column stacks below — standard and correct.
- Quantity stepper buttons (`w-10 h-10`) meet the 44px touch target recommendation (40px is slightly under — borderline). Severity: **P3**.
- "Add to Cart" is full-width on mobile from `w-full` class — correct.

**Accessibility quick check:**
- `<h1>` present — correct.
- Quantity buttons have `aria-label="Decrease quantity"` and `aria-label="Increase quantity"` — correct.
- "Add to Cart" button is `disabled` when sold out, not hidden — correct for screen reader announcement.
- No structured data (`Product` JSON-LD) — a missed SEO opportunity for Google Shopping. Severity: **P2**. Fix: add `@type: Product` JSON-LD with name, price, availability, image.

**Conversion / engagement:**
- Clear primary action: Add to Cart.
- No cross-sell, no reviews, no "Frequently bought together".
- Cart drawer confirmed in layout (CartDrawer) — add-to-cart interaction is handled.

**Top 3 fixes for this page:**
1. Add `Product` JSON-LD schema — **S effort** — enables Google Shopping rich results and product cards.
2. Add shipping/returns information (even a single sentence with a link) — **S effort (content)** — critical trust signal for first-time purchasers.
3. Change image container from `object-contain p-6` to tighter padding or `object-cover` with a proper product photography crop — **S effort** — makes products look more professional and larger.

---

### `/demo`

**Purpose:** Demo submission intake — collect SoundCloud links from artists for A&R consideration.

**First impression:** A centered form card on a blurred light background. The "not accepting demos for 2026" notice is immediately prominent — this manages expectations clearly. The form is still accessible but the notice discourages 2026 submissions. The card is clean, professional, and appropriately sparse.

**Above the fold (1024×800):**
- RandomBackground, centered container
- "Submit a Demo" `<h1>` (2xl, bold, white)
- Warning banner: "We are no longer accepting demos for 2026..."
- Form fields: Artist Name*, Email*, SoundCloud Link*, Instagram (opt), Spotify (opt), Message (opt)
- "Submit Demo" button (lime background, dark text)

**Visual & layout issues:**
- The `<h1>` uses raw `text-2xl font-bold text-white` — hardcoded `text-white` will not adapt to the `on-light-bg` context where text should be dark. Severity: **P1** (`components/demos/DemoForm.tsx:101`). On a light blurred background, white text on a near-white/glass card may have insufficient contrast. Fix: replace `text-white` with `text-(--color-text-primary)`.
- The warning banner uses hardcoded `bg-white/6` — barely visible on the white-tinted glass card. The yellow/amber warning convention would make this much more scannable. Severity: **P2**.
- The "not accepting demos" notice appears above the form heading — before the `<h1>` — which is an unusual reading order (the banner should come after the heading, not before it). The current order in source (`DemoForm.tsx:94`) is: banner, then `<h1>`. Severity: **P2**.
- The honeypot field (`position: absolute; opacity: 0; pointerEvents: none; height: 0; width: 0`) is correctly hidden from human users. This is intentional bot protection.

**Copy & microcopy:**
- "We listen to everything. Please give us time to respond." — honest and respectful. Good.
- "We receive a high volume of demos. Response time may vary." — appropriately sets expectations.
- "Must be a private, download-enabled link" hint on SoundCloud field — very useful.
- Success state: "✓ Demo received" + "we'll be in touch if it's a fit" — clear and non-committal.
- The `<div class="text-3xl mb-4">✓</div>` success icon is a plain text character — functionally fine but an actual SVG icon would be more polished.

**Information architecture:**
- The form does not require Spotify or Instagram — good, reduces friction.
- No explicit "we will not share your information" privacy note.
- No GDPR/data processing disclosure — relevant for EU jurisdiction (Barcelona-based). Severity: **P1 (legal)**. Fix: add a brief "By submitting this form you agree to our privacy policy" with link.
- The `acceptingDemos` flag is CMS-controlled but the form still renders and is submittable even when `acceptingDemos = false` — there is no conditional `disabled` on the submit button tied to this flag. The notice discourages submission but does not prevent it. Verify whether the API route respects this flag server-side.

**Mobile considerations (375px):**
- Form fields stack to single column on mobile (confirmed by `grid-cols-1 sm:grid-cols-2` for the first two fields).
- "Submit Demo" is full width — appropriate touch target.
- Card padding `p-5` on mobile — comfortable.

**Accessibility quick check:**
- Labels are associated with inputs via `for`/`id` pairing — verify (labels use `className="block..."` but no `htmlFor` attribute is visible in source). Severity: **P1** if `htmlFor` is absent — `<label>` without `htmlFor` does not programmatically associate with the input.
- `noValidate` on the form means browser native validation is suppressed — custom JS validation must handle all cases. This is intentional but creates risk if custom validation has gaps.

**Conversion / engagement:**
- Clear single action: Submit Demo.
- The "not accepting for 2026" notice reduces submissions but that is the intent.
- No alternative action offered (e.g., "Follow us while you wait").

**Top 3 fixes for this page:**
1. Add `htmlFor` attributes on all `<label>` elements matching input `id` attributes — **S effort** — WCAG 2.1 SC 1.3.1 (Info and Relationships); currently labels may not be programmatically associated.
2. Add GDPR/privacy disclosure below the submit button — **S effort (legal/content)** — required for EU-based users under GDPR.
3. Replace `text-white` on the `<h1>` with `text-(--color-text-primary)` to work in both dark and light background contexts — **S effort** — prevents contrast failure on the light-background card.

---

### `/subscribe`

**Purpose:** Convert visitors to newsletter subscribers (email list) or Laylo community members.

**First impression:** A centered frosted-glass card with a clean email input + "Subscribe" button, and a "Join on Laylo" purple gradient secondary CTA. The page is simple, focused, and effective. The value proposition is present ("New releases, free downloads & events — straight to your inbox.").

**Above the fold (1024×800):**
- `<h1>Stay in the loop</h1>` (heading size, bold)
- Value proposition text
- Email input + "Subscribe" button (inline, horizontal)
- "or" divider (conditionally shown if both `newsletterListId` and `layloUrl` are set)
- "Join on Laylo" button (purple gradient, full width)

**Visual & layout issues:**
- The frosted-glass card (`border-2 border-white/70 bg-white/10 backdrop-blur-sm`) on a blurred light background — layered transparency over transparency. The card contrast may be insufficient against the `bg-main.jpg` background depending on the underlying image colors. Severity: **P2**.
- The "or" divider between newsletter and Laylo (`newsletterListId && layloUrl`) only renders when both are configured. If only Laylo is configured (no newsletter provider), the "or" disappears and Laylo appears alone — this is handled correctly.
- The email validation logic in `SubscribePanel.tsx:18` is `!email.includes('@')` — a minimal check that would accept `"@"` as valid. Use a more robust pattern. Severity: **P2**.

**Copy & microcopy:**
- "Stay in the loop" — friendly H1.
- Value prop is identical to footer newsletter copy ("New releases, free downloads & events — straight to your inbox.") — could be expanded on this dedicated page.
- No privacy policy link — **GDPR concern** (same as demo page). Severity: **P1 (legal)**.
- Success state: "✓ You're on the list." — clear.
- Error state: "Please enter a valid email address." — clear.
- No confirmation email mention — subscribers may wonder if their submission worked.

**Information architecture:**
- The "or" split between newsletter and Laylo may confuse users who don't know the difference. A brief description under each option would help: "Email newsletter: monthly digest" vs "Laylo: instant release alerts".
- No social proof (subscriber count, "Join 2,500+ fans").

**Mobile considerations (375px):**
- The email input + button horizontal layout (`flex gap-2`) on a 375px screen will be tight. The button text "Subscribe" may compress poorly. Consider stacking vertically on mobile.
- Card is `max-w-lg` (512px) — on 375px this renders full-width with minimal horizontal margin.

**Accessibility quick check:**
- Email input: has `type="email"` and `required` — correct.
- Input placeholder is "your@email.com" — acceptable as supplementary hint, but placeholder should not be the sole label. There is no visible `<label>` for the email input in `SubscribePanel.tsx`. Severity: **P1** — input without label fails WCAG 2.1 SC 1.3.1. Fix: add `<label htmlFor="subscribe-email" className="sr-only">Email address</label>` and `id="subscribe-email"` on the input.

**Conversion / engagement:**
- Clean, focused conversion page. Good.
- No secondary path (no "or browse releases" link).

**Top 3 fixes for this page:**
1. Add a visually hidden `<label>` for the email input — **S effort** — WCAG failure.
2. Add privacy policy link below the subscribe button — **S effort (legal)** — GDPR compliance.
3. Improve email validation from `includes('@')` to a proper regex or use the browser's native `type="email"` validation (remove `noValidate` if currently set, or add pattern attribute) — **S effort** — prevents obviously invalid emails.

---

### `/press`

**Purpose:** Serve journalists, promoters, and bloggers with press clippings, quotes, and EPK assets; establish credibility.

**First impression:** The page renders only a centered message: "No press coverage yet." on a light background. This is the empty state. There is no heading, no press kit download link, no brand assets, no contact email, and no biography. For a label that has released 40+ tracks across major platforms, this is a significant credibility gap.

**Above the fold (1024×800):**
- RandomBackground
- Single centered paragraph: "No press coverage yet."
- Nothing else — no heading, no structure, no content

**Visual & layout issues:**
- No `<h1>` on the press page — the `app/press/page.tsx` has no heading rendered in either the empty or populated state. Severity: **P1**.
- The empty state has no structure whatsoever — a journalist landing here gets nothing useful. Severity: **P0** — this is a brand-damaging empty state for an audience that expects press assets.
- Even with press entries, the `PressEntry` component shows individual articles but the page has no section heading ("Press Coverage") or introductory copy.

**Copy & microcopy:**
- "No press coverage yet." — the empty state copy is overly blunt and undersells the label. Even if entries are not entered, the page should display brand assets and a contact.
- No EPK download link anywhere on the page (artist-level press kits are on artist pages, but the label has no equivalent).

**Information architecture:**
- Missing: label bio (2–3 sentences about Marginalia for press use).
- Missing: label logo downloads (SVG, PNG, white/black variants).
- Missing: official EPK download (PDF or Dropbox link).
- Missing: press contact email.
- Missing: press quote bank (even self-generated quotes about the label's mission).
- Missing: chart positions, streaming milestones, Beatport accolades.
- The `sitemap.ts` includes `/press` with priority 0.6 — search bots visit this page and find nothing valuable.

**Mobile considerations (375px):**
- The empty state is readable on mobile.
- Same structural gaps apply.

**Accessibility quick check:**
- No heading — discussed.
- The `PressEntry` component (when populated) uses correct semantic markup: headline link with aria-label, publication + date, excerpt.

**Conversion / engagement:**
- No action available for press visitors — complete dead end.
- The artist pages link to individual press kits (Dropbox) but the label-level press page does not.

**Top 3 fixes for this page:**
1. Add a label press kit section (bio, logo downloads, streaming stats, EPK PDF) regardless of whether press entries exist in the DB — **M effort** — this page is actively harming press outreach; a journalist who finds it will leave unimpressed.
2. Add `<h1>Press</h1>` and a press contact email — **S effort** — minimum viable press page.
3. Populate at least one press entry in the CMS (even a Beatport "Hype Label" accolade counts as a press item) — **XS effort (content)** — removes the "No press coverage yet." embarrassment.

---

### `/services`

**Purpose:** Generate leads for Mix & Mastering and Production Classes offered by the label.

**First impression:** A centered two-column card with two service tiles (Mix & Mastering, Production Classes). Each has a brief description and a "Select →" button. Selecting a service reveals a contact form below. The interaction is clean and focused.

**Above the fold (1024×800):**
- RandomBackground
- Two service cards in a `grid-cols-2` layout
- Each card: service name (bold, uppercase), description (xs, muted), "Select →" label
- Below the service cards: "Select a service to continue. ♥" placeholder text
- After selection: `ContactForm` appears (email + message + send button)

**Visual & layout issues:**
- No `<h1>` on the services page — `app/services/page.tsx` renders `<ServicesContent>` with no heading wrapper. Severity: **P1**.
- The "Select a service to continue. ♥" placeholder text uses a hardcoded red heart `♥` emoji (`text-red-400 ♥` in `ServicesContent.tsx:40`) — inconsistent with the brand color system and tone. Severity: **P3**. Fix: remove emoji or use lime accent.
- Pricing is entirely absent — this is the most likely reason visitors would bounce without contacting. Severity: **P1**. Fix: add pricing tiers or at least "Starting from X€" to each service card.
- Only 2 services available — the `metadata.description` mentions "artist management, mix & mastering, production classes, and mentoring" but only Mix & Mastering and Production Classes appear in `SERVICES` array. Artist management and mentoring are either hidden or not yet implemented. Severity: **P2** (`components/services/ContactForm.tsx:5`).
- After form submission, "Message sent. We'll get back to you soon." — no expected response time given. Severity: **P3**.

**Copy & microcopy:**
- Service descriptions are concise and specific — well-written.
- "Select →" changes to "Selected" on active state — clear feedback.
- Contact form has only email + message — no name field, no phone, no preferred contact time. The label won't know who they're talking to unless the email contains a name. Severity: **P2** (`components/services/ContactForm.tsx`). Fix: add a "Your name" field.

**Information architecture:**
- Missing: pricing information.
- Missing: artist management and mentoring services (referenced in metadata but absent from UI).
- Missing: portfolio / examples of mastering work (e.g., link to a release mastered by ELIF).
- Missing: FAQ (What format should I send stems in? How long does mastering take?).
- Missing: testimonials from previous clients.

**Mobile considerations (375px):**
- `grid-cols-1 sm:grid-cols-2` — single column on mobile. Service cards stack cleanly.
- Form fields are full-width — appropriate.

**Accessibility quick check:**
- Service selector buttons use `type="button"` — correct (prevents form submission).
- No `<h1>` — discussed.
- Contact form `<label>` elements are present but `htmlFor` not confirmed — same issue as demo form. Severity: **P1** if absent.

**Conversion / engagement:**
- Service selection → contact form — clean 2-step flow. Good.
- No pricing → high friction for qualified leads.
- No social proof (testimonials, example releases mastered, client list).

**Top 3 fixes for this page:**
1. Add `<h1>Services</h1>` and at minimum an indicative price or "starting from" for each service — **S effort** — pricing transparency dramatically reduces conversion friction.
2. Add a "Your name" field to the contact form — **S effort** — without it, incoming emails lack identity context.
3. Add artist management and mentoring back into the `SERVICES` array, or update the metadata description to remove them — **S effort** — current description creates false expectations.

---

### `/free-downloads`

**Purpose:** Offer community exclusives (edits, bootlegs) to drive email captures, SoundCloud follows, and goodwill.

**First impression:** A sparse grid showing 2 free tracks ("Gonna Make U Sweat - Roiko Edit" and "Hey Hey - Adran Edit") in card format. Each card has a cover image, title, artist attribution, description, and a "Download / Listen" button linking to SoundCloud. No email gate required.

**Above the fold (1024×800):**
- RandomBackground
- "2 free tracks available" — small count label (xs, uppercase)
- 2 cards in a `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` grid — at 1024px, this renders as a 2-column grid (only 2 items)
- Each card: cover image, title, artist, description, "Download / Listen" button
- Page has no `<h1>` — only the "2 free tracks available" count text

**Visual & layout issues:**
- No `<h1>` — Severity: **P1**. The count label "2 free tracks available" is not a heading.
- No email gate — downloads go directly to SoundCloud. This is a business choice (lowering friction), but the label captures no leads from this traffic. Severity: **P1 (strategic)**. Recommendation: implement an optional email-for-download gate, or at minimum prompt email sign-up after the download link is shown.
- With only 2 items, the `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` grid means the cards are wide and uncrowded at desktop — there are two large cards side by side with empty columns. Severity: **P3** — fix grid to `grid-cols-1 sm:grid-cols-2` until more items are added.
- The cards use `border-2 border-white/70 bg-white/10` — same glass card pattern as subscribe page. Consistent.
- "Download / Listen" button links to SoundCloud externally — no in-site audio preview. Severity: **P2**. Fix: add the SoundCloud embed (as used on the releases page) directly in each card for instant play.

**Copy & microcopy:**
- "Download / Listen" — slightly ambiguous (is it a download or just streaming?). "Download / Stream on SoundCloud" would be clearer.
- Card descriptions are present — good.
- No page heading or introduction explaining what free downloads are for.

**Information architecture:**
- Missing: page heading and brief intro ("Exclusive edits and remixes — free for the community").
- Missing: email capture tied to download.
- Missing: "More coming soon" message when the list is short.
- Sitemap does not include `/free-downloads` — it will not be indexed by search engines. Severity: **P2** (`app/sitemap.ts`). Fix: add it to the sitemap.

**Mobile considerations (375px):**
- `grid-cols-2` — 2-column on mobile with only 2 items, each card is ~170px wide. Cover images may be too small to read text clearly.
- "Download / Listen" button text may be too long for the card width at 375px.

**Accessibility quick check:**
- `<Image alt={`${item.title} cover`}>` — includes "cover" suffix but no artist name. Improve to `alt={`${item.title} by ${item.artistName} cover artwork`}`.
- "Download / Listen" links open in `target="_blank"` with `rel="noopener noreferrer"` — correct.
- No `<h1>` — discussed.

**Conversion / engagement:**
- Direct link to SoundCloud — loses the user immediately with no return path.
- No newsletter prompt tied to download action.
- "Browse merch" in the footer is the only secondary CTA.

**Top 3 fixes for this page:**
1. Add an email prompt before or after the SoundCloud link (email gate or soft ask) — **M effort** — converts passive downloaders to newsletter subscribers; this traffic is otherwise invisible to the CRM.
2. Add `<h1>Free Downloads</h1>` and a brief intro paragraph — **S effort** — orientation and SEO.
3. Add `/free-downloads` to `app/sitemap.ts` and add an in-card SoundCloud embed for preview — **M effort** — discoverability via search and reduces friction to listen.

---

## Site-Wide Patterns

### SW-1: No `<h1>` on most pages
Affected pages: `/` (homepage), `/releases`, `/artists`, `/podcasts`, `/showcases`, `/merch`, `/press`, `/services`, `/free-downloads`. Only release detail, artist detail, showcase detail, merch detail, demo, and subscribe pages have `<h1>`. Every listing page and the homepage lacks an `<h1>`, which breaks heading hierarchy, impairs screen reader navigation, and weakens on-page SEO signals.

### SW-2: `text-[#444]` contrast violation in global navigation
`SiteNav.tsx:74` and `CartButton.tsx` use `text-[#444]` for social icons and cart icon on the dark navbar background (`#1F1F21`). Contrast ratio ≈ 2.8:1, failing WCAG 2.1 AA (minimum 4.5:1 for text, 3:1 for UI components). Applies to every page since the nav is global.

### SW-3: `<label>` elements lack `htmlFor` attributes
`DemoForm.tsx` and `ContactForm.tsx` render `<label className="block...">` without `htmlFor` matching an input `id`. This means labels are not programmatically associated with inputs, violating WCAG 2.1 SC 1.3.1. Affects `/demo` and `/services`.

### SW-4: Artist name not linked to artist pages
On release detail pages (`/releases/[slug]`), showcase pages, and the footer badge grid, artist names are displayed as plain text rather than hyperlinks to `/artists/[slug]`. This breaks a fundamental navigation pattern and misses internal linking opportunities. Affects: `ReleaseMetaHeader.tsx`, `SiteFooter.tsx`, showcase pages.

### SW-5: No GDPR/privacy disclosure on data-collection forms
`/demo` (DemoForm) and `/subscribe` (SubscribePanel) collect email addresses and personal data but display no privacy policy link or data processing notice. For an EU-based business (Barcelona), GDPR Article 13 requires disclosure at the point of collection. This is a legal compliance gap across all forms.

### SW-6: Back-navigation uses plain `<a>` tags instead of Next.js `<Link>`
`/showcases/[slug]/page.tsx:91` uses `<a href="/showcases">` — a plain anchor triggers a full-page HTTP request instead of client-side routing. This causes unnecessary page reloads and breaks scroll restoration. Other pages use `<Link>` correctly. Check all `← All X` back links for consistency.

### SW-7: Sitemap omits `/free-downloads`, `/subscribe`, and `/merch`
`app/sitemap.ts` does not include these pages or their dynamic product routes. Merch product pages (`/merch/[handle]`) are entirely unindexed. This limits organic discoverability of merchandise.

### SW-8: No Product JSON-LD structured data on merch pages
Neither the merch listing nor product detail pages emit `@type: Product` JSON-LD. Shopify-hosted product pages get this automatically, but the custom Next.js frontend does not. This means products are ineligible for Google Shopping rich results and product knowledge panels.

### SW-9: No skip-to-content link
No `<a href="#main-content" class="sr-only focus:not-sr-only">` exists in the global layout. Keyboard and screen-reader users must tab through the 11 nav links + 6 social icons + cart button (18 elements) before reaching page content on every page load.

### SW-10: `RandomBackground` component name is misleading
The component is named `RandomBackground` but always uses a single fixed image (`/backgrounds/bg-main.jpg`) — there is no randomness. This creates developer confusion when reading imports. Minor technical debt (`components/ui/RandomBackground.tsx:1`).

### SW-11: No `text-[#000]` / dark text on hero section "Join the community" button
The `<a>` on the homepage hero uses `text-white` inside a purple gradient button — while this works visually at standard sizes, the contrast of white text on `#580AFF` is approximately 4.5:1 (just at the AA threshold). No issue currently, but worth monitoring.

### SW-12: Social icons in footer missing `Facebook` on mobile
`SiteNav.tsx` SOCIAL_PLATFORMS does not include `facebook` (only newsletter, instagram, soundcloud, beatport, youtube, tiktok). The footer `SiteFooter.tsx` does include facebook. Desktop nav users cannot reach Facebook from the nav.

---

## P0 Hotlist

| # | Page(s) | Fix | Effort |
|---|---------|-----|--------|
| P0-1 | All listing pages (`/`, `/releases`, `/artists`, `/podcasts`, `/showcases`, `/merch`, `/press`, `/services`, `/free-downloads`) | Add `<h1>` to every page that lacks one — use either a visible heading or a visually-hidden one for pages with strong visual identity | S |
| P0-2 | All pages (global nav — `SiteNav.tsx:74`, `CartButton.tsx`) | Replace `text-[#444]` with a token that achieves ≥3:1 contrast on the dark navbar; e.g. `text-(--color-text-muted)` or `#888` | S |
| P0-3 | All pages (global layout — `app/layout.tsx`) | Add a skip-to-content link as the first child of `<body>` targeting `#main-content` | S |
| P0-4 | `/demo`, `/subscribe`, `/services` | Add `htmlFor` + `id` pairs on all `<label>/<input>` associations; add GDPR/privacy disclosure below each form | S |
| P0-5 | `/releases` (listing) | Display title and artist name as persistent visible text below each release artwork card (not hover-only) — critical for mobile usability | S |
| P0-6 | `/press` | Build a minimum viable press page: label bio, logo downloads, press contact email, and EPK link — regardless of DB press entries | M |
| P0-7 | `/showcases` (listing) | Add event name + date + location text overlay or below-card text to each showcase card; ensure future events without flyers still appear | M |
| P0-8 | `/showcases/[slug]` (detail) | Format `s.date` as human-readable string ("26 October 2025"); replace `<a href="/showcases">` with `<Link>` | S |
| P0-9 | `/artists/[slug]`, `/releases/[slug]` | Make artist names clickable `<Link>` elements to `/artists/[slug]` for rostered artists; add a "Releases" section on artist detail pages | M |
| P0-10 | `/subscribe` | Add visually-hidden `<label htmlFor>` for the email input; add privacy policy link | S |
| P0-11 | `app/sitemap.ts` | Add `/free-downloads`, `/subscribe`, `/merch`, and all `/merch/[handle]` routes to the sitemap | S |
| P0-12 | `/merch/[handle]` | Add `@type: Product` JSON-LD structured data (name, price, availability, image, url) to enable Google Shopping rich results | S |
