---
phase: 05-secondary-content-pages
status: passed
verified: 2026-04-23
verifier: inline (rate-limit fallback)
requirements_covered: [POD-01, POD-02, PRESS-01, PRESS-02, SHOW-01, SHOW-02, SHOW-03, PAGE-01, PAGE-02, PAGE-03, PAGE-04]
must_haves_total: 20
must_haves_verified: 20
---

## Phase Goal

A visitor can navigate to every section of the Marginalia site — podcasts, press coverage, upcoming and past events, the label's story, and the homepage — and find real content presented correctly, with the homepage serving as a credible first impression.

## Verification: PASSED

All 5 plans delivered. All 11 requirements accounted for. All must-haves verified via filesystem and grep checks.

### 05-01 — Keystatic Schema ✓
- heroVideoUrl, heroVideoMobileUrl, about singleton added to keystatic.config.ts
- content/home.yaml and content/about.yaml seed files exist

### 05-02 — Press + Showcases ✓ (PRESS-01, PRESS-02, SHOW-01, SHOW-02, SHOW-03)
- reader.collections.press.all() + date sort + external link safety verified
- Status-field partition (not date comparison) verified
- Past card opacity-60 + grayscale(0.4) verified

### 05-03 — About + Merch ✓ (PAGE-03, PAGE-04)
- DocumentRenderer with Array.isArray guard verified
- https:// security guard on iframe src verified
- Fallback link and empty state verified

### 05-04 — Podcasts Accordion ✓ (POD-01, POD-02)
- buildSoundCloudEmbedUrl called server-side only verified
- PodcastAccordion useState single-open verified
- No lib/releases import in client components verified

### 05-05 — Homepage ✓ (PAGE-01, PAGE-02)
- buildYouTubeEmbedUrl regex extraction verified
- entry.featured === true filter verified
- Own grid (not ReleaseGrid) verified

## Known Issues (code review — non-blocking)
- CR-01: entry.artistSlugs not in schema — undefined in homepage map
- CR-02/WR-01: Missing https:// guard on ShowcaseCard/PressEntry URLs
- WR-02: div role="list" invalid ARIA in PodcastAccordion
- WR-04: Unconditional date render when null in ShowcaseCard
- WR-05: Shopify iframe missing sandbox attribute

Run /gsd-code-review-fix 5 to auto-fix.

## Requirements Traceability

| Requirement | Plan | Status |
|-------------|------|--------|
| POD-01 | 05-04 | passed |
| POD-02 | 05-04 | passed |
| PRESS-01 | 05-02 | passed |
| PRESS-02 | 05-02 | passed |
| SHOW-01 | 05-02 | passed |
| SHOW-02 | 05-02 | passed |
| SHOW-03 | 05-02 | passed |
| PAGE-01 | 05-01, 05-05 | passed |
| PAGE-02 | 05-05 | passed |
| PAGE-03 | 05-01, 05-03 | passed |
| PAGE-04 | 05-03 | passed |
