---
audit: master-recommendations
date: 2026-04-30
inputs: [01, 02, 03, 04]
synthesizer: claude-sonnet
---

# Marginalia — Master Site Audit & Recommendations

## TL;DR (read this first)

- **Accessibility blockers are everywhere and systemic**: 9 of 18 pages have no `<h1>`; all 3 forms lack label-input association; every page lacks a skip-to-content link — these are WCAG failures, not cosmetic issues.
- **Mobile users get a second-class experience**: The mini-player is `hidden md:block`, the release grid shows no text on mobile, and the first-visit prompt is desktop-only — for a label whose fans discover releases on Instagram, this is the most damaging gap.
- **The press page is actively hurting credibility**: It shows "No press coverage yet." with no bio, no logo, no EPK, and no contact — journalists and promoters who land there leave immediately.
- **Three forms collect personal data with no GDPR disclosure**: Demo, Subscribe, and Services pages have no privacy policy link at the point of collection — legal exposure for a Barcelona-based business.
- **SEO has easy wins that are untouched**: No `MusicGroup` schema (blocks Google Knowledge Panel), no `Product` JSON-LD on merch pages (blocks Google Shopping), and `sitemap.ts` uses `new Date()` for all `lastModified` values (tells Googlebot nothing changed when something has).
- **Design token discipline has eroded**: 9 components use hardcoded hex values (`#444`, `#9EFF0A`, `#580AFF`) instead of the CSS custom properties defined in globals.css — a maintenance risk and brand-drift risk.
- **The homepage is a dead end after the hero**: After the video there is no release strip, no featured music, no social proof — fans scroll once and leave.

## How to use this doc

Items are sorted into three tiers (P0, P1, P2) where P0 means ship this week and P2 means put on the Phase 9+ roadmap. Work through P0 items in the order they appear — they are clustered so a single developer can flow from accessibility/legal fixes through page-level content gaps in roughly one day per cluster. P1 items follow the same theme order and can be parallelised with a second contributor. P2 items are proposed as new roadmap phases — bring them to the founder before scheduling. Start tomorrow with P0-1 through P0-4: they are all S-effort, touch global files, and unlock every subsequent fix.

---

## Priority tiers

| Tier | Definition | Time horizon |
|------|------------|--------------|
| P0 | Bugs, accessibility blockers, brand-credibility hits | Ship this week |
| P1 | High-leverage UX upgrades that compound on retention/conversion | Ship next 2-3 weeks |
| P2 | Strategic features that close competitor gaps | Roadmap candidates (Phase 9+) |

---

## P0 — Must Fix (estimated ~8-10 person-days total)

### Cluster A: Global accessibility & legal (do these first, they affect every page)

---

### P0-1: Skip-to-content link missing globally
**Source(s):** 02 §Homepage, 03 §SiteNav, 03 §Refactor Priority #4
**What's wrong:** There is no `<a href="#main-content" class="sr-only focus:not-sr-only">` anywhere in the layout. Keyboard and screen-reader users must tab through 11 nav links + 6 social icons + cart button (18 elements) before reaching any page content on every single page load.
**Impact if unfixed:** WCAG 2.4.1 failure (Level A — mandatory). Fails any automated accessibility audit.
**Fix:** In `app/layout.tsx` (or `components/layout/SiteNav.tsx` as first child of `<header>`), add:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-(--color-accent-lime) focus:text-(--color-bg) focus:rounded">
  Skip to main content
