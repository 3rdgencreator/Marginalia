---
phase: 5
slug: secondary-content-pages
status: approved
shadcn_initialized: false
preset: none
created: 2026-04-23
---

# Phase 5 — UI Design Contract

> Visual and interaction contract for Phase 5: Secondary Content Pages (homepage, podcasts, press, showcases, about, merch).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (custom Tailwind v4 tokens) |
| Preset | not applicable |
| Component library | none |
| Icon library | none (inline SVG or text labels) |
| Font | Nimbus Sans (self-hosted, 400 + 700) |

---

## Spacing Scale

Declared values from `app/globals.css` — use CSS variable syntax, not arbitrary Tailwind values:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Icon gaps, tight inline spacing |
| `--space-sm` | 8px | Badge/chip padding, compact rows |
| `--space-md` | 16px | Default element spacing, card padding |
| `--space-lg` | 24px | Section padding, accordion expand gap |
| `--space-xl` | 32px | Layout gaps between sections |
| `--space-2xl` | 48px | Major section breaks |
| `--space-3xl` | 64px | Page-level vertical rhythm |

Exceptions: Hero section is full-viewport-height (`100dvh`), no top/bottom padding — video fills the entire viewport.

---

## Typography

All text uses `--font-sans` (Nimbus Sans). Headings and section labels use `uppercase tracking-tight`.

| Role | Token | Size | Weight | Line Height | Transform |
|------|-------|------|--------|-------------|-----------|
| Label / badge | `--text-label` | 12px | 700 | 1.4 | UPPERCASE |
| Body | `--text-body` | 16px | 400 | 1.5 | none |
| Heading | `--text-heading` | 24px → 32px (md) | 700 | 1.2 | UPPERCASE |
| Display | `--text-display` | 48px → 64px (md) | 700 | 1.1 | UPPERCASE |

Section headings ("RELEASES", "ARTISTS", "UPCOMING", "PAST", "PRESS"): `--text-heading`, 700, uppercase, `--color-text-primary`.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#1F1F21` (`--color-bg`) | Page background, hero overlay base |
| Secondary (30%) | `#2A2A2C` (`--color-surface`) | Cards, accordion rows, event cards, nav |
| Accent violet (10%) | `#580AFF` (`--color-accent-violet`) | CTA buttons (ticket links), active accordion indicator, Beatport badge border |
| Accent lime | `#9EFF0A` (`--color-accent-lime`) | Hover state on CTA buttons, "UPCOMING" section label |
| Text primary | `#FFFFFF` (`--color-text-primary`) | Headings, titles, body text |
| Text secondary | `#D2D2DB` (`--color-text-secondary`) | Subtext (publication name, date, role) |
| Text muted | `#CAC9F9` (`--color-text-muted`) | Empty states, placeholder text, past event opacity treatment |
| Destructive | `#ef6b8e` (`--color-destructive`) | Not used in this phase |

Accent reserved for: CTA buttons (ticket links on upcoming showcases), active/open accordion row indicator, Beatport badge border, press type badge backgrounds.

