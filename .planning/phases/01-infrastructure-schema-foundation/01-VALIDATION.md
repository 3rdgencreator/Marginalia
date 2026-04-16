---
phase: "01"
phase-slug: infrastructure-schema-foundation
date: 2026-04-16
---

# Validation Strategy: Phase 1 — Infrastructure & Schema Foundation

## Checkpoints Mapped to Automated Verify Commands

| # | Checkpoint | Automated Verify | Plan/Task |
|---|-----------|-----------------|-----------|
| 1 | `npm run dev` starts without error | `npm run dev -- --port 3099 & sleep 8 && curl -s http://localhost:3099 \| grep -q "Marginalia" && echo PASS \|\| echo FAIL` | 01-01 Task 1 |
| 2 | No `tailwind.config.js` or `tailwind.config.ts` exists | `test ! -f tailwind.config.js && test ! -f tailwind.config.ts && echo PASS \|\| echo FAIL` | 01-01 Task 1 |
| 3 | `next.config.ts` does NOT contain `output: 'export'` | `grep -q "output.*export" next.config.ts && echo FAIL \|\| echo PASS` | 01-01 Task 1 |
| 4 | `wrangler.jsonc` has required fields | `cat wrangler.jsonc \| grep -q "marginalia-label" && cat wrangler.jsonc \| grep -q ".open-next/worker.js" && cat wrangler.jsonc \| grep -q "nodejs_compat" && echo PASS \|\| echo FAIL` | 01-01 Task 2 |
| 5 | All content directories exist | `test -d content/releases && test -d content/artists && test -d content/podcasts && test -d content/press && test -d content/showcases && echo PASS \|\| echo FAIL` | 01-01 Task 2 |
| 6 | All image directories exist | `test -d public/images/releases && test -d public/images/artists && test -d public/images/showcases && echo PASS \|\| echo FAIL` | 01-01 Task 2 |
| 7 | `keystatic.config.ts` has all 5 collections | `grep -q "releases:" keystatic.config.ts && grep -q "artists:" keystatic.config.ts && grep -q "podcasts:" keystatic.config.ts && grep -q "press:" keystatic.config.ts && grep -q "showcases:" keystatic.config.ts && echo PASS \|\| echo FAIL` | 01-02 Task 1 |
| 8 | `keystatic.config.ts` has both singletons | `grep -q "siteConfig:" keystatic.config.ts && grep -q "homePage:" keystatic.config.ts && echo PASS \|\| echo FAIL` | 01-02 Task 1 |
| 9 | Image fields have correct directory/publicPath pairing | `grep -q "directory: 'public/images/releases'" keystatic.config.ts && grep -q "publicPath: '/images/releases/'" keystatic.config.ts && echo PASS \|\| echo FAIL` | 01-02 Task 1 |
| 10 | Keystatic reader exported from lib/keystatic.ts | `grep -q "export const reader" lib/keystatic.ts && echo PASS \|\| echo FAIL` | 01-02 Task 2 |
| 11 | Keystatic API route exists | `test -f app/api/keystatic/[...params]/route.ts && echo PASS \|\| echo FAIL` | 01-02 Task 2 |
| 12 | OpenNext build completes without error | `npx @opennextjs/cloudflare build 2>&1 \| tail -5` | 01-03 Task 1 |
| 13 | Image path end-to-end works | Human verify: upload test image via `/keystatic` → confirm file at `public/images/releases/` → confirm HTTP 200 at `/images/releases/[filename]` | 01-03 Task 1 (checkpoint) |
| 14 | CMS workflow documented | `test -f CMS-WORKFLOW.md && wc -l CMS-WORKFLOW.md \| awk '{print ($1 >= 20) ? "PASS" : "FAIL"}'` | 01-03 Task 2 |