</a>
```
Add `id="main-content"` to the `<main>` tag in `app/layout.tsx`.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-2: `text-[#444]` contrast violation on global nav icons
**Source(s):** 02 §SW-2, 03 §SiteNav:74, 03 §CartButton:17
**What's wrong:** `SiteNav.tsx:74` and `CartButton.tsx:17` both hardcode `text-[#444]` for social icons and the cart icon on the dark `#1F1F21` navbar. Contrast ratio is approximately 2.8:1 — WCAG AA requires 3:1 minimum for UI components.
**Impact if unfixed:** WCAG 1.4.3 AA failure on every page. The cart button is a primary conversion element; low contrast reduces click-through especially in bright environments.
**Fix:** Replace `text-[#444]` in `SiteNav.tsx:74` and `CartButton.tsx:17` with `text-white/70` (contrast ≈ 5.9:1 on `#1F1F21`, passes AA). Also replace `bg-[#9EFF0A]` on the cart badge in `CartButton.tsx:37` with `bg-(--color-accent-lime)`.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-3: `htmlFor`/`id` missing on all three forms — labels not associated to inputs
**Source(s):** 02 §SW-3, 02 §Demo, 02 §Subscribe, 03 §DemoForm, 03 §NewsletterForm, 03 §ContactForm, 03 §CX-2
**What's wrong:** `DemoForm.tsx`, `ContactForm.tsx`, and `NewsletterForm.tsx` all render `<label>` elements without `htmlFor` attributes. Clicking a label does not focus the associated input; screen readers do not announce which label belongs to which field. `SubscribePanel.tsx` has no label at all on its email input — only a `placeholder`.
**Impact if unfixed:** WCAG 1.3.1 (Level A) failure on `/demo`, `/services`, `/subscribe`, and the footer newsletter form — all four of Marginalia's data-collection surfaces.
**Fix:** In each affected file, pair every `<label>` with `htmlFor="field-id"` and add matching `id="field-id"` to the `<input>`. For `SubscribePanel.tsx`, add `<label htmlFor="subscribe-email" className="sr-only">Email address</label>` and `id="subscribe-email"` on the input. For `NewsletterForm.tsx`, add `aria-label="Email address"` to the input.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-4: No GDPR/privacy disclosure on data-collection forms
**Source(s):** 02 §SW-5, 02 §Demo, 02 §Subscribe
**What's wrong:** `/demo` (DemoForm), `/subscribe` (SubscribePanel), and the footer newsletter form collect email addresses and personal data with zero privacy policy link or data-processing notice. GDPR Article 13 requires disclosure at the point of collection.
**Impact if unfixed:** Legal exposure for a Barcelona-based business. Maximum GDPR fine is 4% of global annual turnover or €20M. Even as a small label this is a real risk.
**Fix:** Below the submit button in `DemoForm.tsx`, `SubscribePanel.tsx`, and `NewsletterForm.tsx`, add: `<p className="text-(--text-label) text-(--color-text-muted) mt-2">By submitting, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>.</p>`. The privacy policy page must exist (even a minimal one). Note: this is also the fix location for GDPR on the services contact form (`ContactForm.tsx`).
**Effort:** S
**Owner:** Code + content (privacy policy page must be drafted)

---

### P0-5: `<h1>` missing on 9 pages
**Source(s):** 02 §SW-1, 02 §Homepage, §Releases, §Artists, §Podcasts, §Showcases, §Merch, §Press, §Services, §Free Downloads, 03 §ReleaseGrid
**What's wrong:** The following pages have no `<h1>`: `/` (homepage), `/releases`, `/artists`, `/podcasts`, `/showcases`, `/merch`, `/press`, `/services`, `/free-downloads`. Only detail pages and a few form pages have headings. This breaks the document outline for screen readers and weakens on-page SEO signals on every listing page.
**Impact if unfixed:** WCAG 2.4.6 advisory failure. Screen reader users cannot jump to the page heading. Search engines receive no on-page topic signal for 9 of the most important pages.
**Fix:** Add one line per page. For pages with a strong visual identity that should not show a heading visually, use `className="sr-only"`:
- `app/page.tsx`: `<h1 className="sr-only">Marginalia — Barcelona Melodic House &amp; Techno Label</h1>` inside the hero section
- `app/releases/page.tsx`: `<h1 className="sr-only">Releases</h1>` before `<ReleaseGrid>`
- `app/artists/page.tsx`: `<h1>Our Roster</h1>` (visible, above the grid)
- `app/podcasts/page.tsx`: `<h1>Podcasts &amp; Mixes</h1>`
- `app/showcases/page.tsx`: `<h1>Showcases</h1>`
- `app/merch/page.tsx`: `<h1 className="sr-only">Merch</h1>`
- `app/press/page.tsx`: `<h1>Press</h1>`
- `app/services/page.tsx`: `<h1>Services</h1>`
- `app/free-downloads/page.tsx`: `<h1>Free Downloads</h1>`
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-6: `role="marquee"` is an invalid ARIA role in `AnnouncementBar.tsx`
**Source(s):** 03 §AnnouncementBar
**What's wrong:** `AnnouncementBar.tsx:62` applies `role="marquee"` which is not a valid ARIA 1.1 role. This generates accessibility audit failures and may cause unpredictable screen reader behavior.
**Impact if unfixed:** WCAG 4.1.2 failure. Automated audits (Axe, Lighthouse) will flag this as an error on every page that shows the bar.
**Fix:** Remove `role="marquee"` from the element. The existing `aria-label={text}` on the wrapper provides sufficient accessible name. Additionally, add `@media (prefers-reduced-motion) { animation-play-state: paused; }` to the `announcement-scroll` keyframe rule in `globals.css` for vestibular disorder accommodation.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-7: Focus not moved on modal/overlay open (4 components)
**Source(s):** 03 §MobileMenu, 03 §CartDrawer, 03 §ServicesContent, 03 §DemoForm, 03 §CX-4
**What's wrong:** `MobileMenu`, `CartDrawer`, `ServicesContent` (on service select), and `DemoForm` (on submit success) all reveal new content without moving keyboard focus to it. Keyboard and screen-reader users remain stranded on the element that triggered the reveal.
**Impact if unfixed:** WCAG 2.4.3 (Focus Order, Level A) failure. A blind user who opens the mobile menu or cart cannot navigate its contents without pressing Tab through the entire hidden document first.
**Fix:** In each component, add a `useRef` pointing to the first interactive element inside the revealed content, and a `useEffect` that calls `ref.current?.focus()` when the visible/open state becomes `true`:
- `MobileMenu.tsx`: focus first nav link when `open === true`
- `CartDrawer.tsx`: focus the close button when `isOpen === true`
- `ServicesContent.tsx`: focus the `ContactForm` container when a service is selected
- `DemoForm.tsx`: focus the success message `<div>` (add `tabIndex={-1}`) after submit
**Effort:** S per component (total S-M)
**Owner:** Code — Claude can do this

---

### P0-8: Seek bars not keyboard-operable in MiniPlayer and PodcastPlayer
**Source(s):** 03 §MiniPlayer, 03 §PodcastPlayer, 03 §CX-3
**What's wrong:** Both `MiniPlayer.tsx:144` and `PodcastPlayer.tsx:91` render seek bars as plain `<div onClick>` elements. There is no `role="slider"`, no `aria-valuenow/min/max`, and no keyboard handler. Users who cannot use a mouse cannot seek.
**Impact if unfixed:** WCAG 2.1.1 (Keyboard, Level A) failure on the label's primary audio feature. This is the core product interaction.
**Fix:** On both seek bar `<div>` elements, add:
```tsx
role="slider"
tabIndex={0}
aria-label="Seek"
aria-valuemin={0}
aria-valuemax={100}
aria-valuenow={Math.round(progress * 100)}
onKeyDown={(e) => {
  if (e.key === 'ArrowRight') seekForward();
  if (e.key === 'ArrowLeft') seekBack();
}}
```
Where `seekForward`/`seekBack` advance or rewind by 5 seconds.
**Effort:** S per component
**Owner:** Code — Claude can do this

---

### P0-9: `aria-pressed` missing on interactive toggle buttons
**Source(s):** 03 §ServicesContent, 03 §ProductDetail:180, 03 §Refactor Priority #10
**What's wrong:** Service selector buttons in `ServicesContent.tsx` and variant selector buttons in `ProductDetail.tsx:180` have no `aria-pressed` attribute. Screen reader users cannot determine which option is currently selected — they only get visual feedback.
**Impact if unfixed:** WCAG 4.1.2 failure. A blind user cannot determine which service or product variant they have selected.
**Fix:** Add `aria-pressed={service === s.id}` to each service button in `ServicesContent.tsx`. Add `aria-pressed={isSelectedVariant}` to each variant button in `ProductDetail.tsx:180`.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-10: Past showcase cards at 45% opacity fail contrast under their own greyscale
**Source(s):** 03 §ShowcaseCard:32-34
**What's wrong:** Past showcase `ShowcaseCard.tsx:32-34` applies `opacity: 0.45` and `filter: grayscale(0.5)`. Text inside the card at 45% opacity over a dark surface can fall below 3:1 contrast — failing WCAG AA for UI components.
**Impact if unfixed:** WCAG 1.4.3 failure on past event cards. Older events become unreadably dim for low-vision users.
**Fix:** Change opacity from `0.45` to `0.7` in `ShowcaseCard.tsx:32`. The greyscale filter provides sufficient visual de-emphasis without the contrast failure.
**Effort:** S
**Owner:** Code

---

### Cluster B: Content credibility (do these after cluster A)

---

### P0-11: Press page is a credibility disaster — "No press coverage yet."
**Source(s):** 02 §Press
**What's wrong:** The `/press` page shows only the message "No press coverage yet." with no heading, no bio, no logo downloads, no EPK link, and no press contact. Industry visitors (journalists, promoters, bloggers) who land here leave with a negative impression of a label that has 40+ releases and a Beatport "Hype Label" accolade.
**Impact if unfixed:** Brand damage. Press pages are high-intent pages — the people who visit them are exactly the people Marginalia wants to impress. A blank page actively signals amateurism.
**Fix:** Add a label press section to `app/press/page.tsx` that renders regardless of whether press entries exist in the DB:
1. `<h1>Press</h1>` (already captured in P0-5 above)
2. A 3-sentence label bio (static or CMS-driven)
3. A "Press contact:" line with the label's press email address
4. Links to logo assets (SVG, PNG — these can be static files in `public/`)
5. An EPK download link (a PDF or Dropbox link — content task)
6. A `PressEntry` list below, showing entries when they exist
Also: populate at least 1 press entry in the CMS immediately (the Beatport "Hype Label of the Month" accolade qualifies).
**Effort:** M (code + content)
**Owner:** Code + Elif (content)

---

### P0-12: Showcase listing page communicates nothing without clicking
**Source(s):** 02 §Showcases
**What's wrong:** The `/showcases` listing shows only flyer images — no event name, no date, no location overlaid or below. Users must click blindly on every flyer to learn anything. Additionally, events without a flyer are silently excluded (`app/showcases/page.tsx:15` filters on `s.flyer`), meaning upcoming events without uploaded artwork are invisible.
**Impact if unfixed:** Usability failure. On mobile, a visitor sees a wall of portrait images with no orientation. Upcoming events may be completely invisible if their flyer hasn't been uploaded.
**Fix:**
1. On each `ShowcaseCard`, render the event title, formatted date, and city as text below the flyer image (always visible, not overlay-only)
2. Remove the `s.flyer` filter in `app/showcases/page.tsx:15` — show all showcases; render a typography-only placeholder card when no flyer exists
3. Add an "UPCOMING" or "PAST" badge to each card (same lime/muted treatment as the detail page)
4. Improve flyer alt text: `alt={`${s.title} — ${s.date}, ${s.city}`}`
**Effort:** M
**Owner:** Code — Claude can do this

---

### P0-13: Release grid shows no text on mobile — unlabelled artwork wall
**Source(s):** 02 §Releases, 02 §SW-4 (adjacent), 03 §ReleaseCard:55
**What's wrong:** `ReleaseCard.tsx:55` renders the title/artist hover overlay as `hidden md:flex` — on touch devices there is no visible text beneath any artwork. A mobile user sees only a grid of square images with no titles. They must tap every card blindly to discover what it is.
**Impact if unfixed:** Mobile usability failure on the label's primary catalog page. The majority of music label traffic is mobile (Instagram/TikTok referral). This is a near-complete content blockout on the most important page for fan-discovery.
**Fix:** In `ReleaseCard.tsx`, add a text block below the artwork image that is always visible (not inside the hover overlay):
```tsx
<div className="mt-1 px-1">
  <p className="text-(--text-label) font-medium truncate">{title}</p>
  <p className="text-(--text-label) text-(--color-text-muted) truncate">{artistName}</p>
</div>
```
The existing hover overlay on desktop can remain for the visual richness. On mobile, the text below the image provides the necessary label.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-14: Video hero has no `poster` attribute — LCP is slow
**Source(s):** 04 §8 (Performance), 04 §Recommended Sequence step 2
**What's wrong:** The `<video>` element in `app/page.tsx` has no `poster` attribute. When the browser loads the homepage, the LCP element is the first video frame, which only appears after the video starts buffering. A poster image would appear immediately on load, dramatically improving the measured LCP metric.
**Impact if unfixed:** Core Web Vitals LCP failure. Google uses LCP in ranking signals. A slow LCP also correlates with higher bounce rates (53% of mobile users abandon pages that take >3s to load).
**Fix:** The `desktopThumbnailUrl` variable is already computed in `app/page.tsx` from the YouTube video ID. Add `poster={desktopThumbnailUrl ?? undefined}` to both `<video>` elements (desktop and mobile fallback). If no YouTube ID is set, point to a static fallback image: `poster="/images/hero-poster.jpg"` (create this from the existing hero video).
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-15: `ShowcaseLinksList` passes unvalidated URLs directly to `href`
**Source(s):** 03 §ShowcaseLinksList:20-22
**What's wrong:** `ShowcaseLinksList.tsx:20-22` renders `link.url` directly in `href` without protocol validation. A `javascript:` URL in the DB would execute as XSS in the browser.
**Impact if unfixed:** Security vulnerability — XSS via admin-entered showcase links. While the admin is not public, this is a good practice gap.
**Fix:** Add the same `safeHref` check used in `ShowcaseCard.tsx`: validate that `link.url` starts with `https://` or `http://` and return `null` (skip the link) if not. Also extract this function from both `ShowcaseCard.tsx` and `PressEntry.tsx` into `lib/urls.ts` as `safeExternalUrl(url)` — it is currently duplicated in those two files (CX-7).
**Effort:** S
**Owner:** Code — Claude can do this

---

### P0-16: Cart empty state links to `/merch` from within `/merch` — circular dead link
**Source(s):** 02 §Merch
**What's wrong:** When the cart is empty, the drawer or empty state shows a "Browse merch →" link that points to `/merch`. When the user is already on `/merch`, clicking this link is a circular no-op. The circular link source is in `components/layout/SiteFooter.tsx` or `CartDrawer.tsx` (requires confirmation of exact location).
**Impact if unfixed:** Conversion failure. A user on the merch page with an empty cart clicks "Browse merch" and stays on the same page — visually confusing and converts nobody.
**Fix:** Make the "Browse merch" link conditional: if `usePathname() === '/merch'`, either hide the link entirely or replace it with a link to a specific featured product. In `CartDrawer.tsx`, add a `usePathname()` check and render a different CTA or omit the link.
**Effort:** S
**Owner:** Code — Claude can do this

---

## P1 — High-Leverage Upgrades

### Navigation & Global Layout

---

### P1-1: Nav packs 11 links — overflows at 1024px
**Source(s):** 02 §Homepage, 03 §NavLinks
**What's wrong:** The desktop nav contains 11 primary links (`NavLinks.tsx`) — at 1024px viewport width these almost certainly overflow or compress to unreadable sizes. No overflow guard exists in the component.
**Impact if unfixed:** Navigation failure on common laptop screen widths (1024px, 1280px). Visitors cannot access core sections.
**Fix:** Collapse secondary links (Demo Submission, Press, Services, Free Downloads) into a "More" dropdown (`<details>`/`<summary>` or a popover). The primary visible links should be: Releases, Roster, Podcasts, Showcases, Merch, and More. Move the `PRIMARY_LINKS` constant from `SiteNav.tsx` to `lib/nav-config.ts` so `MobileMenu` imports from the same source.
**Effort:** M
**Owner:** Code

---

### P1-2: Mobile mini-player does not exist — audio drops on mobile
**Source(s):** 04 §6 (Audio Persistence), 03 §MiniPlayer
**What's wrong:** `MiniPlayer.tsx:93` is wrapped in `<div className="hidden md:block">`. Mobile users — the majority of the label's Instagram/TikTok-referred audience — have no persistent audio UI. They start a track on the podcasts page, navigate to releases, and the audio experience is lost.
**Impact if unfixed:** The label's primary product (music) is non-persistent on the device type that the majority of its fans use. This is the highest-impact UX gap for a music label.
**Fix:** Create a companion `MobileMiniPlayer` component (render on `block md:hidden`) that shows only: play/pause button + track title + progress dot. Wire it to the same `playerStore` singleton — no API changes required. Fix height at 48px, fixed to bottom, above the safe area inset.
**Effort:** M
**Owner:** Code

---

### P1-3: Replace hardcoded hex values with design tokens across 9 components
**Source(s):** 03 §CX-1, 03 §MiniPlayer:54,156, 03 §CartDrawer:36, 03 §ProductDetail:117,227
**What's wrong:** 9 components use hardcoded hex values (`#444`, `#9EFF0A`, `#580AFF`, `#1F1F21`) that have direct token equivalents in `globals.css`. Any brand color change requires hunting these down manually.
**Fix:** Global search-and-replace across the affected files:
- `#444` → `var(--color-text-secondary)` (or `text-white/50` for 50% white)
- `#9EFF0A` → `var(--color-accent-lime)`
- `#580AFF` → `var(--color-accent-violet)`
- `#1F1F21` → `var(--color-bg)`
Affected files: `SiteNav.tsx`, `CartButton.tsx`, `MiniPlayer.tsx`, `LayloButton.tsx`, `SubscribePanel.tsx`, `ProductDetail.tsx`, `CartDrawer.tsx`, `SplashScreen.tsx`, `globals.css:163`.
Also formalize the Laylo gradient as `--gradient-laylo-from` and `--gradient-laylo-to` in globals.css and replace the duplicated gradient values in `LayloButton.tsx` and `SubscribePanel.tsx`.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-4: Extract shared utility functions — 4 duplications
**Source(s):** 03 §CX-5, §CX-6, §CX-7, §CX-8
**What's wrong:** Four logic patterns are duplicated across multiple components:
1. Newsletter subscription hook — duplicated in `NewsletterForm.tsx` and `SubscribePanel.tsx`; both silently swallow errors
2. SVG icon paths — duplicated in `SocialIcon.tsx` and `ArtistSocialRow.tsx` (Instagram, SoundCloud, Beatport, YouTube)
3. `safeExternalUrl` validation — duplicated in `PressEntry.tsx:22-25` and `ShowcaseCard.tsx:3-7`
4. SoundCloud artwork URL transform — appears in `ReleaseCard.tsx:33`, `SiteFooter.tsx:27`, and `PodcastPlayer.tsx:41`
**Fix:** Create the following shared files:
- `hooks/useNewsletter.ts` — shared subscription logic with proper error state
- `lib/icon-paths.ts` — shared SVG path strings
- `lib/urls.ts` — `safeExternalUrl()` function
- `lib/artwork.ts` — `resizeSoundCloudArtwork(url, size)` function
**Effort:** S
**Owner:** Code — Claude can do this

---

### Releases UX

---

### P1-5: Artist names on release pages are not linked to artist pages
**Source(s):** 02 §SW-4, 02 §In Love page, 03 §ReleaseMetaHeader
**What's wrong:** Artist names on release detail pages (`ReleaseMetaHeader.tsx:22`), the footer pre-save badge grid, and showcase pages are displayed as plain text — not links. For rostered artists, there should be a link to `/artists/[slug]`.
**Impact if unfixed:** Broken discovery pattern. A fan who discovers a release cannot navigate to the artist's profile without going back to the roster page.
**Fix:** In `ReleaseMetaHeader.tsx`, use the existing `ArtistLink` component (which already handles artist slug routing). Parse the `artistName` field: if it matches a roster artist's name, render `<ArtistLink>` — otherwise render plain text.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-6: Releases listing needs filter chips
**Source(s):** 02 §Releases, 01 §Crosstown Rebels, §Anjunabeats
**What's wrong:** With 40+ releases and growing, the `/releases` page has no way to filter by status (Pre-Save / Out Now), format (EP / Single / Album), or sort by date. Competitor standard: Anjunabeats, Crosstown Rebels, and Ninja Tune all provide filters.
**Impact if unfixed:** Discoverability degrades linearly as the catalog grows. Industry visitors (DJs, journalists) looking for a specific format or artist's releases must scroll the entire grid.
**Fix:** Add client-side filter chips above `ReleaseGrid` in `app/releases/page.tsx`:
- Status: All / Pre-Save / Out Now (derived from `releaseDate` vs today + `presave` boolean)
- Format: All / EP / Single / Album (from `releaseType` field)
The filter state lives in `useSearchParams` (URL-driven) for shareability. No backend change needed — filter on the already-fetched `releases` array client-side.
**Effort:** M
**Owner:** Code

---

### P1-7: Release detail pages missing tracklist
**Source(s):** 02 §In Love, 01 §Innervisions, §Hot Creations
**What's wrong:** Release detail pages show artwork, platform links, and a SoundCloud embed — but no tracklist. For EPs and albums, fans and DJs expect to see individual track names.
**Impact if unfixed:** Incomplete product pages. DJs who want to verify if a specific track is on an EP cannot do so without clicking through to SoundCloud or Beatport.
**Fix:** Add a `tracks` field to the release schema (array of `{ title, duration, isrc? }`). Render as a numbered list below the SoundCloud embed on the detail page. This is a CMS schema addition + UI component. Content task: populate existing releases.
**Effort:** M
**Owner:** Code + content

---

### P1-8: Auto-derive "Out Now" badge from release date — reduce CMS maintenance
**Source(s):** 02 §Releases
**What's wrong:** The "Out Now" badge on release cards only appears if `badgeText` is manually set in the CMS. Released items without `badgeText` show no status indicator at all — the grid is inconsistent and requires ongoing CMS work.
**Impact if unfixed:** CMS maintenance burden; inconsistent card treatment; new releases may ship without a status badge.
**Fix:** In `ReleaseCard.tsx`, derive badge state server-side: if `releaseDate <= today` and no `badgeText` is set, display "Out Now" automatically. This is a 3-line logic addition using the `releaseDate` field already on the model.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-9: Add artist discography section to artist detail pages
**Source(s):** 02 §Artists/elif, 01 §Ninja Tune, 04 §2
**What's wrong:** Artist detail pages have no "Releases by [Artist]" section. A fan landing on ELIF's page cannot discover her catalog without leaving the page and navigating to Releases. This is the single biggest gap in fan-facing content on artist pages.
**Impact if unfixed:** Dead end for fans. No internal linking from artist → releases. Reduces time on site and discovery depth.
**Fix:** In `app/artists/[slug]/page.tsx`, add a query `getReleasesByArtist(artist.name)` and render the results using the existing `ReleaseGrid` or a horizontal scroll strip. The DB already has the data — this is purely a query + UI addition.
**Effort:** M
**Owner:** Code — Claude can do this

---

### Merch UX

---

### P1-10: Add free-shipping progress bar to cart drawer
**Source(s):** 04 §3 (D2C Merch)
**What's wrong:** Cart abandonment #1 cause is unexpected shipping costs. A threshold progress bar ("Add €12 for free shipping") inside `CartDrawer.tsx` directly reduces abandonment by informing the user before they hit checkout.
**Impact if unfixed:** Checkout abandonment. Baymard Institute data shows 70% average cart abandonment rate; shipping-cost surprise is the leading cause.
**Fix:** In `CartDrawer.tsx` footer section (lines 166–185), add a styled `<div>` computing `freeShippingThreshold - cart.cost.subtotalAmount`. If Marginalia does not offer free shipping, use this space for a trust badge row instead ("Secure checkout on Shopify | SSL encrypted").
**Effort:** S
**Owner:** Code + business decision (what is the free shipping threshold?)

---

### P1-11: Cart drawer quantity buttons are 32px — below 44px tap target
**Source(s):** 04 §3, 03 §CartDrawer
**What's wrong:** Quantity `−` and `+` buttons in `CartDrawer.tsx:136-148` are `w-8 h-8` (32px). Apple HIG and Material Design both require minimum 44px tap targets on mobile. At 32px these buttons cause accidental mis-taps.
**Impact if unfixed:** Mobile cart usability failure. Users who try to adjust quantity accidentally hit neighboring elements, causing frustration and abandonment.
**Fix:** Change `w-8 h-8` to `w-11 h-11` (44px) in `CartDrawer.tsx`. Same fix in the quantity stepper on `ProductDetail.tsx` where the buttons are also slightly below threshold.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-12: Add `Product` JSON-LD to merch detail pages
**Source(s):** 02 §SW-8, 02 §Merch/purple-hat
**What's wrong:** Neither the merch listing nor `ProductDetail.tsx` emits `@type: Product` JSON-LD. The custom Next.js frontend does not inherit Shopify's built-in schema. Merch product pages are ineligible for Google Shopping rich results.
**Impact if unfixed:** SEO revenue loss. Google Shopping rich results drive purchase-intent traffic. Custom frontends must emit this schema manually or they get nothing.
**Fix:** In `app/merch/[handle]/page.tsx`, add a `<script type="application/ld+json">` block with:
```json
{
  "@type": "Product",
  "name": "{product.title}",
  "image": "{product.images[0].url}",
  "offers": {
    "@type": "Offer",
    "price": "{variant.price.amount}",
    "priceCurrency": "{variant.price.currencyCode}",
    "availability": "https://schema.org/InStock"
  }
}
```
**Effort:** S
**Owner:** Code — Claude can do this

---

### SEO

---

### P1-13: Add `MusicGroup` JSON-LD to establish label identity in Google's knowledge graph
**Source(s):** 04 §7 (SEO), 02 §SW-8 adjacent
**What's wrong:** No `MusicGroup` schema exists anywhere on the site. Google cannot confirm that marginalia.es/marginalialabel represents a music label entity — this blocks a Knowledge Panel, genre tags, and social profile aggregation in search results.
**Impact if unfixed:** No Google Knowledge Panel. Artist and release pages have weaker entity recognition. All SEO structured data built on top of this is less valuable.
**Fix:** Add to `app/layout.tsx` (or `app/about/page.tsx`):
```json
{
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "name": "Marginalia",
  "genre": ["Melodic House", "Techno"],
  "foundingDate": "2020",
  "location": { "@type": "Place", "name": "Barcelona, Spain" },
  "sameAs": [
    "https://www.instagram.com/marginaliarecords",
    "https://soundcloud.com/marginalialabel",
    "https://www.beatport.com/label/marginalia/..."
  ]
}
```
**Effort:** S
**Owner:** Code + Elif (confirm founding date and platform URLs)

---

### P1-14: Fix `lastModified` in sitemap — all entries currently report today's date
**Source(s):** 04 §7, 02 §SW-7
**What's wrong:** `app/sitemap.ts` uses `new Date()` for all `lastModified` values. This tells Googlebot that every page was modified on every crawl, making freshness signals meaningless and wasting crawl budget.
**Impact if unfixed:** Googlebot re-crawls all URLs on every visit. New releases take longer to index because the sitemap doesn't signal which pages actually changed.
**Fix:** In `app/sitemap.ts`, replace `new Date()` with actual DB timestamps:
- Release routes: use `r.updatedAt ?? r.releaseDate`
- Artist routes: use `a.updatedAt`
- Static pages: use a hardcoded date matching their last actual edit
Also add the missing routes: `/free-downloads`, `/subscribe`, `/merch`, and all `/merch/[handle]` dynamic product pages (02 §SW-7).
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-15: Add `MusicEvent` JSON-LD to showcase detail pages
**Source(s):** 04 §7, 02 §Showcases detail
**What's wrong:** Showcase detail pages have no `MusicEvent` structured data. Google's event rich results (which appear in SERP with date, venue, and tickets) require this schema.
**Impact if unfixed:** Free SERP visibility for events is completely untapped. Searching "Marginalia Barcelona 2025" would not surface the showcase page as an event card.
**Fix:** In `app/showcases/[slug]/page.tsx`, add `MusicEvent` JSON-LD using `s.title`, `s.date`, `s.city`, `s.venue`, and `s.ticketUrl` fields already in the DB. For past events, set `eventStatus: "EventScheduled"` with the historical date.
Also on this page: replace the plain `<a href="/showcases">` back-navigation link on line 91 with `<Link href="/showcases">` (Next.js client-side routing).
**Effort:** M
**Owner:** Code — Claude can do this

---

### P1-16: Shopify product listing — switch from `no-store` to ISR
**Source(s):** 04 §8, 04 §3
**What's wrong:** `lib/shopify.ts:108` (PRODUCTS_QUERY) uses `cache: 'no-store'`. Every merch page visit triggers a fresh Shopify API round-trip, increasing TTFB and cold-start time. Product listings don't change in real-time.
**Impact if unfixed:** Slow merch page loads. Higher Shopify API usage. On high-traffic days (release day) the merch page load time degrades.
**Fix:** Change the Shopify product fetch in `lib/shopify.ts` for the listing query to `next: { revalidate: 300 }` (5-minute ISR). Leave individual product fetches on shorter revalidation or `no-store` if live inventory is required.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-17: Newsletter form — add value proposition copy
**Source(s):** 04 §5, 02 §Subscribe
**What's wrong:** The newsletter form in `SiteFooter` shows only a bare email input. There is no text explaining what subscribing delivers. "Subscribe to newsletter" alone is the weakest possible conversion copy.
**Impact if unfixed:** Low newsletter conversion rate. Every competitor tested (Anjunabeats, Drumcode, Defected) pairs their capture form with an explicit value proposition and/or incentive.
**Fix:** Add a single line above the `<NewsletterForm>` in `SiteFooter.tsx`: "Early access, free downloads, label news." This is a content-only change, zero dev effort beyond a string addition. Also consider adding a discount incentive tied to the Shopify store (10% first order) matching the Anjunabeats/Drumcode approach.
**Effort:** S (copy)
**Owner:** Elif (content decision on incentive), then Code

---

### P1-18: Add `<noscript>` fallback to SoundCloud embeds
**Source(s):** 02 §Podcasts
**What's wrong:** `SoundCloudEmbed.tsx` and the Podcasts page show "Loading tracks..." in no-JS environments (and during SSR). There is no fallback path to the SoundCloud content.
**Impact if unfixed:** Users with JS disabled (or aggressive script-blocking) see a loading spinner forever. Search engine crawlers that don't execute JS get no content from the podcast section.
**Fix:** Add a `<noscript>` block inside `SoundCloudPlayer.tsx` with a direct link to the SoundCloud playlist/track URL: `<noscript><a href={soundcloudUrl}>Listen on SoundCloud</a></noscript>`.
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-19: SplashScreen uses Apple system font instead of Nimbus Sans
**Source(s):** 03 §SplashScreen:91
**What's wrong:** `SplashScreen.tsx:91` hardcodes `fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'` for the loading percentage counter. The brand font is Nimbus Sans (`var(--font-sans)`). This is a brand inconsistency visible on every page load.
**Fix:** Replace the `fontFamily` inline style on line 91 with `fontFamily: 'inherit'` to inherit the body font stack, or explicitly `var(--font-sans)`.
Also: replace `backgroundColor: '#1F1F21'` on line 52 with `backgroundColor: 'var(--color-bg)'` (token alignment).
**Effort:** S
**Owner:** Code — Claude can do this

---

### P1-20: Showcase detail — raw ISO date rendered as "2025-10-26"
**Source(s):** 02 §Showcases/detail:105
**What's wrong:** `app/showcases/[slug]/page.tsx:105` renders `s.date` as a raw ISO string ("2025-10-26"). This is embarrassing to ship to end users — it looks like a bug.
**Fix:** Wrap the date with `new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })` to produce "26 October 2025". The same pattern is already used in `ReleaseMetaHeader`.
**Effort:** S
**Owner:** Code — Claude can do this

---

## P2 — Strategic Roadmap Candidates

### P2-1: Persistent bottom audio player with queue builder
**Why now:** Marginalia's audience is defined by its music. Every competitor worth benchmarking (Ninja Tune, Crosstown Rebels, Hot Creations) either has a persistent player or serves audio via SoundCloud externally. A persistent in-site player that allows browsing releases while audio continues is the single feature that most differentiates a label site from a SoundCloud profile.
**Source labels:** Ninja Tune (best implementation — add-to-queue from anywhere, track count display, keyboard controls)
**Marginalia status:** PARTIAL — desktop `MiniPlayer` exists but is mobile-excluded and has no queue
**Phase candidate:** Phase 9 — "Persistent Audio Player v2"
**Dependencies:** P1-2 (mobile mini-player baseline) should ship first; player-store architecture already exists
**Effort:** L

---

### P2-2: Mix / podcast archive with episode detail pages
**Why now:** Electronic music fans expect a dedicated mix section. Marginalia uses SoundCloud but has no browsable on-site archive with episode numbers, tracklists, or guest info. Six of ten competitors (Anjunabeats, Hot Creations, Crosstown Rebels, Drumcode, Diynamic, Defected) have dedicated mix/radio sections.
**Source labels:** Hot Creations (Galactic Transmission naming series + per-episode pages), Crosstown Rebels (numbered Mix Show archive)
**Marginalia status:** PARTIAL — podcasts section exists as a single-page accordion but has no individual episode routes; `/podcasts/[slug]` returns 404
**Phase candidate:** Phase 10 — "Mix Archive & Episode Detail Pages"
**Dependencies:** Current podcast data model can be extended; episode detail pages need a CMS schema addition (tracklist field)
**Effort:** M

---

### P2-3: Demo submission quality improvements
**Why now:** The demo form works but does not pre-qualify submitters. Off-genre submissions waste A&R time. Boutique labels that add a "What we're looking for" block + explicit response SLA reduce irrelevant submissions by 30-50%.
**Source labels:** Diynamic (explicit format instructions + email-based approach with clear requirements), Mau5trap (LabelRadar integration for structured submissions)
**Marginalia status:** PARTIAL — form exists, `acceptingDemos` flag exists, honeypot exists; missing: genre pre-qualification, response SLA copy, link to catalog for self-qualification
**Phase candidate:** Phase 9 (quick win — content + S code effort)
**Dependencies:** None
**Effort:** S

---

### P2-4: Events listing page (separate from showcases)
**Why now:** Marginalia hosts showcases and plays at external events (ADE, etc.). A calendar-style events listing with ticket links is present on 7 of 10 competitor sites and is considered a de-facto standard for labels with live activity. The current "showcases" section conflates label-produced events with general appearances.
**Source labels:** Anjunabeats (events with Bandsintown), Drumcode (upcoming events cards with Buy Tickets), Ninja Tune (artist + city filter on events)
**Marginalia status:** MISSING — no events listing separate from showcase detail pages
**Phase candidate:** Phase 10 — "Events Calendar"
**Dependencies:** Requires a new `events` DB table (separate from `showcases`) with fields: date, venue, city, country, artists, ticketUrl, type (headline/festival/showcase)
**Effort:** M

---

### P2-5: Curated playlist directory
**Why now:** Playlists are the primary streaming discovery mechanism. A single static page linking to Marginalia's curated Spotify/Apple Music/SoundCloud playlists (label essentials, melodic journey, late night) costs near-zero effort and increases streaming follow-through from catalog browsers.
**Source labels:** Anjunabeats (9 themed playlists + playlist generator), Defected (playlist directory by label channel)
**Marginalia status:** MISSING
**Phase candidate:** Phase 9 (very quick win — static CMS-managed page with no backend)
**Dependencies:** Playlists must exist on streaming platforms first (content task)
**Effort:** S

---

### P2-6: Artist page — upcoming shows / event appearances
**Why now:** Ninja Tune's artist pages (Bonobo example) include upcoming events with Songkick ticket links — this creates the definitive fan destination for any roster artist. Currently ELIF's page has bio, social, booking, and press kit — but no upcoming shows.
**Source labels:** Ninja Tune (Bonobo page: events list with Songkick links integrated)
**Marginalia status:** MISSING
**Phase candidate:** Phase 10 (depends on Events Calendar from P2-4)
**Dependencies:** P2-4 (Events listing) must ship first so event data exists in the DB
**Effort:** M

---

## Cross-cutting themes

### Theme 1: Heading infrastructure is broken everywhere
9 of 18 pages audited have no `<h1>`. This is not a page-by-page oversight — it is a structural pattern from how listing pages are built: `app/[section]/page.tsx` renders the data component directly without a heading wrapper. Every new page built this way will inherit the same gap. **Recommendation:** Enforce a heading convention in the project's contributing guide — every `page.tsx` must include an `<h1>` either visibly or `sr-only` before the primary content component.

### Theme 2: Mobile is a second-class experience
Audits 02, 03, and 04 all surface the same finding independently: the mini-player is desktop-only, the first-visit audio prompt is desktop-only, the release card text is hidden on mobile, and the YouTube hero fallback is iframe-loaded on mobile. For a label whose fans arrive via Instagram and TikTok, this is the highest-impact systemic gap. **Recommendation:** All future component work should test mobile-first — build for 375px, enhance for desktop.

### Theme 3: Design token discipline has eroded
Across 9 components, hardcoded hex values bypass the `--color-*` token system defined in `globals.css`. This pattern will compound: every new component that copies from an existing one will propagate the hardcoded values. **Recommendation:** Add a custom ESLint rule or a `grep` pre-commit hook that flags `#580AFF`, `#9EFF0A`, and `#1F1F21` literals in component files.

