---
phase: 3
slug: releases
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none — file-check + build + manual browser (same as Phase 2) |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npx @opennextjs/cloudflare build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npx @opennextjs/cloudflare build`; manual `npm run dev` + visit `/releases` + 1 detail page
- **Before `/gsd-verify-work`:** Full suite must be green + all REL-01–07 manually verified
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | catalog-grid | 1 | REL-01 | — | N/A | file-check | `test -f app/releases/page.tsx && grep -q "grid-cols-3" components/releases/ReleaseGrid.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-01-02 | catalog-grid | 1 | REL-01 | — | N/A | manual | DevTools → first card YAML date > second card date (newest first) | — | ⬜ pending |
| 3-02-01 | detail-page | 1 | REL-02 | — | N/A | file-check | `test -f "app/releases/[slug]/page.tsx" && grep -q "DocumentRenderer" "app/releases/[slug]/page.tsx"` | ❌ Wave 0 | ⬜ pending |
| 3-03-01 | soundcloud-embed | 1 | REL-03 | — | no SSR hydration | build+manual | `grep -q '"use client"' components/releases/SoundCloudEmbed.tsx && grep -q "ssr: false" components/releases/SoundCloudEmbed.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-04-01 | platform-links | 1 | REL-04 | — | N/A | manual | Author release with beatportUrl+spotifyUrl → visit detail page → both icons visible + correct hrefs | — | ⬜ pending |
| 3-05-01 | featured-flag | 1 | REL-05 | — | N/A | file-check | `grep -q "featured" keystatic.config.ts` | — | ⬜ pending |
| 3-06-01 | og-metadata | 1 | REL-06 | — | N/A | manual | Build → inspect `<head>` → `<meta property="og:image">` references `/images/releases/{file}` starting with `https://` | — | ⬜ pending |
| 3-07-01 | json-ld | 1 | REL-07 | — | N/A | manual+automated | `curl http://localhost:3000/releases/{slug} \| grep -o '"@type":"MusicAlbum"'` returns 1 match; name/byArtist/datePublished populated | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `app/releases/page.tsx` — catalog grid page (Wave 0 creates stub)
- [ ] `components/releases/ReleaseGrid.tsx` — grid component
- [ ] `app/releases/[slug]/page.tsx` — detail page
- [ ] `components/releases/SoundCloudEmbed.tsx` — client component

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sort newest-first | REL-01 | No test runner; visual verification | `npm run dev` → `/releases` → first card date > second |
| SoundCloud loads client-only, no hydration error | REL-03 | Browser DevTools only | Open DevTools Console → no red hydration warnings after SC player appears |
| Beatport + Spotify links correct | REL-04 | Requires seeded content | Add release with beatportUrl + spotifyUrl in Keystatic admin → visit detail page |
| OG image resolves absolutely | REL-06 | Requires build + HTML inspection | `curl localhost:3000/releases/{slug}` → `og:image` starts with `https://` |
| JSON-LD fields populated | REL-07 | Requires seeded content | View source on detail page → JSON-LD `name`, `byArtist`, `datePublished` match release YAML |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
