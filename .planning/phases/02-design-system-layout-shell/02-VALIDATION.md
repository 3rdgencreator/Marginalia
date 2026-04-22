---
phase: 2
slug: design-system-layout-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test runner installed. Phase 2 is visually verified. |
| **Config file** | none |
| **Quick run command** | `npm run build` (exits 0) |
| **Full suite command** | `npm run build && npx @opennextjs/cloudflare build` |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** `npm run build` exits 0 — no TypeScript errors, no import failures
- **After every plan wave:** Full manual browser verification at 4 viewports + DevTools console
- **Before `/gsd-verify-work`:** All 5 DSYS success criteria confirmed manually; no hydration errors; no 404s on fonts; footer renders with fallback tagline when YAML absent

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | DSYS-01 | N/A | file-check | `test ! -f tailwind.config.js && grep -q '@theme' app/globals.css` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | DSYS-02 | N/A | file-check | `grep -q 'color-bg:.*#1F1F21' app/globals.css` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | DSYS-03 | N/A | manual | Open `/`, DevTools → Computed styles on `<body>` (16px) and `<h1>` (Nimbus Sans Bold) | — | ⬜ pending |
| 2-02-01 | 02 | 1 | DSYS-05 | Reader in Server Component only — never exposed to client | file-check | `grep -q 'SiteNav' app/layout.tsx && grep -q 'SiteFooter' app/layout.tsx` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | DSYS-05 | "use client" on NavLinks + MobileMenu only | file-check | `grep -rn '"use client"' components/layout/ components/ui/ 2>/dev/null` returns only NavLinks.tsx + MobileMenu.tsx | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | DSYS-04 | N/A | manual | DevTools responsive: 375 / 768 / 1024 / 1440 — no overflow, no clipping | — | ⬜ pending |
| 2-02-04 | 02 | 1 | DSYS-05 | N/A | manual | SocialIcon renders null when URL empty; save siteConfig with only Instagram URL → only Instagram icon appears | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `public/fonts/` directory must exist before execution. Plan must include `mkdir -p public/fonts` (file-check tasks marked ❌ W0 above require this)
- [ ] `content/site-config.yaml` does not exist yet — `SiteFooter` must use `reader.singletons.siteConfig.read()` with fallback (not `readOrThrow()`) to avoid a crash on every route

*No test framework install needed in Phase 2 — layout shell is visually verified in browser.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Headings render in Nimbus Sans Bold at all viewports | DSYS-03 | Font rendering is visual, not code-checkable | Open `/` at 375/1024px, DevTools → Computed → font-family on `<h1>` shows Nimbus Sans |
| Body 16px legible on mobile | DSYS-03 | Readability is visual | DevTools → Computed → font-size on `<p>` shows 16px |
| No broken layout 375–1440px | DSYS-04 | Layout overflow is visual | Chrome DevTools responsive mode, drag from 375 to 1440 — no horizontal scroll |
| SocialIcon null when URL empty | D-12 | Requires CMS state | Save siteConfig with 0 URLs → footer shows no icons; add 1 URL → 1 icon appears |
| Nav active link lime border | D-04 | Requires navigation | Click a nav link, verify lime bottom-border appears on that link |
| Mobile hamburger open/close | UI-SPEC | Requires interaction | Tap hamburger at 375px → overlay appears; tap X or outside → closes with transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual instructions documented above
- [ ] Sampling continuity: `npm run build` after every commit
- [ ] Wave 0 covers: `public/fonts/` dir + siteConfig YAML handling
- [ ] No watch-mode flags in any plan command
- [ ] Feedback latency: build check ~30s, manual verification ~5 min per wave
- [ ] `nyquist_compliant: true` set in frontmatter when all above are checked

**Approval:** pending