### Theme 4: Accessibility as an afterthought
Audits 02 and 03 identify the same accessibility failures independently: missing heading hierarchy, missing label associations, missing focus management, missing keyboard operability. These are WCAG Level A and AA failures — not aspirational improvements. **Recommendation:** Add automated accessibility testing (Axe + Playwright) to the CI pipeline so new code cannot ship with these classes of failures.

### Theme 5: The capture surface problem — value exchange timing
Audits 01, 04, and the newsletter section of audit 04 all converge: Marginalia's conversion surfaces (newsletter, demo, presave) ask before delivering value. The newsletter has no value proposition, the demo form has no genre pre-qualification, and the homepage has no releases visible until the user scrolls past the hero. **Recommendation:** The rule for every CTA and form is: show what the user gets *before* asking for anything.

### Theme 6: Data exists but isn't expressed in schema
The DB has release dates, showcase venues, performer names, and product prices — but none of it is expressed as `MusicEvent`, `Product`, or `MusicGroup` JSON-LD. Structured data is a multiplier on existing content. **Recommendation:** For every new page type added, structured data output should be a checklist item in the phase success criteria (not a separate phase).

---

## Phase 9+ proposed roadmap

### Phase 9: Accessibility & SEO Foundation (all P0 + SEO P1 items)
**Goal:** Eliminate all WCAG Level A and AA failures identified in this audit; establish MusicGroup schema; fix sitemap; add Product JSON-LD.
**Plan count estimate:** 4 plans (accessibility sweeps by domain: navigation, forms, media players, structured data)
**Dependencies:** None — unblocked today
**Effort:** ~6 person-days

