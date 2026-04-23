---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
last_updated: "2026-04-23T18:24:01.188Z"
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 15
  completed_plans: 8
  percent: 53
---

# Project State: Marginalia

**Last updated:** 2026-04-04
**Updated by:** gsd:new-project (roadmap creation)

---

## Project Reference

**Core value:** A living, branded label hub where the music, artists, and culture of Marginalia are showcased with the visual weight and editorial control the label deserves.

**Current focus:** Phase 05 — secondary-content-pages

**Stack:** Next.js 15 + TypeScript + Tailwind v4 + Keystatic 0.5.x + @opennextjs/cloudflare

---

## Current Position

Phase: 05 (secondary-content-pages) — EXECUTING
Plan: 1 of 5
**Phase:** 6
**Plan:** Not started
**Status:** Ready to plan

**Overall progress:**

```
Phase 1 [          ] 0%
Phase 2 [          ] 0%
Phase 3 [          ] 0%
Phase 4 [          ] 0%
Phase 5 [          ] 0%
Phase 6 [          ] 0%
Phase 7 [          ] 0%
```

---

## Phase Summary

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Infrastructure & Schema Foundation | INFRA-01–05, CMS-01–06 (11 total) | Not started |
| 2 | Design System & Layout Shell | DSYS-01–05 (5 total) | Not started |
| 3 | Releases | REL-01–07 (7 total) | Not started |
| 4 | Artists | ARTST-01–04 (4 total) | Not started |
| 5 | Secondary Content Pages | POD-01–02, PRESS-01–02, SHOW-01–03, PAGE-01–04 (11 total) | Not started |
| 6 | Forms & Email | FORM-01–06 (6 total) | Not started |
| 7 | SEO & Polish | SEO-01–04 (4 total) | Not started |

**Total v1 requirements:** 48 — all mapped, none orphaned

---

## Accumulated Context

### Critical Decisions

- **Hosting:** Cloudflare Workers via `@opennextjs/cloudflare` — not Vercel (commercial use ban on Hobby) and not `@cloudflare/next-on-pages` (deprecated)
- **Keystatic mode:** Local-only in v1. GitHub OAuth is broken on Workers (issue #1497, unresolved April 2026). Workflow: edit locally → commit YAML → git push → Workers rebuilds.
- **Schema lock:** Keystatic schema must be 100% final in Phase 1 before any content is entered. No migration tooling exists. Adding optional fields later requires hand-editing every YAML file.
- **Embed pattern:** All audio/video embeds (SoundCloud, Spotify, YouTube) use `next/dynamic({ ssr: false })`. No exceptions. Hydration errors are a hard blocker.
- **Client boundary:** `"use client"` goes only on leaf/interactive components — never on page-level components. Established in Phase 2, enforced throughout.
- **Image paths:** Keystatic image fields must pair `directory: 'public/images/X'` with `publicPath: '/images/X'` exactly. Mismatch causes 404s with no build error.
- **No static export:** `output: 'export'` breaks Keystatic admin. Use OpenNext/Workers mixed rendering.
- **Forms:** React Hook Form + Zod + `useActionState` with `action=` prop on `<form>`. Not `onSubmit`. Server actions only.
- **Email split:** Resend for transactional (demo confirmations, management contact) — Brevo for newsletter list (subscribe form). Neither replaces the other on free tiers.

### Known Issues / Watch Items

- Keystatic GitHub OAuth bug (issue #1497): monitor before Phase 1 completes — if resolved, update CMS workflow to GitHub mode for production comfort
- Git image bloat: storing release artwork in repo is fine for up to ~50 releases; v2 will need external image storage if catalog grows significantly; source images should be max 1200×1200px, under 500KB
- Rate limiting: honeypot fields are the v1 minimum for demo form spam protection; Upstash Redis is the documented upgrade path if spam becomes an issue

### Todos

- [ ] Start Phase 1: scaffold Next.js 15 project with TypeScript and Tailwind v4
- [ ] Configure `@opennextjs/cloudflare` and `wrangler.jsonc`
- [ ] Write `keystatic.config.ts` with full schema (all 5 collections + siteConfig singleton)
- [ ] Verify image path end-to-end: upload via admin → check filesystem → verify in browser
- [ ] Deploy placeholder to Cloudflare Workers and confirm build succeeds
- [ ] Document CMS local-mode workflow in project README

### Blockers

None currently.

---

## Session Continuity

**To resume this project, read:**

1. `.planning/STATE.md` (this file) — current position and context
2. `.planning/ROADMAP.md` — phase structure and success criteria
3. `.planning/REQUIREMENTS.md` — full requirement list with traceability

**Current phase detail:** `.planning/ROADMAP.md` — Phase 1 section

**Next action:** Run `/gsd:plan-phase 1` to generate the execution plan for Phase 1.

---

*State initialized: 2026-04-04*
