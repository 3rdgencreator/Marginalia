---
audit: component-audit
date: 2026-04-30
auditor: Claude Sonnet 4.6 (automated)
stack: Next.js 15 App Router · React 19 · Tailwind v4 · Drizzle ORM
scope: components/ (excluding keystatic/ and admin/)
---

# Marginalia Component Audit — 2026-04-30

## 1. Component Inventory Table

| Component | Path | Role | LOC | Client/Server | Grade |
|---|---|---|---|---|---|
| SiteNav | layout/SiteNav.tsx | Primary navigation bar with logo, links, social icons, cart | 84 | server | B |
| SiteFooter | layout/SiteFooter.tsx | Footer with newsletter, social icons, pre-save badges | 152 | server | B |
| MiniPlayer | layout/MiniPlayer.tsx | Fixed-bottom audio transport bar with VU meter | 222 | client | C |
| NavLinks | layout/NavLinks.tsx | Desktop nav link list with active-page indicator | 39 | client | A |
| MobileMenu | layout/MobileMenu.tsx | Full-screen mobile navigation overlay | 97 | client | B |
| NewsletterForm | layout/NewsletterForm.tsx | Inline email signup form posting to /api/subscribe | 58 | client | C |
| AnnouncementBar | layout/AnnouncementBar.tsx | Fixed marquee bar above content area | 66 | server | B |
| Container | layout/Container.tsx | Max-width layout wrapper | 13 | server | A |
| RandomBackground | ui/RandomBackground.tsx | Blurred photo background with light-mode context | 32 | server | C |
| FirstVisitPrompt | ui/FirstVisitPrompt.tsx | Floating play/pause button for homepage audio | 96 | client | C |
| SocialIcon | ui/SocialIcon.tsx | Platform icon link with aria-label | 74 | server | B |
| HeroYouTube | ui/HeroYouTube.tsx | YouTube iframe background with thumbnail placeholder | 43 | client | B |
| Logo | ui/Logo.tsx | Marginalia wordmark image | 21 | server | A |
| SplashScreen | ui/SplashScreen.tsx | Animated loading screen with progress bar | 124 | client | B |
| ReleaseCard | releases/ReleaseCard.tsx | Square cover-art card linking to release detail | 79 | server | B |
| ReleaseGrid | releases/ReleaseGrid.tsx | Responsive grid of ReleaseCards | 30 | server | A |
| ReleaseMetaHeader | releases/ReleaseMetaHeader.tsx | Release title, artist, and date header | 41 | server | A |
| LayloButton | releases/LayloButton.tsx | Gradient CTA for Laylo pre-save/community links | 71 | server | C |
| PlatformIconRow | releases/PlatformIconRow.tsx | Vertical list of streaming platform links | 36 | server | A |
| MorePlatforms | releases/MorePlatforms.tsx | Collapsible secondary streaming platform list | 63 | server | B |
| ReleaseLink | releases/ReleaseLink.tsx | Individual streaming platform row link | 61 | server | A |
| ArtistLink | releases/ArtistLink.tsx | Inline text link to artist page | 19 | server | A |
| GenreChip | releases/GenreChip.tsx | Colored tag badge for release genre | 41 | server | B |
| EmbedSkeleton | releases/EmbedSkeleton.tsx | Loading placeholder for SoundCloud iframe | 9 | server | A |
| SoundCloudEmbed | releases/SoundCloudEmbed.tsx | Client-side dynamic wrapper for SC iframe | 17 | client | A |
| SoundCloudPlayer | releases/SoundCloudPlayer.tsx | SoundCloud iframe renderer | 18 | server | B |
| ArtistCard | artists/ArtistCard.tsx | Photo card linking to artist detail page | 45 | server | B |
| ArtistSocialRow | artists/ArtistSocialRow.tsx | Horizontal social icon links for artist profiles | 102 | server | C |
| PodcastAccordion | podcasts/PodcastAccordion.tsx | Episode list with inline SC embed on selection | 120 | client | C |
| PodcastPlayer | podcasts/PodcastPlayer.tsx | Full sticky podcast player with track list | 198 | client | B |
| PodcastRow | podcasts/PodcastRow.tsx | Single accordion row for podcast episode | 110 | client | A |
| PressEntry | press/PressEntry.tsx | Single press clipping with badge, headline, excerpt | 82 | server | A |
| ShowcaseCard | showcases/ShowcaseCard.tsx | Event card for upcoming/past showcases | 121 | server | C |
| AfterMovieEmbed | showcases/AfterMovieEmbed.tsx | YouTube embed for showcase aftermovie | 34 | client | B |
| ShowcaseAfterMovie | showcases/ShowcaseAfterMovie.tsx | Dynamic wrapper for AfterMovieEmbed | 14 | client | A |
| RecordingsList | showcases/RecordingsList.tsx | List of SC embeds for showcase recordings | 42 | client | B |
| ShowcaseMerchSection | showcases/ShowcaseMerchSection.tsx | Merch grid section for showcase detail pages | 19 | server | A |
| ShowcaseLinksList | showcases/ShowcaseLinksList.tsx | External links section for showcase detail pages | 34 | server | B |
| CartButton | merch/CartButton.tsx | Nav cart icon with item count badge | 44 | client | C |
| CartDrawer | merch/CartDrawer.tsx | Slide-in cart panel with line items and checkout | 189 | client | C |
| MerchGrid | merch/MerchGrid.tsx | Responsive product grid with empty state | 60 | server | B |
| ProductDetail | merch/ProductDetail.tsx | Full product page with gallery, options, add to cart | 272 | client | C |
| ShopifyBuyButton | merch/ShopifyBuyButton.tsx | Dynamic Shopify embed code injector | 44 | client | B |
| DemoForm | demos/DemoForm.tsx | Demo submission form with honeypot | 207 | client | B |
| SubscribePanel | subscribe/SubscribePanel.tsx | Email subscribe panel with optional Laylo CTA | 99 | client | C |
| AboutBody | about/AboutBody.tsx | Keystatic DocumentRenderer wrapper | 11 | server | B |
| DownloadGate | downloads/DownloadGate.tsx | Free download card grid | 73 | server | B |
| ServicesContent | services/ServicesContent.tsx | Service selector and contact form orchestrator | 49 | client | B |
| ContactForm | services/ContactForm.tsx | Service inquiry form | 96 | client | B |

---

## 2. Per-Component Sections

### `components/layout/SiteNav.tsx`
**Role:** Sticky top navigation bar rendering logo, primary nav links, social icons, and cart button.
**LOC:** 84
**Client/server:** server (async, reads DB)

**Code quality:**
- Line 74: `text-[#444]` is a hardcoded hex not present in the design system. Social icons should use `text-(--color-text-secondary)` or `text-(--color-text-muted)`.
- `PRIMARY_LINKS` and `SOCIAL_PLATFORMS` are module-level constants (correct for a server component), but are defined in this file rather than a shared `nav-config.ts`. MobileMenu receives the same `PRIMARY_LINKS` array via prop — if these ever diverge, they will need to be updated in two places.
- Inline `style` objects on lines 52–58 and 60–62 duplicate layout logic that could live in Tailwind classes.

**Accessibility:**
- The `<header>` has `aria-label="Main navigation"` — semantically correct. `<NavLinks>` adds `aria-current="page"` correctly.
- Social icons in the nav have `aria-label="{platform}, Marginalia"` which is correct.
- CartButton `aria-label` is dynamic and correct.
- No `<nav>` landmark wraps the `<NavLinks>` inside the header — the `<ul>` alone is not a navigation landmark. Wrap `NavLinks` output in a `<nav aria-label="Primary">` element.

**Performance:**
- Logo image uses `priority` — correct for LCP.
- `resolveNavbarColor` is called once server-side — no concern.
- The social icon list renders 6 icons; no memoization needed for server components.