### Phase 10: Mobile UX & Content Depth
**Goal:** Mobile mini-player; release grid text on mobile; artist discography sections; release tracklists; showcase content enrichment (description field, date formatting, event schema).
**Plan count estimate:** 5 plans
**Dependencies:** Phase 9 (accessibility baseline useful before building new mobile components)
**Effort:** ~8 person-days

### Phase 11: Catalog Discovery & Conversion
**Goal:** Release filter chips (status, format); newsletter value proposition; free-shipping bar in cart; `Product` JSON-LD on merch; Shopify ISR caching; nav "More" dropdown.
**Plan count estimate:** 4 plans
**Dependencies:** Phase 10 (release grid text fix is a prerequisite for filters making visual sense)
**Effort:** ~5 person-days

### Phase 12: Mix Archive & Events
**Goal:** Episode detail pages for `/podcasts/[slug]`; numbered mix series with tracklist CMS field; standalone events listing page (separate from showcases) with external ticket links; event filter by city/artist.
**Plan count estimate:** 5 plans
**Dependencies:** Phase 10 (content schema additions build on depth established there)
**Effort:** ~10 person-days

### Phase 13: Community & Persistent Player v2
**Goal:** Persistent bottom player with queue builder and track count; curated playlist directory; demo form genre pre-qualification and response SLA copy; newsletter incentive (discount or exclusive content).
**Plan count estimate:** 4 plans
**Dependencies:** Phase 10 (mobile mini-player must ship before full queue player is meaningful)
**Effort:** ~10 person-days

