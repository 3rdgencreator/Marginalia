---
phase: 5
slug: secondary-content-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — project uses build-gate + manual browser smoke testing |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run lint` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | PAGE-01, PAGE-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-01-02 | 01 | 1 | PAGE-01 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-02-01 | 02 | 1 | POD-01, POD-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-02-02 | 02 | 1 | PRESS-01, PRESS-02 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-02-03 | 02 | 1 | SHOW-01, SHOW-02, SHOW-03 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-03-01 | 03 | 2 | PAGE-03 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |
| 5-03-02 | 03 | 2 | PAGE-04 | — | N/A | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements — `npm run build` is present and functional. No new test files needed.

*No Wave 0 test stubs required — project uses build verification + manual smoke testing consistent with Phases 3 and 4.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Homepage hero video autoplays muted | PAGE-01 | Requires browser + YouTube unlisted video | `npm run dev` → visit `/` → confirm video plays muted, loop |
| SoundCloud embed loads without hydration errors | POD-02 | Requires browser console inspection | `npm run dev` → visit `/podcasts` → expand entry → check DevTools console for no hydration errors |
| Press external links open in new tab | PRESS-02 | Requires browser interaction | `npm run dev` → visit `/press` → click "Read article ↗" → confirm opens in new tab |
| Upcoming vs past showcases visually distinct | SHOW-03 | Visual/design check | `npm run dev` → visit `/showcases` → confirm past cards have reduced opacity/grayscale |
| Merch iframe renders (or fallback text) | PAGE-04 | Depends on Shopify X-Frame-Options config | `npm run dev` → visit `/merch` → verify iframe loads OR fallback "Visit our store →" button shown |
| About page DocumentRenderer output | PAGE-03 | Requires Keystatic content to be set | `npm run dev` → add content via `/keystatic` admin → visit `/about` → verify rich text renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