**Design system fidelity:**
- Line 74: `text-[#444]` violates design tokens; closest token is `--color-text-muted` (#CAC9F9 on dark) which is a different color. This needs a decision: either the icon default should use a token or a new token `--color-icon-inactive` should be created.
- Padding `0 20px 0 36px` (line 57) and gap `64px` (line 60) are magic numbers not using `--space-*` tokens.

**Microcopy / UX:**
- No skip-to-main-content link is present anywhere in the document. SiteNav is the natural place to add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as the very first child.

**Mobile:**
- The desktop `<ul>` of social icons is hidden on mobile with `hidden md:flex` — correct. MobileMenu replaces it.
- `CartButton` is always visible regardless of viewport — correct.

**Top recommendations:**
1. Add a skip-to-content link as first child of the `<header>` — effort S — priority P0 (WCAG 2.4.1)
2. Replace `text-[#444]` on line 74 with `text-(--color-text-secondary)` and align with SocialIcon's own default class — effort S — priority P1
3. Wrap `NavLinks` in a `<nav aria-label="Primary">` element; move `PRIMARY_LINKS` to `lib/nav-config.ts` and import in both SiteNav and MobileMenu — effort S — priority P1

---

### `components/layout/SiteFooter.tsx`
**Role:** Footer with newsletter form, social icons (mobile), and pre-save release badges.
**LOC:** 152
**Client/server:** server (async, reads DB)

**Code quality:**
- Lines 78–84: The grid `gridTemplateColumns` calculation (`Math.max(80, Math.min(130, Math.floor(400 / presaves.length)))`) is inline style computation executed every render. It is deterministic based on data length, so this is not a performance problem per se, but the magic numbers (80, 130, 400) have no documentation. Extract to a named constant.
- The `resolveImageUrl` import from `@/lib/db/queries` handles artwork, which is also performed in `ReleaseCard` (line 33: `entry.coverArt ?? entry.artworkUrl`). This is the same pattern appearing in two components — the logic is consistent but not shared.
- Missing `<h2>` or section label for the "Pre-Save / New Releases" column in column 2 — screen reader users get no heading context for those badges. The mobile "Connect" heading exists (line 64) but nothing for the badges.

**Accessibility:**
- Pre-save release links have `aria-label={artistName ? \`${title} by ${artistName}\` : title}` — correct.
- The badge `<span>` at line 107 has `pointerEvents: 'none'` and no `aria-*` — since the parent link has a full aria-label, this is fine.
- Hover overlay is `aria-hidden="true"` — correct.
- The newsletter section `id="newsletter"` is the target of the `#newsletter` anchor in SiteNav's social links — this pattern works but the section has no heading visible to AT other than the micro-uppercase `Newsletter` label (line 50), which lacks heading semantics. Use `<h2>` or at minimum add role context.

**Performance:**
- `Promise.all([getSiteConfig(), getFooterBadgeReleases()])` — correct parallelism.
- Pre-save images use `width={120} height={120}` but `sizes` is not set; add `sizes="120px"` to prevent oversized network requests.

**Design system fidelity:**
- Line 109: badge color uses `background: 'var(--color-accent-lime)'` — token-correct.
- Line 129: hover overlay uses literal `text-white` and `text-white/70` instead of `--color-text-primary`. In the dark context these are identical in effect, but if the footer ever runs on a light background, these would fail. Use tokens.

**Microcopy / UX:**
- Pre-save section has no visible heading on desktop — a user scrolling to the footer has no label for these small artwork thumbnails. Add "New Releases" or "Coming Soon" heading above the grid.

**Mobile:**
- Social icons are shown in mobile only (`md:hidden` block). On desktop they are in the nav bar — correct separation.
- Touch target for pre-save thumbnails is the entire square image card, which can be as small as 80px — acceptable.

**Top recommendations:**
1. Add `sizes="120px"` to pre-save `<Image>` (line 93) to avoid downloading full-resolution artwork — effort S — priority P1
2. Add a visible desktop heading above the pre-save badges column (e.g., "Upcoming") — effort S — priority P2
3. Elevate the "Newsletter" text (line 50) to a `<h2>` or add `aria-labelledby` to the newsletter region — effort S — priority P2

---

### `components/layout/MiniPlayer.tsx`
**Role:** Fixed-bottom audio transport (play/pause/skip/seek) with simulated stereo VU meter, shown only after first play.
**LOC:** 222
**Client/server:** client

**Code quality:**
- The VU meter `setInterval` at 60ms is always running when `MiniPlayer` is mounted (after first play, before dismiss). When `!isPlaying`, it still ticks every 60ms to animate the decay. This means a persistent ~16fps React state update (`setLevels`) even when the page is idle and the player is paused. Switching the animation to CSS or pausing the interval when not playing and levels are already zero would eliminate unnecessary re-renders.
- Lines 178–193 (transport buttons): `onMouseEnter`/`onMouseLeave` manipulate inline `style` directly on the DOM element. This bypasses React state and is not observable in React DevTools. Prefer Tailwind `hover:` classes or a small CSS variable approach.
- `createPortal(…, document.body)` is correct for a fixed-position element, but there is no SSR guard beyond the `mounted` check — the check is present (line 89) and correct.
- The `bgColor` prop (line 77) is typed as `string | undefined` but the default fallback `'rgba(10,10,12,0.85)'` is hardcoded and not a token. No token for this overlay background exists; at minimum document why.

**Accessibility:**
- The seek bar (line 144–149) is a `<div>` with an `onClick` but no `role="slider"`, no `aria-valuemin/max/valuenow`, and is not keyboard operable. A user cannot seek by keyboard.
- The artwork `<img>` (line 126–133) correctly provides `alt={currentTitle}` but uses the `eslint-disable-next-line @next/next/no-img-element` suppression — acceptable here since the artwork URL is from SoundCloud's CDN and `next/image` requires a configured remote domain. Document this explicitly in a comment.
- "Now Playing" label (line 156) is `<span>` with no live region. Screen reader users get no notification when the track changes. Add `aria-live="polite"` to the track title container.
- The "Minimize" (dismiss) button label (line 110) reads "Hide player" — this is clear and acceptable.

**Performance:**
- The VU meter renders 24 `<div>` segments (2 × 12) per tick at 60ms. React reconciles all of them. On a low-powered mobile device this is expensive. Since the player is hidden on mobile (`hidden md:block`, line 94), the impact is desktop-only, but it still affects battery life when the tab is in the foreground.
- `tracks[currentIndex]?.artwork_url` is accessed twice (lines 85 and 127). Assign once to a variable.

**Design system fidelity:**
- Line 156: `color: '#9EFF0A'` (hardcoded hex) should be `var(--color-accent-lime)`.
- Line 54: `'#9EFF0A'` again hardcoded in VU meter segment color — same issue.
- Line 148: `backgroundColor: 'var(--color-accent-lime)'` — token correct.
- Background `rgba(10,10,12,0.85)` (line 139) is not a token. This is darker than `--color-bg` (#1F1F21). No equivalent token exists; flag for addition.

**Microcopy / UX:**
- There is no volume control. `volume` state is read from `usePlayer()` and the `VUMeter` uses it for display scaling, but there is no UI element to set it. The old "gain knob" position is now unused space (line 104 comment: "Minimize — sits where gain knob was"). This is a noted gap.
- There is no track number or total indicator (e.g., "2 / 7"). Users cannot see how many tracks are in the playlist or their position within it.

**Mobile:**
- Entire component is `hidden md:block` — intentional. No mobile player exists as a separate component.

**Top recommendations:**
1. Replace the `setInterval` VU meter with a CSS animation (`@keyframes`) that activates/deactivates via a class toggle — eliminates the 60ms React state churn entirely — effort M — priority P1
2. Make the seek bar keyboard-operable: add `role="slider"`, `tabIndex={0}`, `aria-valuenow={Math.round(progress * 100)}`, `aria-valuemin={0}`, `aria-valuemax={100}`, and `onKeyDown` handler — effort S — priority P0
3. Replace all hardcoded `#9EFF0A` references (lines 54, 156) with `var(--color-accent-lime)` — effort S — priority P1

---

### `components/layout/NavLinks.tsx`
**Role:** Horizontal desktop nav list with active-page underline indicator.
**LOC:** 39
**Client/server:** client (needs `usePathname`)

Clean component. Active detection `pathname.startsWith(href)` (line 20) will falsely match `/releases` for an href of `/` — guarded by `href !== '/'` on line 20 — correct. `aria-current="page"` — correct.

**Top recommendations:**
1. The `gap-6` (1.5rem) class is equivalent to `--space-lg` but uses a Tailwind unit directly — acceptable, but note inconsistency with `--space-*` token system. Low priority — effort S — priority P2.

---

### `components/layout/MobileMenu.tsx`
**Role:** Hamburger-triggered full-screen mobile nav overlay.
**LOC:** 97
**Client/server:** client

**Code quality:**
- Three separate `useEffect` calls handle: (1) close on route change, (2) body scroll lock, (3) Escape key. Each is correct and clearly separated.
- The `dialog` role on the overlay (line 68) is appropriate, but the `MobileMenu` button that opens it is outside the dialog and not associated to the dialog via `aria-haspopup="dialog"` — add this attribute.

**Accessibility:**
- `aria-expanded` on the trigger button — correct.
- `aria-controls="mobile-nav-overlay"` — correct; paired with `id="mobile-nav-overlay"` on the dialog.
- `aria-modal="true"` on the dialog — correct.
- Focus is NOT moved into the dialog when it opens. When a user opens the mobile menu by keyboard, focus remains on the hamburger button. Add `useEffect` to move focus to the first nav link when `open === true`.
- Scroll lock uses `document.body.style.overflow = 'hidden'` — this can cause layout shift on systems where scrollbar width is non-zero. The body also uses `overflow-x: clip` (globals.css line 131) which is already set. For `overflow-y`, `hidden` is correct here but may cause a jump; consider `overflow: hidden; padding-right: scrollbarWidth` pattern if this becomes noticeable.

**Performance:**
- No concerns for this LOC size.

**Design system fidelity:**
- `bg-(--color-bg)` for overlay — token correct.
- Active link uses `text-(--color-accent-lime)` — token correct.

**Top recommendations:**
1. Move focus to first nav link when menu opens: `useEffect(() => { if (open) document.getElementById('mobile-nav-overlay')?.querySelector('a')?.focus(); }, [open])` — effort S — priority P0
2. Add `aria-haspopup="dialog"` to the hamburger button — effort S — priority P1

---

### `components/layout/NewsletterForm.tsx`
**Role:** Inline email signup form (used in footer) that posts to `/api/subscribe`.
**LOC:** 58
**Client/server:** client

**Code quality:**
- Line 12: `if (!email.includes('@'))` is a weak email validation. The `<input type="email" required>` (line 38) already enforces browser-native validation. The custom check adds nothing meaningful and would reject `a@b` as invalid. Remove the custom check and rely on the native validation, or use a proper regex.
- On API error (line 22 `catch`), the form sets state to `'ok'` with a comment "degrade gracefully." This silently swallows network errors — the user gets a false success confirmation. This is intentional but undocumented risk: if the API is down, users get a wrong confirmation. At minimum, log to console in development.
- The `inputRef` is created (line 8) but never used. Dead code — remove it.

**Accessibility:**
- The email input lacks an explicit `<label>` — it has a `placeholder` but no visible or associated label. Screen readers will announce the placeholder, but once text is typed the placeholder disappears. Add `<label htmlFor="newsletter-email">Email</label>` (or `aria-label`) with `id="newsletter-email"` on the input.
- Error state (line 53–55) renders `sr-only` text, which is appropriate for AT, but the input has no `aria-describedby` linking to the error region and no `aria-invalid="true"` applied.

**Performance:**
- No concerns.

**Design system fidelity:**
- All classes use design tokens correctly.
- `text-[10px]` is used inline — this matches `--text-label: 0.75rem` (12px) approximately but is different (10px). Use the token class `text-(--text-label)` for consistency; if 10px is intentional, document it.

**Microcopy / UX:**
- Error message is screen-reader only (`sr-only`) — sighted users see no error indicator when they submit an invalid email. The input border should change or an inline error message should be visible.
- Loading state shows `…` (ellipsis character) — not announced to AT. Use a proper `aria-busy="true"` on the button or a visible spinner with `aria-label`.

**Top recommendations:**
1. Add visible `<label>` (or `aria-label`) to the email input and add `aria-invalid`/`aria-describedby` for the error state — effort S — priority P0
2. Remove the unused `inputRef` (line 8) — effort XS — priority P2
3. Replace the `catch { setState('ok') }` silent swallow with `catch { setState('error') }` and show a visible inline error — effort S — priority P1

---

### `components/layout/AnnouncementBar.tsx`
**Role:** Fixed marquee announcement strip rendered above page content.
**LOC:** 66
**Client/server:** server

**Code quality:**
- `role="marquee"` (line 62) is not a valid ARIA role. The valid approach is to use `aria-live="off"` or `aria-label` on a static element. This may trigger accessibility audit failures.
- When `url` is present, the outer element is `<a>` (correct), but `target` is set conditionally based on whether the URL starts with `/` — this logic is correct.
- When no URL is present, `<MarqueeTrack>` has `aria-hidden="true"` — this hides the scrolling duplicate text from AT, and the static `aria-label` on the wrapper provides the accessible name — correct pattern.
- Animation is pure CSS via `announcement-scroll` keyframe (globals.css line 152) — performant.

**Accessibility:**
- `role="marquee"` must be changed. Use `aria-label={text}` on a `<div>` without the invalid role. Moving text is by definition problematic for users with vestibular disorders — consider adding `@media (prefers-reduced-motion)` to pause the animation.
- When the bar is a link (`<a>` variant), the `rel="noopener noreferrer"` is always applied even for internal links (`url.startsWith('/')`). `rel` is only meaningful for external links; strip it for internal URLs.

**Design system fidelity:**
- `background: 'rgba(0,0,0,0.40)'` (line 43) is not a token, but `--color-bg` at opacity would be the closest equivalent. Acceptable as-is given the specific visual need.
- `top: 'calc(var(--nav-height-mobile) + 6px)'` — correctly uses the nav height token.

**Top recommendations:**
1. Remove `role="marquee"` (invalid ARIA role) — use `aria-label={text}` alone — effort S — priority P0
2. Add `@media (prefers-reduced-motion) { animation-play-state: paused }` to the `announcement-scroll` keyframe or its container — effort S — priority P1
3. Strip `rel="noopener noreferrer"` when `url.startsWith('/')` on line 51 — effort S — priority P2

---

### `components/layout/Container.tsx`
**Role:** Centered max-width wrapper with horizontal padding.
**LOC:** 13
**Client/server:** server

Clean and correct. `max-w-[1280px]` matches `--max-width-content: 1280px` token. No issues.

---

### `components/ui/RandomBackground.tsx`
**Role:** Full-height blurred background image with light-mode CSS variable override for child content.
**LOC:** 32
**Client/server:** server

**Code quality:**
- The component hardcodes the background to a single static file: `const BG = '/backgrounds/bg-main.jpg'` (line 1). The prop is named `RandomBackground` implying randomization, but no randomization exists. Either rename to `PageBackground` or implement actual randomization from a set of background images.
- Lines 22–26: CSS variables are set as inline `style` props duplicating what `.on-light-bg` already does in globals.css (lines 81–87). The `on-light-bg` class is applied (line 19) AND the same variables are re-set via `style`. The inline style overrides take precedence, which means the `.on-light-bg` class definition in globals.css for those three variables is dead code in this component. Either rely on the class alone or the inline style alone — not both.
- `darkContent` prop (line 17) skips the `.on-light-bg` class and the inline override — the children receive no contextual token reassignment. This is semantically inconsistent: why have a background wrapper that provides no style context for dark content?

**Performance:**
- Background uses CSS `background-image` with `filter: blur(2px)` and `transform: scale(1.01)` — both GPU-composited. No concern.
- The background image is not a Next.js `<Image>` — no automatic format optimization or lazy loading. Since this is a full-screen background, `preload` could be added to the link tag in the page `<head>` instead.

**Design system fidelity:**
- Hardcoded color values in the style prop (`#1F1F21`, `#3A3A3C`, `#5A5A6A`) on lines 23–25 match the `.on-light-bg` token overrides in globals.css — consistent but redundant.

**Top recommendations:**
1. Remove the inline `style` CSS variable overrides (lines 22–26) and rely solely on the `on-light-bg` class — the class already sets these variables — effort S — priority P1
2. Rename component from `RandomBackground` to `PageBackground` to accurately describe its behavior, or implement actual random selection from multiple background images — effort S — priority P2
3. Add a `<link rel="preload" as="image" href="/backgrounds/bg-main.jpg">` in the consuming page's `<head>` (via `generateMetadata`) to improve LCP on light-background pages — effort S — priority P1

---

### `components/ui/FirstVisitPrompt.tsx`
**Role:** Floating circular button that initiates audio playback on the homepage; hides after MiniPlayer is active.
**LOC:** 96
**Client/server:** client

**Code quality:**
- `handleClick` (lines 22–35): when already loaded and not playing, it calls `togglePlay()` then immediately `playOnReady()`. `playOnReady` is a player-store method that sets a flag to auto-play on the next widget load event. Calling it after `togglePlay` may double-trigger if the widget is already loaded. The logic should be `if (!isPlaying) togglePlay()` — the `playOnReady()` branch is only for the initial load.
- The SVG `<defs>` block with the `fvp-glow` filter (lines 47–57) renders on every mount but is never referenced in this component's own markup. The filter is defined but unused here — remove it or verify it is being applied elsewhere via CSS/filter reference.
- `setLoaded` (line 14) is local state that tracks whether `loadPlaylist` has been called. This duplicates state that already lives in `player-store` (the store knows if a playlist is loaded). Consider using a store-level flag.

**Accessibility:**
- The button has `aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}` — correct and dynamic.
- Position is `fixed` at a calculated top offset — it may overlap content on small screens.
- No focus trap needed (single button).
- The SVG icons are `aria-hidden="true"` — correct.

**Performance:**
- The 1500ms `setTimeout` before showing (lines 17–19) prevents the button from flashing during SSR hydration — reasonable.

**Design system fidelity:**
- Background `rgba(255,255,255,0.15)` and color `rgba(255,255,255,0.85)` are not tokens, but these are fine for a one-off floating UI element with no design-system equivalent.

**Top recommendations:**
1. Remove the unused SVG `<defs>` / `fvp-glow` filter (lines 47–57) that is never referenced — effort S — priority P1
2. Simplify `handleClick` — remove redundant `playOnReady()` call when the playlist is already loaded — effort S — priority P1

---

### `components/ui/SocialIcon.tsx`
**Role:** Single social platform icon link with aria-label, null-returns if URL is absent.
**LOC:** 74
**Client/server:** server

Well-structured. Inline SVG paths avoid external fetches. `aria-hidden="true"` on the SVG — correct.

**Accessibility:**
- `aria-label="{LABELS[platform]}, Marginalia"` — acceptable. The ", Marginalia" suffix is informative for AT users who need brand context, though slightly verbose.

**Design system fidelity:**
- Default className uses `text-(--color-text-secondary)` — token correct. SiteNav overrides this with `text-[#444]` — that override is the problem, not SocialIcon itself.

**Top recommendation:**
1. The `newsletter` icon uses a generic envelope SVG path that is different from the Simple Icons envelope pattern — no issue, but ensure the icon is visually consistent with other platforms. Low priority — effort S — priority P2.

---

### `components/ui/HeroYouTube.tsx`
**Role:** YouTube iframe background with thumbnail as CLS guard during load.
**LOC:** 43
**Client/server:** client

Clean fade-in pattern. `aria-hidden="true"` on both the thumbnail div and iframe — correct, this is purely decorative background video.

**Performance:**
- `loading="eager"` is set — correct since this is above-the-fold content.
- `pointerEvents: 'none'` on the iframe prevents accidental user interaction with the background — correct.
- The thumbnail div transitions from `opacity: 1` to `opacity: 0` — no `display: none` is ever applied, so the thumbnail image remains in the DOM and paint tree even after hidden. This is minor but could be improved with `display: none` post-load.

**Top recommendation:**
1. After `loaded === true`, set `display: 'none'` on the thumbnail div instead of keeping it in the paint tree at `opacity: 0` — effort S — priority P2.

---

### `components/ui/Logo.tsx`
**Role:** Marginalia wordmark using `next/image` with aspect-ratio preservation.
**LOC:** 21
**Client/server:** server

Clean. `priority` prop is passed — appropriate since Logo appears in the footer above the fold during page render. Aspect ratio calculation `1839 / 579` is a hardcoded ratio matching the source image — document this magic constant.

---

### `components/ui/SplashScreen.tsx`
**Role:** Full-screen loading animation with progress bar and logo fade-in, unmounts after ~3.75s.
**LOC:** 124
**Client/server:** client

**Code quality:**
- `initiated.current` ref guard (line 13) prevents double-mount in React 19 Strict Mode — correct and necessary.
- `setInterval` + two `setTimeout` calls (lines 20–34) — all properly cleaned up in the `useEffect` return — correct.
- Line 91: `fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif'` — this is not the Marginalia brand font (`var(--font-sans)` / Nimbus Sans). The progress percentage counter uses Apple system font instead of the design system font. Use `fontFamily: 'inherit'` or `var(--font-sans)`.

**Accessibility:**
- The splash screen has `pointerEvents: exiting ? 'none' : 'all'` (line 57) — correct to prevent interaction during exit transition.
- No `aria-live` announcement when complete. Screen readers will not know when content becomes available. Add `role="status"` and announce completion, or simply ensure the splash does not interfere with AT by adding `aria-hidden="true"` to the entire splash container.
- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` is missing from the progress bar div.

**Design system fidelity:**
- `backgroundColor: '#1F1F21'` (line 52) — this matches `--color-bg` but is hardcoded. Use `var(--color-bg)`.
- Progress bar fill `backgroundColor: 'rgba(255,255,255,0.6)'` — not a token. Acceptable for a loading screen.

**Top recommendations:**
1. Add `role="progressbar"` with `aria-valuenow={progress}` `aria-valuemin={0}` `aria-valuemax={100}` and `aria-label="Loading Marginalia"` to the progress bar container — effort S — priority P1
2. Replace `-apple-system` font stack (line 91) with `fontFamily: 'inherit'` to use Nimbus Sans — effort S — priority P1
3. Replace `backgroundColor: '#1F1F21'` (line 52) with `backgroundColor: 'var(--color-bg)'` — effort S — priority P2

---

### `components/releases/ReleaseCard.tsx`
**Role:** Square artwork card with desktop hover overlay, links to release detail page.
**LOC:** 79
**Client/server:** server

**Code quality:**
- Lines 32–46: image source resolution uses an IIFE: `{(() => { const src = ...; return src ? ... })()}`. This pattern is unnecessarily complex for a server component — extract to a variable above the JSX.
- The `.replace('3000x3000bb', '600x600bb')` on line 33 is a SoundCloud artwork URL transform that also appears in `SiteFooter.tsx` (line 27) and in `PodcastPlayer.tsx` (line 41, different regex). This URL transform logic is duplicated in at least 2-3 places. It should live in a shared utility, e.g., `lib/artwork.ts`.

**Accessibility:**
- `aria-label` on the Link covers both title and artist — correct.
- The overlay is `aria-hidden="true"` and only visual — correct.
- The "No artwork" placeholder text at line 48 is wrapped in `aria-hidden="true"` — this means AT users get only the Link's `aria-label` for a release without artwork. Since the label already includes title and artist, this is correct.
- `group-focus-visible:opacity-100` on the overlay (line 61) — overlay becomes visible on keyboard focus, which is good for sighted keyboard users, but the overlay text is `aria-hidden` so it does not add AT value.

**Performance:**
- `sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"` — appropriate for a 3→6 column grid.
- No client JavaScript — pure server component. Optimal.

**Design system fidelity:**
- `bg-[rgba(31,31,33,0.70)]` (line 61) hardcodes the bg color as a literal RGB instead of using `--color-bg` at 70% opacity. Use `bg-(--color-bg)/70` in Tailwind v4 or `rgba(var(--color-bg-rgb), 0.70)`.
- `border-white/70` and `bg-white/10` — not tokens, but these semi-transparent utility values are consistently used across the codebase as a pattern. Acceptable if normalized.

**Top recommendations:**
1. Extract the SoundCloud artwork URL transform (`.replace('3000x3000bb', '600x600bb')`) to `lib/artwork.ts` — it appears in at least 3 components — effort S — priority P1
2. Simplify the IIFE image render to a variable above JSX — effort S — priority P2
3. Replace `bg-[rgba(31,31,33,0.70)]` with `bg-(--color-bg)/70` — effort S — priority P2

---

### `components/releases/ReleaseGrid.tsx`
**Role:** Responsive CSS grid wrapping ReleaseCard items.
**LOC:** 30
**Client/server:** server

Clean. `aria-label="Releases catalog"` on `<ul>` — correct. Grid breakpoints (3→4→5→6 columns) are appropriate for the content type. No issues.

---

### `components/releases/ReleaseMetaHeader.tsx`
**Role:** Release page H1 + artist name + formatted release date.
**LOC:** 41
**Client/server:** server

Clean. `<time dateTime={releaseDate}>` — correct semantics. Date formatted to UTC to avoid timezone shifts — correct. `--tracking-tight: -0.02em` is applied inline via Tailwind class `tracking-[-0.02em]` — this matches the token value but uses a hardcoded number instead of `tracking-(--tracking-tight)`.

**Top recommendation:**
1. Replace `tracking-[-0.02em]` (line 23) with `tracking-(--tracking-tight)` to use the design token — effort S — priority P2.

---

### `components/releases/LayloButton.tsx`
**Role:** Gradient CTA button linking to Laylo pre-save or community page.
**LOC:** 71
**Client/server:** server

**Code quality:**
- Lines 53: `bg-gradient-to-r from-[#580AFF] to-[#9B30FF]` — `#580AFF` matches `--color-accent-violet` token, but `#9B30FF` is a custom midpoint not in the design system. The gradient hover state `hover:from-[#4A08D6] hover:to-[#8B25EE]` uses two more magic colors. With Tailwind v4, dynamic gradient tokens are possible but would require a custom `@theme` gradient entry. Flag for design decision: should this gradient be formalized as `--gradient-laylo`?

**Accessibility:**
- `aria-label="{label} — {releaseTitle}"` — correct, disambiguates the button in context.
- Arrow SVG is `aria-hidden="true"` — correct.

**Design system fidelity:**
- `#580AFF` is token-aligned (violet); `#9B30FF` and the hover variants are not in the system.

**Top recommendation:**
1. Extract the Laylo gradient colors to CSS custom properties in globals.css (e.g., `--gradient-laylo-from`, `--gradient-laylo-to`) and replace the four hardcoded hex values in this file — effort S — priority P2.

---

### `components/releases/PlatformIconRow.tsx`
**Role:** Ordered list of primary streaming platform links.
**LOC:** 36
**Client/server:** server

Clean delegation to `ReleaseLink`. `aria-label="Listen on"` on the `<ul>` — correct. Null guard via `hasAny` check — correct.

---

### `components/releases/MorePlatforms.tsx`
**Role:** `<details>`/`<summary>` disclosure for secondary streaming platforms.
**LOC:** 63
**Client/server:** server

**Accessibility:**
- `<details>/<summary>` is a native HTML disclosure — keyboard operable, role-correct, no extra ARIA needed.
- `[&_summary::-webkit-details-marker]:hidden` hides the browser default marker — correct.
- The chevron SVG has `aria-hidden="true"` — correct (summary text provides the accessible name).
- Duplicate `aria-label="Also available on"` appears on both the `<summary>` text content and the inner `<ul>`. The `<ul>` label is redundant since the list is already labeled by the section context — remove `aria-label` from the `<ul>`.

**Top recommendation:**
1. Remove `aria-label="Also available on"` from the inner `<ul>` (line 42) — redundant with the `<summary>` label — effort S — priority P2.

---

### `components/releases/ReleaseLink.tsx`
**Role:** Individual streaming platform link row with icon and arrow.
**LOC:** 61
**Client/server:** server

Clean. `aria-label=\`Listen on ${label}: ${releaseTitle}\`` — correct disambiguation. SVG icon is `aria-hidden="true"`. Token usage via `border-(--color-surface)` etc. — correct.

---

### `components/releases/ArtistLink.tsx`
**Role:** Inline text link to artist page from release metadata.
**LOC:** 19
**Client/server:** server

Minimal and correct. `aria-label="{name} on Marginalia"` adds context. Guard for empty slug/name — correct.

---

### `components/releases/GenreChip.tsx`
**Role:** Colored tag badge for release genre classification.
**LOC:** 41
**Client/server:** server

**Code quality:**
- Only 5 genres have mapped styles (`GENRE_STYLE`). All other genres fall back to `FALLBACK_STYLE` which uses `--color-surface` bg and `--color-text-secondary` fg — this is a visually neutral "unknown genre" state. The design system has 11 tag color tokens (`--color-tag-*`) but only 5 are used here. As the label catalog grows, this mapping needs maintenance.

**Design system fidelity:**
- Uses `--color-tag-*` tokens for background — correct.
- `fg: 'text-(--color-bg)'` for some genres — correct contrast on colored backgrounds.

**Top recommendation:**
1. Expand `GENRE_STYLE` to cover the remaining genres that Marginalia releases under (confirm with Keystatic genre list), mapping each to one of the remaining 6 `--color-tag-*` tokens — effort S — priority P2.

---

### `components/releases/EmbedSkeleton.tsx`
**Role:** 166px placeholder rendered while SoundCloud iframe loads.
**LOC:** 9
**Client/server:** server

Minimal and correct. `aria-hidden="true"` — correct since it is decorative. Uses `--color-surface` token. No issues.

---

### `components/releases/SoundCloudEmbed.tsx` + `SoundCloudPlayer.tsx`
**Role:** Two-layer dynamic wrapper pattern — `SoundCloudEmbed` dynamically imports `SoundCloudPlayer` with `ssr: false` and a skeleton fallback.
**LOC:** 17 + 18
**Client/server:** client + server (player renders as server, iframe has no client JS)

Clean split. The two-file pattern avoids the `use client` boundary pollution into server pages. `SoundCloudPlayer` still uses deprecated `frameBorder={0}` (line 15) — use `style={{ border: 0 }}` or the CSS approach instead.

**Top recommendation:**
1. Replace `frameBorder={0}` in `SoundCloudPlayer.tsx` line 15 with `style={{ border: 'none' }}` — effort S — priority P2.

---

### `components/artists/ArtistCard.tsx`
**Role:** Portrait photo card linking to artist detail page.
**LOC:** 45
**Client/server:** server

**Accessibility:**
- Link has no explicit `aria-label` — the visible text below (name) serves as the link label, which is correct for named links. However, screen reader users would hear "link, [Artist Name]" which is sufficient.
- The photo's `alt` text is `"{name} photo"` — minimally descriptive. Acceptable.
- The initial letter placeholder (line 29) is `aria-hidden="true"` — correct.

**Design system fidelity:**
- `group-hover:text-(--color-accent-lime)` on name — token correct.
- `group-hover:scale-105` on photo — no token for scale exists (not a concern for transforms).

**Top recommendation:**
1. The `role` text (line 40) uses `text-(--text-label) font-bold` — the `font-bold` weight at `--text-label` (12px) matches other secondary labels; this is consistent. No change needed.

---

### `components/artists/ArtistSocialRow.tsx`
**Role:** Horizontal row of social platform icon links for artist profile pages.
**LOC:** 102
**Client/server:** server

**Code quality:**
- Lines 6–15: The `ICONS` record in this file duplicates the `ICON_PATHS` record in `components/ui/SocialIcon.tsx`. Instagram, SoundCloud, Beatport, and YouTube SVG paths are copy-pasted verbatim. This is a direct duplication — any path update must happen in two files.
- `RaIcon` (line 46) and `LayloIcon` (line 53) use `<img>` with `style={{ filter: 'invert(1)' ... }}` and `mixBlendMode: 'screen'` — these are clever workarounds for third-party logos that don't have SVG sources in the codebase. The technique is fragile (breaks on non-dark backgrounds), but since this component only renders on dark-background artist pages, it is acceptable. Document this constraint.
- `CustomIconLink` and `IconLink` are internal helper components that only exist to avoid repetition of the `<a>` structure — correct pattern.

**Accessibility:**
- `aria-label={label}` on all links — correct.
- `alt="RA"` and `alt="Laylo"` on the custom icon images — these are inside links with `aria-label`, so the `alt` is redundant but not harmful.

**Top recommendations:**
1. Extract shared icon SVG paths into a single file (e.g., `lib/icon-paths.ts`) and import from both `SocialIcon.tsx` and `ArtistSocialRow.tsx` — eliminates duplication of 4 paths — effort S — priority P1
2. Add a comment documenting that `RaIcon` and `LayloIcon` depend on a dark background context and will break on `.on-light-bg` pages — effort S — priority P2

---

### `components/podcasts/PodcastAccordion.tsx`
**Role:** Episode selection UI with SC embed on the left, episode list on the right.
**LOC:** 120
**Client/server:** client

**Code quality:**
- Line 72: `${activeSlug === ep.slug ? 'opacity-100' : 'opacity-100'}` — both branches of the ternary return the same value (`opacity-100`). This is dead conditional code. A prior design likely had the inactive opacity set to something lower. Remove the ternary and use `opacity-100` always.
- `defaultUrl` initialization (line 27) tries `playlistEmbedUrl` then falls back to first episode's `embedUrl`. If neither is set, `activeUrl` is null and the player card (`{activeUrl && ...}`) renders nothing. No empty-state UI is provided in this case — users see a raw episode list with no player.
- The playlist-only mode redirect to `<PodcastPlayer>` (line 40–42) is a branching rendering path that's easy to miss. Add a comment.

**Accessibility:**
- Episode rows are `<button>` elements with `onClick` — correct for interactive list items.
- `disabled={!ep.embedUrl}` on the button correctly prevents interaction when no embed exists.
- No `aria-label` on episode buttons — they contain visible text children (title + artist), which is sufficient for AT.
- The SoundCloud iframe (inside `SoundCloudEmbed`) will have its own `title="SoundCloud player"` — correct.

**Performance:**
- Episode buttons all render simultaneously — for a typical podcast with ~50+ episodes, this is manageable but not paginated.

**Design system fidelity:**
- `border border-black/20` (line 50) — uses black at opacity instead of `--color-text-primary` at opacity. On a dark theme, `--color-text-primary` is white, so `white/20` would be more appropriate (matches the rest of the component's `border-white/10` pattern). Inconsistency.

**Top recommendations:**
1. Fix the dead ternary at line 72: `${activeSlug === ep.slug ? 'opacity-100' : 'opacity-100'}` — remove the conditional entirely — effort S — priority P1
2. Add an empty state when `activeUrl === null` and `episodes.length === 0` — effort S — priority P1
3. Replace `border-black/20` (line 50) with `border-white/20` for dark theme consistency — effort S — priority P2

---

### `components/podcasts/PodcastPlayer.tsx`
**Role:** Full-featured sticky podcast player with artwork, seekbar, controls, and track list.
**LOC:** 198
**Client/server:** client

**Code quality:**
- `loadPlaylist` is called in `useEffect` with `[playlistEmbedUrl, playlistUrl, loadPlaylist]` as dependencies (line 37). `loadPlaylist` is a stable bound method from `playerStore` — it never changes, so this dependency is harmless but adds noise. The `loadPlaylist` call in `useEffect` will re-run any time `playlistEmbedUrl` changes — intentional and correct.
- Lines 154–158: `tracks.map((track, i) => ...)` uses the array index `i` as the key (line 155). Track index is stable for a given playlist load, but would produce React reconciliation issues if tracks were inserted or reordered. Prefer `track.id` or `track.permalink_url` as a key.
- `formatTime` and `formatDuration` are local utility functions. They would be useful in `MiniPlayer` as well (which displays no duration info, but could). Extract to `lib/format.ts`.

**Accessibility:**
- The play/pause button on the artwork (line 60–78) has `aria-label={isPlaying ? 'Pause' : 'Play'}` — correct.
- Track rows are `<button>` elements with visible text — correct.
- The seekbar (line 91–102) has no `role="slider"` or keyboard navigation — same issue as in `MiniPlayer`.
- `<Image ... unoptimized>` for SoundCloud artwork — acceptable since SoundCloud CDN domains are not configured in `next.config`.

**Performance:**
- `Image` with `fill` and `unoptimized` on the artwork — correct workaround given external CDN.
- Track list renders all tracks without virtualization — for long playlists (100+ episodes), this creates performance issues. No immediate fix needed at current scale, but flag.

**Design system fidelity:**
- `style={{ backgroundColor: 'var(--color-accent-lime)' }}` (line 100) — token correct.
- `bg-white/5`, `border-white/20`, `bg-white/10` — consistent semi-transparent patterns throughout.

**Top recommendations:**
1. Add `role="slider"` with `aria-valuenow/min/max` and keyboard handler to the seekbar (line 91) — same fix as MiniPlayer — effort S — priority P0
2. Replace array index key (line 155) with `track.permalink_url` or another stable track identifier — effort S — priority P1
3. Extract `formatTime` and `formatDuration` to `lib/format.ts` for reuse — effort S — priority P2

---

### `components/podcasts/PodcastRow.tsx`
**Role:** Single collapsible accordion row for a podcast episode with SC embed inside.
**LOC:** 110
**Client/server:** client

Clean pattern. `aria-expanded`, `aria-controls`, `aria-labelledby` — all correctly paired. The `max-h-[700px]` CSS transition approach (line 74) for the disclosure works but creates a stepped animation (height snaps at 700px maximum). If an episode embed + description exceeds 700px, content is clipped. Consider `max-h-[9999px]` or JS-measured height for a smoother transition.

**Design system fidelity:**
- `border-l-4 border-(--color-accent-violet)` active indicator — token correct.
- `bg-(--color-surface)` expanded panel — token correct.
- Uses `--space-*` tokens throughout via Tailwind value syntax — token correct.

**Top recommendation:**
1. Increase `max-h-[700px]` to `max-h-[1200px]` to prevent content clipping for long episodes with descriptions — effort S — priority P1.

---

### `components/press/PressEntry.tsx`
**Role:** Individual press clipping card with type badge, headline link, publication, and excerpt.
**LOC:** 82
**Client/server:** server

Clean. URL safety check (lines 22–25) validates protocol — correct. `text-(--text-body) font-bold` for headline — token correct. `line-clamp-2` on excerpt — correct truncation.

**Accessibility:**
- `aria-label=\`Read ${entry.headline} at ${entry.publication} (opens in new tab)\`` on the headline link — verbose but informative. The `(opens in new tab)` disclosure is correct per WCAG best practice.
- Two links to the same URL per entry (headline link + "Read article ↗") with different labels — this is valid but creates duplicate targets. Consider making the "Read article" link `aria-hidden="true"` since the headline link provides the same action.

**Top recommendation:**
1. Add `aria-hidden="true"` to the "Read article ↗" link (line 71) since it duplicates the headline link target — reduces redundant AT announcements — effort S — priority P2.

---

### `components/showcases/ShowcaseCard.tsx`
**Role:** Event card for upcoming/past showcases with flyer, venue, ticket/listen CTAs.
**LOC:** 121
**Client/server:** server

**Code quality:**
- `safeHref` (lines 3–7) is a module-level function that validates URLs — the exact same function exists in `PressEntry.tsx` as an inline expression (lines 22–25). Extract to `lib/urls.ts` as `safeExternalUrl(url)`.
- Lines 32–34: past showcase cards have `opacity: 0.45` and `filter: grayscale(0.5)` applied via inline style. This is a strong visual de-emphasis but reduces the contrast ratio of text inside below WCAG AA thresholds. Text at 45% opacity over a dark surface can fall below 3:1 contrast. Consider removing the opacity and relying only on the greyscale filter, or reducing opacity to 0.7.
- Lines 99 and 103: Two separate `<a>` links for "LISTEN" and "WATCH AFTERMOVIE" both have `inline-block mt-(--space-md)` but no visual separation from each other — they may appear concatenated without spacing when both are present. Wrap in a `flex gap-4` container.

**Accessibility:**
- `<article>` wrapper — correct semantic element for a self-contained showcase entry.
- Ticket button has `aria-label=\`Get tickets for ${entry.title}\`` — correct.
- Past showcase opacity/greyscale treatment (line 33) has no `aria-label` or `aria-describedby` indicating the event is past — screen reader users don't get this context. Consider adding `aria-label="Past event"` or visually-hidden text.

**Design system fidelity:**
- `borderColor: 'rgba(158,255,10,0.3)'` (line 31) — `158,255,10` is the RGB of `#9EFF0A` (accent-lime). Use `var(--color-accent-lime)` with opacity via CSS: `border-color: color-mix(in srgb, var(--color-accent-lime) 30%, transparent)` — or simply use the Tailwind `border-(--color-accent-lime)/30` pattern.
- `bg-(--color-accent-violet)` for ticket button — token correct.
- `text-(--color-accent-lime)` for "VIEW GALLERY" — token correct.

**Top recommendations:**
1. Extract `safeHref` into `lib/urls.ts` — it is duplicated in `PressEntry.tsx` and `ShowcaseCard.tsx` — effort S — priority P1
2. Reduce past card `opacity` from 0.45 to 0.7 to maintain WCAG AA text contrast — effort S — priority P0
3. Replace `rgba(158,255,10,0.3)` borderColor with `border-(--color-accent-lime)/30` Tailwind syntax — effort S — priority P2

---

### `components/showcases/AfterMovieEmbed.tsx`
**Role:** YouTube iframe embed with URL parsing to extract video ID.
**LOC:** 34
**Client/server:** client

**Code quality:**
- `youtubeEmbedUrl` (lines 3–17) handles both `youtu.be` short URLs and `youtube.com` standard URLs including embedded paths. The `u.pathname.split('/').pop()` fallback (line 12) would catch `/embed/VIDEO_ID` paths — useful.
- Returns `null` if URL parsing fails — correct graceful degradation.

**Accessibility:**
- `title=\`${title} aftermovie\`` on iframe — correct for AT.
- No `aria-label` on the outer div — not needed since `<iframe>` title suffices.
- No loading state / skeleton — if the video takes time to load, users see a blank iframe. `ShowcaseAfterMovie` wraps this with `animate-pulse` skeleton via `loading:` prop — correct.

**Top recommendation:**
1. Add `loading="lazy"` to the iframe to defer load until it enters the viewport — effort S — priority P1.

---

### `components/showcases/ShowcaseAfterMovie.tsx`
**Role:** Dynamic import wrapper for AfterMovieEmbed with SSR off and pulse skeleton.
**LOC:** 14
**Client/server:** client

Clean wrapper pattern. `ssr: false` is necessary since `AfterMovieEmbed` creates a `<URL>` object (browser API). Pulse skeleton — correct loading UX.

---

### `components/showcases/RecordingsList.tsx`
**Role:** Ordered list of SoundCloud embeds for showcase set recordings.
**LOC:** 42
**Client/server:** client (imports `SoundCloudEmbed` which is client-side dynamic)

Clean. Heading `text-(--text-heading)` — token correct. Uses `--space-*` tokens. No issues beyond the `key={rec.id}` which uses a DB-assigned numeric ID — correct and stable.

---

### `components/showcases/ShowcaseMerchSection.tsx`
**Role:** Thin wrapper adding a "Merch" heading above `MerchGrid` for showcase detail pages.
**LOC:** 19
**Client/server:** server

Appropriately thin. Heading `text-(--text-heading)` — token correct. `mb-(--space-2xl)` spacing — token correct.

---

### `components/showcases/ShowcaseLinksList.tsx`
**Role:** External links section for showcase detail pages.
**LOC:** 34
**Client/server:** server

**Code quality:**
- `key={i}` (line 21) uses array index. If `links` items are ever reordered, React will reconcile incorrectly. Use `link.url` or `link.label` as key (they are structurally unique per showcase).
- Does not validate `link.url` protocol — any string (including `javascript:`) will be passed directly to `href`. Add a safe URL guard similar to `ShowcaseCard.safeHref`.

**Top recommendations:**
1. Validate `link.url` to require `https://` or `http://` protocol — effort S — priority P0
2. Replace `key={i}` with `key={link.url}` — effort S — priority P2

---

### `components/merch/CartButton.tsx`
**Role:** Nav cart icon with count badge, opens the CartDrawer.
**LOC:** 44
**Client/server:** client

**Code quality:**
- Line 17: `text-[#444]` is the same unexplained hardcoded hex as in `SiteNav.tsx` line 74. This should use a design token.
- Badge count `{count}` (line 37) has no upper bound display — a count of 99+ should render as "99+" to avoid badge overflow at high quantities.
- Badge uses `bg-[#9EFF0A]` (line 37) instead of `bg-(--color-accent-lime)` — token inconsistency.

**Accessibility:**
- `aria-label` is dynamic: `"Open cart, ${count} items"` when count > 0 — correct live update for AT.
- Badge is `aria-hidden="true"` since the count is in the button's `aria-label` — correct.

**Design system fidelity:**
- `bg-[#9EFF0A]` on badge — should be `bg-(--color-accent-lime)`.
- `text-[#444]` on icon — should be a token.

**Top recommendations:**
1. Replace `text-[#444]` with `text-(--color-text-secondary)` or introduce a token — same fix needed in SiteNav — effort S — priority P1
2. Replace `bg-[#9EFF0A]` with `bg-(--color-accent-lime)` — effort S — priority P1
3. Cap badge display: `count > 99 ? '99+' : count` — effort S — priority P2

---

### `components/merch/CartDrawer.tsx`
**Role:** Slide-in side drawer with cart line items, quantity controls, subtotal, and Shopify checkout link.
**LOC:** 189
**Client/server:** client

**Code quality:**
- CSS variable override via inline `style` on the `<aside>` (lines 46–49) correctly switches to light-mode text colors inside the drawer without requiring a separate CSS class. This matches the `.on-light-bg` approach. However, it doesn't set `--color-surface`, `--color-button`, or `--color-bg`, which means any child component using those tokens would render with dark-theme values inside the white drawer. Extend the inline overrides to include `--color-button: '#1F1F21'` and `--color-bg: '#FFFFFF'`.
- `aria-hidden={!isOpen}` on the `<aside>` (line 42) hides it from AT when closed — correct. However, when `isOpen` toggles to `true`, focus is not moved into the drawer. Add a `useEffect` that focuses the close button or the first interactive element when `isOpen === true`.
- Scroll lock (line 18): `document.body.style.overflow = 'hidden'` — same pattern as MobileMenu. No padding compensation for scrollbar width.

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-label="Shopping cart"` — correct.
- Close button `aria-label="Close cart"` — correct.
- Remove item button `aria-label="Remove item"` — generic; should include product name: `aria-label=\`Remove ${line.merchandise.product.title}\`` — effort S.
- Quantity `−` and `+` buttons have `aria-label="Decrease quantity"` / `aria-label="Increase quantity"` — acceptable; could be improved with product name context.
- The checkout `<a>` (line 175) is a plain anchor not a button. When the drawer is open, Tab will move through all elements including this. Pressing Enter on it will navigate — correct behavior for a link.

**Performance:**
- `Image` with `fill` and `sizes="80px"` — correct.
- `unoptimized` on merchandise images — same CDN domain issue as PodcastPlayer.

**Design system fidelity:**
- Extensive use of hardcoded `#1F1F21` and `#580AFF` (lines 59, 77, 122, 177) — these match tokens `--color-bg` and `--color-accent-violet` but are not using the token syntax. Within the light drawer context where CSS variable overrides are applied, using `text-(--color-bg)` would resolve to the overridden dark value — which is intentional. But the hardcoded hex bypasses this system and creates coupling to the specific color values.
- Line 36: `bg-[#1F1F21]/40` — should be `bg-(--color-bg)/40`.

**Top recommendations:**
1. Move focus into the drawer on open — focus the close button using `useRef` and `useEffect` — effort S — priority P0
2. Add product name to remove item `aria-label`: `\`Remove ${line.merchandise.product.title} from cart\`` — effort S — priority P1
3. Replace `bg-[#1F1F21]/40` (line 36) and `text-[#580AFF]` (lines 59, 77, 122) with token-based classes — effort S — priority P1

---

### `components/merch/MerchGrid.tsx`
**Role:** Responsive product grid with empty state and hover animation.
**LOC:** 60
**Client/server:** server

Clean. Empty state message present ("Merch store coming soon.") — good UX. `group-hover:scale-[1.04]` scale animation — smooth. `sizes` prop on image is appropriate.

**Accessibility:**
- Product links have no explicit `aria-label` — the visible title text below serves as the link label. This is correct, but the price text is inside the link and will be read by AT after the title — acceptable.
- Grid container is a `<div>` not a `<ul>/<li>` — the grid items are links, and there's no semantic list role. Consider wrapping in `<ul>` with `<li>` items for consistency with `ReleaseGrid`.

**Top recommendation:**
1. Wrap product grid items in `<ul>/<li>` for semantic consistency with `ReleaseGrid.tsx` — effort S — priority P2.

---

### `components/merch/ProductDetail.tsx`
**Role:** Full product detail page component with gallery, variant selector, quantity picker, add-to-cart, and description.
**LOC:** 272
**Client/server:** client

**Code quality:**
- Lines 39–41: `hasRealOptions` filters out the Shopify default "Default Title" single-option variant. This is a known Shopify pattern, handled correctly.
- Lines 131–152: The sale price display wraps everything in an IIFE `{(() => { ... })()}` — the same anti-pattern as in `ReleaseCard`. Extract to a variable or a `<SalePrice>` sub-component.
- Lines 165–198: Option selection renders `findVariant(product.variants, trial)` for each option value on every render — with N options × M values, this is O(N×M×variants.length) per render. For a product with 3 options × 10 values × 50 variants, that's 1,500 traversals per render. Memoize `findVariant` results with `useMemo` keyed on `product.variants` and `selection`.
- `dangerouslySetInnerHTML` (line 242) renders Shopify-provided HTML — XSS risk is mitigated by the fact that this content comes from Shopify's admin, which sanitizes input, but the pattern should be documented.

**Accessibility:**
- `<h1>` for product title (line 123) — correct.
- Variant buttons have no `aria-pressed` or `aria-selected` indicating selected state — only visual border change. Add `aria-pressed={selected}` to variant buttons (line 180).
- The quantity stepper buttons have no `aria-controls` linking to the quantity display — acceptable for simple steppers.
- Add-to-cart button text changes based on state (`"Unavailable"`, `"Sold Out"`, `"Adding…"`, `"Add to Cart"`) — correct and communicative.
- `<img>` thumbnail buttons (lines 81–99) have `aria-label=\`View image ${i + 1}\`` — minimally descriptive. Could use `img.altText` if available.

**Performance:**
- `useMemo` used for `initialSelection` (line 30) and `variant` (line 37) — correct.
- `findVariant` called in every option render (lines 176) without memoization — see code quality note above.

**Design system fidelity:**
- Lines 117, 145, 154, 177, 227: Mix of `bg-[#580AFF]`, `text-[#580AFF]`, `bg-[#9EFF0A]` (hardcoded hex) and `bg-(--color-accent-violet)` (token). These should all use tokens: `bg-(--color-accent-violet)` for `#580AFF`, `bg-(--color-accent-lime)` for `#9EFF0A`.
- Line 86: `bg-white/40` for the gallery container — this is a light overlay; since this page uses the dark theme, a different token approach may be needed. Review in context.

**Microcopy / UX:**
- "Only X left" urgency message (line 153) appears in `text-[#580AFF]` (violet) — a neutral or warning color would be more appropriate (e.g., `text-(--color-destructive)` or `text-(--color-accent-lime)`).
- The add-to-cart button covers the "Unavailable" state when there is no matching variant — users selecting an unavailable combination see "Unavailable" with no explanation. Add a small message: "This combination is not available."

**Top recommendations:**
1. Add `aria-pressed={selected}` to variant selector buttons (line 180) — effort S — priority P0
2. Replace all hardcoded `#580AFF` and `#9EFF0A` hex literals (lines 117, 145, 154, 227) with `var(--color-accent-violet)` and `var(--color-accent-lime)` — effort S — priority P1
3. Memoize the per-option `findVariant` calls using `useMemo` — effort M — priority P1 (prevents unnecessary computation on every state update in a complex product)

---

### `components/merch/ShopifyBuyButton.tsx`
**Role:** Injects Shopify Buy Button embed code (divs + scripts) into the DOM.
**LOC:** 44
**Client/server:** client

Clean implementation of the standard pattern for executing third-party embed scripts. Cleanup on unmount removes both container content and injected scripts. No issues with the approach, though Shopify Buy Buttons are largely superseded by the native Storefront API integration used by `ProductDetail` — this component may be dead code if it is not currently referenced in any page.
<br>

**Top recommendation:**
1. Verify whether `ShopifyBuyButton` is referenced from any current page — if not, mark for removal — effort S — priority P2.

---

### `components/demos/DemoForm.tsx`
**Role:** Demo submission form with honeypot spam protection, posting to `/api/demo`.
**LOC:** 207
**Client/server:** client

**Code quality:**
- Labels are not associated to inputs via `htmlFor`/`id` (lines 128, 145, 162, 178). The `<label>` wraps the input in some cases (via visual proximity) but does not use the `for` attribute. AT users will not get label association for these inputs.
- The honeypot field (line 113–122) uses `aria-hidden="true"` and `tabIndex={-1}` — correct implementation.
- `fields[f.name as keyof typeof fields]` (line 135) uses a type cast for dynamic field access — acceptable but fragile. A type-safe approach would use a field name union type.

**Accessibility:**
- The success state container (lines 78–88) has no focus management — after form submission, focus remains on the (now unmounted) submit button. Move focus to the success message container using a `useRef`.
- `noValidate` (line 112) disables browser validation, relying on server-side errors — but client-side errors are only shown via the generic `errorMsg` (line 189). Individual field errors are not surfaced. Required fields have `required` attribute set but `noValidate` suppresses the browser's built-in popups. The combination is confusing — either remove `noValidate` and rely on browser validation, or implement per-field validation state.
- `text-red-400` (line 189) — not a design system token. Use `text-(--color-destructive)` which is `#ef6b8e` (close to red-400 visually).

**Design system fidelity:**
- `bg-white/8` (lines 79, 92) — this is a Tailwind v4 fractional opacity shorthand. While functional, `0.08` is not one of the integer steps in standard Tailwind v3. Verify this works as expected in Tailwind v4 (it does, but document).
- `text-2xl` (line 101) — raw Tailwind unit instead of `--text-heading` or `--text-display` token class.

**Top recommendations:**
1. Add `htmlFor` and `id` to all form labels and inputs — critical for AT label association — effort S — priority P0
2. Move focus to the success message on form submission success (using `useRef` + `useEffect`) — effort S — priority P1
3. Replace `text-red-400` (line 189) with `text-(--color-destructive)` — effort S — priority P2

---

### `components/subscribe/SubscribePanel.tsx`
**Role:** Centered email subscribe panel with Laylo CTA fallback.
**LOC:** 99
**Client/server:** client

**Code quality:**
- Lines 17–28 are nearly identical to `NewsletterForm.tsx` lines 10–25. Both components:
  - Validate email with `!email.includes('@')`
  - Post to `/api/subscribe` with `{ email, listId }`
  - Swallow errors with `setState('ok')` in the catch
  - Have the same state machine (`idle/loading/ok/error`)
  
  This is the highest duplication in the codebase. Both could share a `useNewsletter(listId)` hook that returns `{ email, setEmail, state, handleSubmit }`.

**Accessibility:**
- Email input lacks explicit `<label>` — same issue as `NewsletterForm.tsx`.
- Error message `text-red-400` (line 71) — use `text-(--color-destructive)`.
- Form's submit button shows `…` for loading — needs `aria-busy="true"` or `aria-label` change.

**Design system fidelity:**
- `from-[#580AFF] to-[#9B30FF]` gradient on Laylo button (line 89) — same hardcoded gradient as in `LayloButton.tsx`. This is duplicated in two components.
- `text-red-400` (line 71) — not a token.

**Top recommendations:**
1. Extract newsletter subscription logic to `hooks/useNewsletter.ts` and use it in both `NewsletterForm.tsx` and `SubscribePanel.tsx` — eliminates ~25 lines of duplicated code — effort S — priority P1
2. Add `<label>` elements to the email input — effort S — priority P0
3. Replace the hardcoded Laylo gradient with a shared CSS custom property or use the existing `LayloButton` component — effort S — priority P2

---

### `components/about/AboutBody.tsx`
**Role:** Renders Keystatic rich-text document nodes as HTML prose.
**LOC:** 11
**Client/server:** server

Minimal wrapper. `style={{ color: 'inherit' }}` correctly propagates the surrounding text color. `prose max-w-none` from Tailwind typography plugin — correct.

**Top recommendation:**
1. Verify `prose-invert` or `on-light-bg .prose-invert` rules (globals.css lines 89–105) are applied by the page that wraps this component, since `AboutBody` itself cannot know its background context — effort S — priority P1 (documentation/architectural note).

---

### `components/downloads/DownloadGate.tsx`
**Role:** Grid of free download cards with cover image, description, and download link.
**LOC:** 73
**Client/server:** server (no `'use client'` directive, though declared in a client-side render context)

**Code quality:**
- `DownloadCard` is a local sub-component defined inside the same file — this is acceptable for a private component only used once. However, it could be exported if other pages need individual download cards in the future.
- The download link label is "Download / Listen" (line 49) — a dual-purpose label that is confusing. If the link goes to a SoundCloud or Dropbox page, "Download / Listen" is acceptable, but if it goes directly to a file, "Download" would be clearer. The label needs alignment with the actual destination.

**Accessibility:**
- The `<a>` download link has no `aria-label` — the visible text "Download / Listen" is the accessible name. Acceptable but generic — could include the track title: `aria-label=\`Download ${item.title}\``.
- The download SVG icon is `aria-hidden="true"` — correct.

**Performance:**
- `sizes="(max-width: 768px) 50vw, 25vw"` — correct for the 2→4 column grid.

**Top recommendation:**
1. Add `aria-label=\`Download ${item.title}\`` to the download link — effort S — priority P2.

---

### `components/services/ServicesContent.tsx`
**Role:** Service selector card grid that reveals `ContactForm` on selection.
**LOC:** 49
**Client/server:** client

**Code quality:**
- Service selection buttons (lines 15–35) have no `aria-pressed` or `aria-selected` to communicate the selected state to AT users — only visual highlighting changes.
- `border-black/20 bg-black/6` for the selected state (line 20) — uses `black` at opacity. In the dark theme context this component lives in, `black/20` over a `bg-white/8` parent makes the selected state very subtle. Should use `border-white/40 bg-white/12` for better visibility in dark context. But wait — `ServicesContent` appears to be rendered in a dark-bg context based on the container border `border border-white/20`. Yet the selected card uses `border-black/20` — the contrast may be insufficient. Verify in context.

**Accessibility:**
- Service selector buttons should have `aria-pressed={service === s.id}` — effort S.
- When a service is selected and `ContactForm` renders, no focus is moved to the form — users must Tab past all service buttons to reach the form.

**Top recommendations:**
1. Add `aria-pressed={service === s.id}` to service selector buttons — effort S — priority P0
2. Move focus to the `ContactForm` when a service is selected — effort S — priority P1
3. Replace `border-black/20 bg-black/6` selected state with `border-white/40 bg-white/12` for dark-theme consistency — effort S — priority P1

---

### `components/services/ContactForm.tsx`
**Role:** Service inquiry form posting to `/api/contact`.
**LOC:** 96
**Client/server:** client

**Code quality:**
- Labels at lines 62, 72 lack `htmlFor` attributes and corresponding `id` on inputs — same issue as `DemoForm`.
- Validation on line 30: `!email.includes('@') || !message.trim()` causes silent failure (form just does not submit, no error shown). If the user clicks Send with an empty message, nothing happens — no feedback. Add validation error state.

**Accessibility:**
- Success state (lines 48–55) has no focus management.
- `text-red-400` error color (line 92) — not a token.

**Top recommendations:**
1. Add `htmlFor`/`id` to all label/input pairs — effort S — priority P0
2. Show explicit validation error when submit is blocked by empty message — effort S — priority P1

---

## 3. Cross-Component Issues

### CX-1: Hardcoded hex colors instead of design tokens (9 components)

The following components use hardcoded hex values for colors that have exact token equivalents:

| Component | Line(s) | Hardcoded | Token to use |
|---|---|---|---|
| SiteNav | 74 | `text-[#444]` | `text-(--color-text-secondary)` |
| CartButton | 17, 37 | `text-[#444]`, `bg-[#9EFF0A]` | `text-(--color-text-secondary)`, `bg-(--color-accent-lime)` |
| MiniPlayer | 54, 156 | `'#9EFF0A'` | `var(--color-accent-lime)` |
| LayloButton | 53 | `from-[#580AFF]` | `from-(--color-accent-violet)` |
| SubscribePanel | 89 | `from-[#580AFF] to-[#9B30FF]` | gradient tokens needed |
| ProductDetail | 117, 145, 154, 227 | `#580AFF`, `#9EFF0A` | `var(--color-accent-violet)`, `var(--color-accent-lime)` |
| CartDrawer | 36, 59, 77, 122 | `#1F1F21`, `#580AFF` | token equivalents |
| SplashScreen | 52 | `#1F1F21` | `var(--color-bg)` |
| globals.css | 163 | `#580AFF` in `.prose-product a` | `var(--color-accent-violet)` |

### CX-2: Missing label/input association in all three forms

`DemoForm`, `ContactForm`, and `NewsletterForm` all render `<label>` elements without `htmlFor` attributes or `<input>` elements without matching `id` attributes. This means clicking a label does not focus the associated input, and AT users do not get label-to-field association. This pattern must be fixed across all three forms simultaneously.

### CX-3: Seekbar keyboard inaccessibility (2 components)

Both `MiniPlayer` (line 144) and `PodcastPlayer` (line 91) render seekable progress bars as plain `<div onClick>` elements. Neither has `role="slider"`, keyboard event handlers, or ARIA value attributes. Both should be fixed with the same pattern simultaneously.

### CX-4: Focus management missing from modal/overlay interactions (4 components)

`CartDrawer`, `MobileMenu`, `ServicesContent`, and `DemoForm` all open/reveal interactive content but do not move focus to the new content. The pattern is: detect open/visible state change in `useEffect`, then call `.focus()` on a ref to the first interactive element.

### CX-5: Duplicated newsletter subscription logic (2 components)

`NewsletterForm.tsx` (lines 10–25) and `SubscribePanel.tsx` (lines 16–28) share identical state machines and API call logic with a subtle difference: both silently succeed on error. Extract to `hooks/useNewsletter.ts`.

### CX-6: Duplicated SVG icon paths (2 files)

`ArtistSocialRow.tsx` (lines 6–15) duplicates SVG paths for Instagram, SoundCloud, Beatport, and YouTube that already exist in `SocialIcon.tsx` (lines 13–28). Extract to `lib/icon-paths.ts`.

### CX-7: Duplicated `safeHref` URL validation (2 components)

`PressEntry.tsx` (lines 22–25) and `ShowcaseCard.tsx` (lines 3–7) both define inline URL validation logic for `https://` or `http://`. Extract to `lib/urls.ts` as `safeExternalUrl(url: string | null | undefined): string | null`.

### CX-8: Duplicated artwork URL transform

`.replace('3000x3000bb', '600x600bb')` appears in `ReleaseCard.tsx` (line 33) and `SiteFooter.tsx` (line 27). A different regex for the same purpose appears in `PodcastPlayer.tsx` (line 41: `.replace(/-large(?=\.|$)|-t\d+x\d+(?=\.|$)/, '-t500x500')`). Create `lib/artwork.ts` with two exported functions: `resizeSoundCloudArtwork(url, size)` for the SoundCloud CDN resize param, and `resizeSCWidget(url, size)` for the widget API format.

### CX-9: `role="marquee"` invalid ARIA role

`AnnouncementBar.tsx` line 62 uses `role="marquee"` which is not a valid ARIA 1.1 role. This will generate accessibility audit warnings.

### CX-10: `frameBorder` deprecated HTML attribute

`SoundCloudPlayer.tsx` line 15 uses `frameBorder={0}`, a deprecated HTML4 attribute. Replace with `style={{ border: 'none' }}`.

---

## 4. Refactor Priority List

| # | Change | Components affected | Effort | Priority |
|---|---|---|---|---|
| 1 | **Add `htmlFor`/`id` to all form labels/inputs** — `DemoForm`, `ContactForm`, `NewsletterForm` all missing label-input association | 3 | S | P0 |
| 2 | **Make seekbars keyboard-operable** — `MiniPlayer` and `PodcastPlayer` seekbars need `role="slider"`, `aria-valuenow/min/max`, and `onKeyDown` handlers | 2 | S | P0 |
| 3 | **Implement focus management on open/reveal** — `CartDrawer` (focus close button on open), `MobileMenu` (focus first link on open), `ServicesContent` (focus ContactForm on service select), `DemoForm` (focus success message on submit) | 4 | S | P0 |
| 4 | **Add skip-to-content link** — single change in `SiteNav.tsx` as first child of `<header>` | 1 | S | P0 |
| 5 | **Fix `role="marquee"` invalid ARIA role** in `AnnouncementBar.tsx` | 1 | S | P0 |
| 6 | **Replace all hardcoded hex colors with design tokens** — `#580AFF`→`var(--color-accent-violet)`, `#9EFF0A`→`var(--color-accent-lime)`, `#1F1F21`→`var(--color-bg)` across 8 components | 8 | S | P1 |
| 7 | **Extract newsletter hook** — `useNewsletter.ts` shared by `NewsletterForm` and `SubscribePanel`; fix silent error-swallowing in both | 2 | S | P1 |
| 8 | **Extract shared utility functions** — `lib/artwork.ts` (SC URL transforms), `lib/urls.ts` (safeExternalUrl), `lib/icon-paths.ts` (SVG paths), `lib/format.ts` (formatTime/formatDuration) | 6 | S | P1 |
| 9 | **Reduce VU meter re-render cost** in `MiniPlayer` — replace `setInterval` + React state with CSS animation controlled by a `data-playing` attribute; eliminates 60ms state updates | 1 | M | P1 |
| 10 | **Add `aria-pressed` to interactive toggle buttons** — `ServicesContent` service selector buttons, `ProductDetail` variant selector buttons, all missing `aria-pressed={selected}` | 2 | S | P0 |

---

*Total components audited: 49*
*Lines of code reviewed: 3,671 (component files) + globals.css + lib/cart-context.tsx + lib/player-context.tsx*