---

## What I did NOT include and why

**FirstVisitPrompt removal (mentioned in audit 03):** The component audit notes `handleClick` has potentially redundant logic but does not call for removal. Audit 04 §5 actually proposes *extending* the first-visit prompt pattern to include a newsletter capture on mobile. I sided with the extend recommendation and did not propose removing the component.

**Audit 04 §3 recommendation to sort Shopify products by `BEST_SELLING`:** Deferred to P1-16 (ISR caching) as a combined fix. Changing sort order is a product decision (should Elif curate the order, or let algorithmic bestsellers lead?) — flagged for discussion rather than prescribing a specific sort key.

**Numbered navigation system (Drumcode pattern from audit 01):** Audit 01 notes Drumcode's numbered nav as a brand differentiator. Not included in recommendations because: (a) Marginalia already has a defined nav structure, (b) changing the nav numbering scheme is a brand/design decision that should involve the founder, not a technical audit recommendation.

**LabelRadar integration for demo submission:** Audit 01 (Mau5trap) suggests LabelRadar as a structured portal. Not included as an active recommendation because: (a) Marginalia already has a custom demo form that works, (b) LabelRadar involves third-party lock-in and ongoing cost, (c) the current form is built on Drizzle/Resend which Marginalia already operates. Flagged as a P2 consideration in the demo quality section if volume becomes a problem.