Press type badge colors (one per type, pulled from tag palette):
- Review → `--color-tag-lavender` (#b088d0)
- Interview → `--color-tag-sky` (#a9c2e7)
- Feature → `--color-tag-lime` / accent-lime (#9EFF0A, text: black)
- Chart → `--color-tag-yellow` (#f9c432, text: black)

Past showcase events: `opacity-60` on the card + grayscale filter (`filter: grayscale(0.4)`) — subtle enough to read, distinct from upcoming.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Homepage — no featured releases | *(section omitted entirely — no placeholder shown)* |
| Homepage — no featured artists | *(show all artists — no empty state)* |
| Homepage — Beatport badge | `"HYPE LABEL OF THE MONTH"` + date from Keystatic field |
| Homepage section label — releases | `"RELEASES"` |
| Homepage section label — artists | `"ARTISTS"` |
| Podcasts — collapsed row CTA | *(no CTA — entire row is clickable)* |
| Podcasts — no episodes | `"No episodes yet."` (centered, muted) |
| Press — no entries | `"No press coverage yet."` (centered, muted) |
| Press — external link label | `"Read article ↗"` |
| Showcases — upcoming section heading | `"UPCOMING"` |
| Showcases — past section heading | `"PAST"` |
| Showcases — no upcoming events | *(section omitted entirely)* |
| Showcases — ticket CTA | `"GET TICKETS"` |
| Showcases — aftermovie CTA | `"WATCH AFTERMOVIE ↗"` |
| About — empty body | *(page renders headline only, no broken state)* |
| Merch — no URL configured | `"Merch store coming soon."` (centered, muted) |
| Merch — Shopify framing blocked | `"Visit our store →"` button linking to `siteConfig.merchUrl` directly |

---

## Component Specs

### Hero (Homepage `/`)

- Full viewport height: `h-[100dvh]` relative container
- Two `<iframe>` elements: desktop (16:9, hidden on `<md`) and mobile (9:16, hidden on `≥md`)
  - `className="absolute inset-0 w-full h-full"`, `allow="autoplay"`, `loading="lazy"`
  - Tailwind: `hidden md:block` / `block md:hidden`
- Dark overlay on top of video: `absolute inset-0 bg-black/30` (30% opacity, ensures logo legibility)
- `<Logo>` component centered absolutely: `absolute inset-0 flex items-center justify-center`
  - Logo size: `h-16 md:h-24 w-auto`, `text-(--color-text-primary)`
- No scroll indicator, no CTA button in hero

### Beatport Badge

- Full-width slim banner below hero: `py-(--space-md) px-(--space-lg)` or `py-3`
- `border border-(--color-accent-violet)` or `bg-(--color-surface)` with violet left border (`border-l-4 border-(--color-accent-violet)`)
- Text: uppercase label, `--text-label`, white — `"HYPE LABEL OF THE MONTH"` left, date right (or single centered line)
- Omitted entirely when `homePage.beatportAccolade` is empty

### Featured Releases Grid (Homepage)

- Section heading: `"RELEASES"` — `--text-heading`, uppercase, `mb-(--space-xl)`
- Grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)` — same as `/releases` catalog
- Uses `<ReleaseCard>` (no modifications needed)
- No "Coming soon" filler — section omitted if no featured releases

### Artist Roster Teaser (Homepage)

- Section heading: `"ARTISTS"` — same style as releases heading
- Grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)`
- Uses `<ArtistCard>` (no modifications needed)

### Podcast Accordion (`/podcasts`)

- List container: no outer card — rows separated by `border-b border-(--color-surface)` dividers
- Collapsed row: `flex items-center justify-between py-(--space-md) px-(--space-lg) cursor-pointer`
  - Left: episode title (`--text-body`, bold) + artist name (`--text-label`, muted) stacked
  - Right: date (`--text-label`, muted) + chevron icon (▾ / ▴, text-based or inline SVG, rotates on expand)
  - Active/open row: `border-l-4 border-(--color-accent-violet)` left border indicator
- Expanded state: `flex flex-col md:flex-row gap-(--space-lg) p-(--space-lg)`
  - Left column (md+): square artwork, `w-48 h-48 flex-shrink-0 object-cover`
  - Right column: `<SoundCloudEmbed>` player + description text (`--text-body`)
  - `<EmbedSkeleton>` shown while dynamic component loads
- Accordion: one open at a time (close previous on open new) — Client Component with `useState`
- Transition: CSS `max-height` transition, `duration-200 ease-out`

### Press List (`/press`)

- List container: divided rows, same pattern as podcast accordion (no cards)
- Each row: `flex flex-col sm:flex-row sm:items-center gap-(--space-sm) py-(--space-lg) px-(--space-md) border-b border-(--color-surface)`
  - Headline: `<a>` tag, `--text-body`, bold, `text-(--color-text-primary)`, `hover:text-(--color-accent-lime)`, `target="_blank" rel="noopener noreferrer"`
  - Publication + date: `--text-label`, `--color-text-secondary`, separated by `·`
  - Excerpt: `--text-body`, `--color-text-secondary`, `line-clamp-2`
  - Type badge: pill, `--text-label` uppercase, `px-2 py-1 rounded-full`, background from tag palette (see Color section)
  - "Read article ↗" link: right-aligned on `sm+`, below headline on mobile
- Sorted date descending (server-side)

### Showcases (`/showcases`)

- Section heading "UPCOMING" / "PAST": `--text-heading`, uppercase, `mb-(--space-xl)`
- "UPCOMING" heading: `text-(--color-accent-lime)` (lime accent)
- "PAST" heading: `text-(--color-text-secondary)` (muted)
- Upcoming section omitted if no upcoming events
- Event card: `bg-(--color-surface) p-(--space-lg)` — full-width stacked card (not a square grid)
  - Flyer image: `16:9` aspect ratio at top of card if available, `object-cover`
  - Title: `--text-heading`, bold, `--color-text-primary`
  - Venue + city + country: `--text-label`, `--color-text-secondary`
  - Date: `--text-label`, `--color-accent-lime` (upcoming) / `--color-text-muted` (past)
  - Ticket button (upcoming only): `bg-(--color-accent-violet) text-white px-(--space-lg) py-(--space-sm) uppercase --text-label font-bold hover:bg-(--color-accent-lime) hover:text-black`
  - Aftermovie link (past only): plain text link `--color-text-muted hover:text-(--color-text-primary)`
- Past event cards: `opacity-60` + `filter: grayscale(0.4)`
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)`

### About Page (`/about`)

- Full-width `<Container>` with `max-w-[65ch] mx-auto` prose column (reading width)
- Headline: `--text-display`, uppercase, `--color-text-primary`, `mb-(--space-xl)`
- Optional photo of Elif: `16:9` aspect ratio (or square), `w-full mb-(--space-xl) object-cover`
- Body text: `DocumentRenderer`, inherits `--text-body` / `--leading-normal`
  - Prose classes applied to wrapper: `prose prose-invert` (or equivalent custom styles)
  - Links in body: `text-(--color-accent-lime) hover:underline`
- Empty body: renders headline only, no broken state, no filler text

### Merch Page (`/merch`)

- Full-width `<iframe>` filling `min-h-[80vh]`: `w-full border-0 min-h-[80vh]`
- When `siteConfig.merchUrl` is empty: centered placeholder `"Merch store coming soon."` in `--color-text-muted`
- Fallback "Visit Store →" button (if iframe is blocked by Shopify): same style as ticket button above, links to `siteConfig.merchUrl` directly

---

## Spacing — Page Layout

All pages use `<Container>` wrapper (`max-width: 1280px`, `mx-auto`, horizontal padding `px-(--space-lg) md:px-(--space-2xl)`).

Vertical page padding: `py-(--space-3xl)` top, `py-(--space-3xl)` bottom.

Section gaps (between homepage sections): `mt-(--space-3xl)`.

---

## Interaction States

| Element | Default | Hover | Focus | Active |
|---------|---------|-------|-------|--------|
| ReleaseCard | `bg-(--color-surface)` | overlay fades in (existing pattern) | `ring-2 ring-(--color-accent-violet)` | — |
| ArtistCard | `bg-(--color-surface)` | overlay fades in (existing pattern) | `ring-2 ring-(--color-accent-violet)` | — |
| Podcast row | `bg-transparent` | `bg-(--color-surface)` | `outline-2 outline-(--color-accent-violet)` | `border-l-4 border-(--color-accent-violet)` |
| Press headline link | `--color-text-primary` | `--color-accent-lime` | `underline` | — |
| Ticket button | `bg-(--color-accent-violet)` | `bg-(--color-accent-lime) text-black` | `ring-2 ring-white` | `scale-95` |
| Nav links | existing pattern | existing pattern | existing pattern | — |

---

## Responsive Breakpoints

| Page section | Mobile (<768px) | Desktop (≥768px) |
|---|---|---|
| Hero video | 9:16 vertical video, 100dvh | 16:9 horizontal video, 100dvh |
| Featured releases grid | 2 columns | 4 columns |
| Artist teaser grid | 2 columns | 4 columns |
| Podcast expanded | artwork top, embed below | artwork left, embed right |
| Showcases grid | 1 column | 2–3 columns |
| Press rows | stacked | inline (badge + headline + date on one row) |
| About photo | full width | constrained to prose column |

---

## Accessibility

- Hero iframe: `title="Marginalia hero background video"`, `aria-hidden="true"` (decorative)
- Podcast accordion rows: `<button>` element with `aria-expanded` attribute; panel has `role="region"` and `aria-labelledby`
- Press external links: `aria-label="Read {headline} at {publication} (opens in new tab)"`
- Ticket buttons: `aria-label="Get tickets for {event title}"`
- All `<Image>` components: descriptive `alt` text (not empty for content images)
- Color contrast: all text on `--color-bg` (#1F1F21) meets WCAG AA (white text passes at all sizes)

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| None — no third-party component registries used | — | not required |

All components are custom or reuse existing project components (`ReleaseCard`, `ArtistCard`, `SoundCloudEmbed`, `EmbedSkeleton`, `Container`, `Logo`).

---

## Files This Contract Governs

- `app/page.tsx` — Homepage (hero + badges + grids)
- `app/podcasts/page.tsx` — Podcasts accordion page (Server wrapper)
- `components/podcasts/PodcastAccordion.tsx` — Client Component (accordion state)
- `components/podcasts/PodcastRow.tsx` — Single accordion row
- `app/press/page.tsx` — Press list page
- `components/press/PressEntry.tsx` — Single press row
- `app/showcases/page.tsx` — Showcases page
- `components/showcases/ShowcaseCard.tsx` — Event card
- `app/about/page.tsx` — About editorial page
- `app/merch/page.tsx` — Merch iframe page
- `keystatic.config.ts` — Schema additions (heroVideoUrl, heroVideoMobileUrl, about singleton)

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-04-23
