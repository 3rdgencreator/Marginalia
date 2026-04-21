# Phase 2: Design System & Layout Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-21
**Phase:** 02-design-system-layout-shell
**Areas discussed:** Logo placeholder, Active nav link, Font file sourcing, Social icon SVGs

---

## Logo

| Option | Description | Selected |
|--------|-------------|----------|
| Text wordmark 'MARGINALIA' | Nimbus Sans Bold, all-caps, white | |
| Logo placeholder box | Rectangular outline element | |
| Real SVG (user has it) | Provided before execution | ✓ |

**User's choice:** User has the real logo SVG file and will provide it at the start of execution (next shift). Inline SVG component (Logo.tsx) confirmed.

---

## Active Nav Link

| Option | Description | Selected |
|--------|-------------|----------|
| Thin client wrapper now | NavLinks client component using usePathname | ✓ |
| Skip for Phase 2 | No active indicator, add in Phase 3 | |

**User's choice:** Thin client wrapper now. `NavLinks` is a Client Component; `SiteNav` remains Server Component.

---

## Font File Sourcing

| Option | Description | Selected |
|--------|-------------|----------|
| Manual placement before execution | User downloads from Font Squirrel | ✓ |
| Executor downloads automatically | curl/wget during plan execution | |

**User's choice:** Manual placement. User places woff2 files in `public/fonts/` before execution.

---

## Social Icon SVGs

| Option | Description | Selected |
|--------|-------------|----------|
| Simple Icons SVG paths | MIT-licensed, inline, no npm package | ✓ |
| Minimal geometric hand-traced | Custom simplified shapes | |

**User's choice:** Simple Icons. 6 platforms: Instagram, SoundCloud, Beatport, YouTube, TikTok, Facebook.

---

## Claude's Discretion

- Keystatic reader pattern in async Server Component footer
- TypeScript interfaces for all components
- Tailwind v4 utility class composition
- Nav height implementation details
- MobileMenu transition animation implementation

## Deferred Ideas

None — discussion stayed within phase scope.
