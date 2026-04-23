---
phase: 05-secondary-content-pages
plan: 01
subsystem: cms-schema
tags: [keystatic, schema, singleton, yaml, content]
requirements: [PAGE-01, PAGE-03]

dependency_graph:
  requires: []
  provides:
    - keystatic.config.ts homePage heroVideoUrl + heroVideoMobileUrl fields
    - keystatic.config.ts about singleton (headline, body, photo)
    - content/home.yaml seed file
    - content/about.yaml seed file
    - public/images/about/ upload directory
  affects:
    - All Phase 5 pages reading from homePage or about singletons via reader.singletons

tech_stack:
  added: []
  patterns:
    - Keystatic fields.url() for optional URL fields in singleton schema
    - Keystatic fields.document() for rich-text body content
    - Keystatic fields.image() with directory/publicPath pairing (no leading slash on directory)
    - Seed YAML with empty/null values to prevent .read() returning null during development

key_files:
  created:
    - content/home.yaml
    - content/about.yaml
    - public/images/about/.gitkeep
  modified:
    - keystatic.config.ts

decisions:
  - "body field uses fields.document() not fields.text() — supports rich formatting for About page editorial content"
  - "Seed YAML uses empty strings for optional URL fields (not null) — matches Keystatic URL field default behavior"
  - "photo: null in about.yaml — fields.image() returns null when no image uploaded; DocumentRenderer handles gracefully"

metrics:
  duration: "2 minutes"
  completed_date: "2026-04-23"
  tasks_completed: 2
  tasks_total: 2
  files_created: 3
  files_modified: 1
---

# Phase 05 Plan 01: Keystatic Schema Additions (homePage Video URLs + About Singleton) Summary

**One-liner:** Added heroVideoUrl/heroVideoMobileUrl to the homePage singleton and created a new about singleton with headline/body/photo fields, plus seed YAML files and image upload directory.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add heroVideoUrl and heroVideoMobileUrl to homePage singleton | 9988fbc | keystatic.config.ts |
| 2 | Add about singleton, seed YAML files, image directory | 6d45cc8 | keystatic.config.ts, content/home.yaml, content/about.yaml, public/images/about/.gitkeep |

## What Was Built

- **homePage schema additions:** Two new `fields.url()` entries (`heroVideoUrl` for desktop 16:9 and `heroVideoMobileUrl` for mobile 9:16) inserted after `heroSubtext` in the existing homePage singleton schema. All 7 existing fields remain in their original order.

- **about singleton:** New Keystatic singleton at `content/about` with three fields:
  - `headline` — plain text field for page heading
  - `body` — rich document field (formatting + links enabled) for editorial content
  - `photo` — image field with `directory: 'public/images/about'` and `publicPath: '/images/about/'`

- **Seed YAML files:** `content/home.yaml` covers all 9 homePage schema fields (including the two new video URL fields). `content/about.yaml` provides valid initial values so `.read()` returns an object rather than null during development.

- **Image upload directory:** `public/images/about/.gitkeep` ensures the directory exists before any images are uploaded via Keystatic admin.

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Disposition | Status |
|-----------|-------------|--------|
| T-05-01-01 | mitigate | DONE — `directory: 'public/images/about'` (no leading slash); `publicPath: '/images/about/'` (leading + trailing slash) |
| T-05-01-02 | mitigate | DONE — content/home.yaml exists with valid YAML before any page calls `.read()` |
| T-05-01-03 | accept | DONE — `body: []` is correctly typed empty document array |

## Known Stubs

None — seed files use empty strings and null values which are valid schema defaults, not UI-rendered placeholder text. Downstream pages will conditionally render based on field presence.

## Build Verification

`npm run build` completed successfully with no TypeScript errors. All 7 routes generated cleanly (including `/releases/[slug]` SSG).

## Self-Check

- [x] `keystatic.config.ts` contains `heroVideoUrl: fields.url(` — FOUND at line 317
- [x] `keystatic.config.ts` contains `heroVideoMobileUrl: fields.url(` — FOUND at line 321
- [x] `keystatic.config.ts` contains `about: singleton({` — FOUND at line 353
- [x] `keystatic.config.ts` contains `directory: 'public/images/about'` — FOUND at line 366
- [x] `keystatic.config.ts` contains `publicPath: '/images/about/'` — FOUND at line 367
- [x] `content/home.yaml` exists and contains `heroVideoUrl` — VERIFIED
- [x] `content/about.yaml` exists and contains `headline: About Marginalia` — VERIFIED
- [x] `public/images/about/` directory exists — VERIFIED
- [x] Task 1 commit 9988fbc — VERIFIED
- [x] Task 2 commit 6d45cc8 — VERIFIED

## Self-Check: PASSED
