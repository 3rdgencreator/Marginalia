---
phase: 05-secondary-content-pages
plan: "04"
subsystem: ui
tags: [next.js, react, accordion, soundcloud, podcast, aria, tailwind]

# Dependency graph
requires:
  - phase: 05-01
    provides: Container layout component and shared CSS tokens used throughout page
  - phase: 03-releases
    provides: SoundCloudEmbed, EmbedSkeleton, and buildSoundCloudEmbedUrl from lib/releases.ts

provides:
  - /podcasts server page with newest-first episode list and SoundCloud embed URL pre-build
  - PodcastAccordion client component with single-open useState toggle
  - PodcastRow client component with ARIA accordion, CSS max-height transition, and conditional SoundCloudEmbed mount

affects:
  - future podcast content additions (use Keystatic podcasts collection)
  - any phase adding interactive accordion UI pattern (established pattern here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server/client boundary: buildSoundCloudEmbedUrl called in server component, pre-built string passed as prop to client components"
    - "CSS accordion via max-h-[700px]/max-h-0 with overflow-hidden — no JS height measurement"
    - "Conditional mount: {isOpen && (...)} prevents mounting SoundCloudEmbed for all rows on load"

key-files:
  created:
    - app/podcasts/page.tsx
    - components/podcasts/PodcastAccordion.tsx
    - components/podcasts/PodcastRow.tsx
  modified: []

key-decisions:
  - "buildSoundCloudEmbedUrl called exclusively in server component to respect server-only boundary in lib/releases.ts"
  - "Single-open accordion state held in PodcastAccordion (parent), not PodcastRow — row receives isOpen bool and onToggle callback"
  - "Conditional {isOpen && ...} render avoids mounting SoundCloudEmbed iframes for all collapsed rows"
  - "Image src uses /images/releases/ prefix — podcasts share the releases image directory per Keystatic schema"

patterns-established:
  - "Accordion pattern: useState<string|null> in parent, isOpen/onToggle props to child rows"
  - "Server embed URL pre-build: import 'server-only' modules in page.tsx, pass result as string prop to client components"

requirements-completed:
  - POD-01
  - POD-02

# Metrics
duration: 15min
completed: 2026-04-23
---

# Phase 05 Plan 04: Podcasts Page Summary

**Single-open CSS accordion for /podcasts: server pre-builds SoundCloud embed URLs, PodcastAccordion manages state, PodcastRow renders ARIA-compliant collapsible rows with conditional SoundCloudEmbed mount**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-23T00:00:00Z
- **Completed:** 2026-04-23T00:15:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Server component `/podcasts` page fetches all episodes, sorts newest-first by date, pre-builds SoundCloud embed URLs via `buildSoundCloudEmbedUrl` (respecting `server-only` import boundary)
- `PodcastAccordion` client component with `useState<string | null>` toggle ensuring only one episode is open at a time
- `PodcastRow` client component with full ARIA wiring (`aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`) and CSS `max-h-[700px]` / `max-h-0` accordion — no JS height measurement
- SoundCloudEmbed conditionally mounted only when row is open, preventing unnecessary iframe loads for all collapsed rows

## Task Commits

1. **Task 1: /podcasts server page with embed URL pre-build** - `5878c0f` (feat)
2. **Task 2: PodcastAccordion and PodcastRow client components** - `a587e6c` (feat)

**Plan metadata:** (this commit — docs)

## Files Created/Modified

- `app/podcasts/page.tsx` — Async server component; reads podcasts collection, sorts by date desc, pre-builds embedUrl, renders PodcastAccordion
- `components/podcasts/PodcastAccordion.tsx` — "use client"; useState single-open toggle; role=list wrapper; renders PodcastRow per episode
- `components/podcasts/PodcastRow.tsx` — "use client"; button with aria-expanded/aria-controls; panel with role=region; CSS max-height accordion; conditional SoundCloudEmbed mount

## Decisions Made

- **Server/client boundary for embed URLs:** `buildSoundCloudEmbedUrl` is imported only in `app/podcasts/page.tsx` — `lib/releases.ts` has `import 'server-only'` which would cause a build-time error if imported in any `"use client"` component.
- **Single-open state in parent (PodcastAccordion):** Keeping state in the accordion parent (not each row) makes the single-open constraint trivially correct — only one slug can be active, no row can "override" another.
- **Conditional `{isOpen && ...}` render in PodcastRow:** Prevents all `SoundCloudEmbed` components from mounting simultaneously on page load, which would fire multiple SoundCloud API requests for all episodes.
- **Image directory:** Cover images for podcast episodes use `/images/releases/` (same Keystatic `coverImage` field pattern as releases).

## Deviations from Plan

None — plan executed exactly as written. Both components match the plan's code templates verbatim after verifying that `SoundCloudEmbed`'s prop name is `embedUrl` (confirmed from source).

## Issues Encountered

None. Build passed on first attempt: `npm run build` compiled successfully with TypeScript checks passing and `/podcasts` generated as a static route.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `/podcasts` page is fully functional and ready for real podcast content to be added via Keystatic CMS
- The server/client boundary pattern established here (pre-build embed URLs in server component, pass as string prop) should be reused if any future page adds audio/video embeds
- No blockers for Phase 5 remaining plans

---
*Phase: 05-secondary-content-pages*
*Completed: 2026-04-23*
