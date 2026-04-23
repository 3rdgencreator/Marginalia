---
phase: 05-secondary-content-pages
plan: 02
subsystem: ui
tags: [next.js, keystatic, server-components, tailwind-v4, press, showcases]

# Dependency graph
requires:
  - phase: 05-01
    provides: Keystatic schema additions for press and showcases collections
provides:
  - /press server page with date-sorted press coverage list and type badge pills
  - /showcases server page with UPCOMING/PAST partitioned event grid
  - PressEntry display component with external link safety
  - ShowcaseCard display component with upcoming/past visual variants
affects: [05-03, 05-04, 05-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component collection read + date-descending sort via localeCompare
    - Status-field partition pattern (upcoming vs past by CMS field, not date comparison)
    - Tailwind v4 CSS variable syntax: bg-(--token) not bg-[--token]
    - Past event visual treatment: opacity-60 + filter grayscale(0.4) inline style

key-files:
  created:
    - app/press/page.tsx
    - components/press/PressEntry.tsx
    - app/showcases/page.tsx
    - components/showcases/ShowcaseCard.tsx
  modified: []

key-decisions:
  - "Status field (not date comparison) drives upcoming/past partition — Elif must manually update status in Keystatic after events pass"
  - "Upcoming section omitted entirely via conditional render when upcoming array is empty (D-18)"
  - "Past cards use opacity-60 class + inline grayscale(0.4) filter for dual-mechanism visual distinction"
  - "All external links (ticket URLs, aftermovie URLs, press article URLs) carry target=_blank rel=noopener noreferrer per D-16"

patterns-established:
  - "Status-field partition: filter by entry.status === 'upcoming' / 'past' — never derive from date"
  - "Conditional section guard: {arr.length > 0 && (<section>...</section>)} to omit empty sections"
  - "External link safety: target=_blank always paired with rel=noopener noreferrer + aria-label"

requirements-completed: [PRESS-01, PRESS-02, SHOW-01, SHOW-02, SHOW-03]

# Metrics
duration: 15min
completed: 2026-04-23
---

# Phase 05 Plan 02: Press + Showcases Pages Summary

**Press list page with type badge pills and external link safety, plus showcases page with status-field-based UPCOMING/PAST partitioning and grayscale/opacity treatment for past events**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-23T~17:00Z
- **Completed:** 2026-04-23
- **Tasks:** 2
- **Files modified:** 4 created

## Accomplishments

- `/press` page reads all press entries, sorts date-descending, renders in divided list with type badge pill (5 types mapped to brand color tokens), linked headline with aria-label, publication+date, excerpt, and "Read article" link
- `/showcases` page partitions events by explicit `status` field into UPCOMING (grid, lime-accented date, ticket button) and PAST (grid, opacity-60 + grayscale filter, aftermovie link) sections; UPCOMING section omitted entirely when empty
- `ShowcaseCard` handles flyer image, venue/city/country, date coloring, and conditional action links per variant
- All external links carry `target="_blank" rel="noopener noreferrer"` (T-05-02-01, T-05-02-02 mitigated)

## Task Commits

Each task was committed atomically:

1. **Task 1: Press page + PressEntry component** - `e7660d2` (feat)
2. **Task 2: Showcases page + ShowcaseCard component** - `668e979` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified

- `app/press/page.tsx` - Server component reading press collection, date-sorted, renders PressEntry list
- `components/press/PressEntry.tsx` - Row component with badge, linked headline, publication/date, excerpt, "Read article" link
- `app/showcases/page.tsx` - Server component partitioning showcases by status field into UPCOMING/PAST grids
- `components/showcases/ShowcaseCard.tsx` - Card component with flyer image, upcoming/past visual variants, ticket/aftermovie actions

## Decisions Made

- Status-field (not date comparison) drives the upcoming/past partition — editorial decision in Keystatic CMS
- Tailwind v4 CSS variable syntax `bg-(--token)` used throughout (no legacy `bg-[--token]` syntax)
- Inline `style={{ filter: 'grayscale(0.4)' }}` used alongside `opacity-60` class for past cards (dual visual treatment from UI-SPEC)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing build failure: `app/podcasts/page.tsx` imports `@/components/podcasts/PodcastAccordion` which does not exist — this was already present in commit `af94d36` (the base commit for this plan). Out of scope for 05-02. Logged to deferred items.

TypeScript check passes (exit 0). The missing module only manifests during Turbopack build, not tsc.

## Known Stubs

None — both pages read live data from Keystatic collections. No placeholder data wired to UI.

## Threat Flags

None — no new network endpoints or auth paths introduced. All external URLs originate from trusted CMS editor (Keystatic YAML), not user input. `rel="noopener noreferrer"` applied on all `target="_blank"` links per T-05-02-01 and T-05-02-02.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `/press` and `/showcases` routes now render real content instead of 404
- Ready for 05-03 (about page) and 05-04 (podcasts page with PodcastAccordion component)
- The pre-existing podcasts build failure (missing PodcastAccordion) must be resolved in 05-04 before a clean build can pass

---
*Phase: 05-secondary-content-pages*
*Completed: 2026-04-23*