**Defected App / branded mobile app:** Audit 01 (Defected) mentions a branded app as a primary engagement channel. Not included — this is a Phase 15+ consideration appropriate for a label at 10x Marginalia's current scale.

**Beehiiv migration from Mailchimp (audit 04 §5):** The recommendation to migrate email providers was not included as a specific P1/P2 action item because: (a) the current Brevo integration (per `STATE.md`) is already not Mailchimp, so the specific Mailchimp free-tier concern doesn't apply, (b) email provider migration is a business decision with list migration risk that warrants a dedicated discovery conversation.

**`RandomBackground` rename (audit 02, 03):** The component is misleadingly named but functionally correct. The rename was noted in `P0` scope by audit 03 but did not make the P0 cut here — it is developer ergonomics, not user-facing. Included in cross-cutting Theme 3 as a future housekeeping item.

---

## Appendix: deep links

| Audit | File | Focus |
|-------|------|-------|
| 01 — Competitor Landscape | `.planning/audits/01-competitor-landscape.md` | 10 reference labels, gap analysis, top 12 features to adopt |
| 02 — Page Audit | `.planning/audits/02-page-audit.md` | 18 pages audited, P0 hotlist, site-wide patterns SW-1 through SW-12 |
| 03 — Component Audit | `.planning/audits/03-component-audit.md` | 49 components, cross-component issues CX-1 through CX-10, refactor priority list |
| 04 — Industry Best Practices | `.planning/audits/04-industry-best-practices.md` | 8 domains (homepage hero, fanlinks, merch, demo, newsletter, audio, SEO, performance), recommended sequence |
