# Pitfalls Research

**Domain:** Music label website (Next.js App Router + Keystatic CMS)
**Project:** Marginalia
**Researched:** 2026-04-04
**Confidence:** HIGH (verified via official docs, GitHub issues, and multiple sources)

## Critical Pitfalls

### Pitfall 1: Vercel Hobby Plan Prohibits Commercial Use

**What goes wrong:**
The site is built and deployed on Vercel's free Hobby tier, but Marginalia is a commercial music label. Vercel's Fair Use Guidelines explicitly state: "The Hobby plan restricts users to non-commercial, personal use only." A label website that promotes releases, links to merch stores, or drives any form of revenue qualifies as commercial. Vercel can suspend the deployment without warning.

**Why it happens:**
Developers see "free hosting" and assume it covers any project. The commercial restriction is buried in the Fair Use Guidelines, not prominently displayed on the pricing page.

**How to avoid:**
- Option A: Use Vercel Pro ($20/month) for a fully compliant commercial deployment.
- Option B: Deploy to Cloudflare Pages (free, allows commercial use) or Netlify (free tier allows commercial use). Both support Next.js.
- Option C: If budget is truly zero, deploy to Cloudflare Pages which has no commercial restriction on its free tier, though Next.js support requires the `@cloudflare/next-on-pages` adapter with some limitations.
- Recommended: Start on Vercel Hobby during development (it is fine for dev/staging). Plan to deploy production on Vercel Pro or Cloudflare Pages. Factor $20/month into project budget from launch.

**Warning signs:**
- Site links to external merch stores or Beatport
- Site promotes paid releases
- Any revenue-generating activity tied to the domain

**Phase to address:**
Phase 1 (Infrastructure Setup) -- the hosting decision must be made before any deployment. Document the production hosting plan in project configuration.

---

### Pitfall 2: Keystatic GitHub Mode OAuth Redirect Failures on Vercel

**What goes wrong:**
Keystatic works perfectly in local mode during development, but after deploying to Vercel with GitHub mode, the OAuth callback fails with `redirect_uri` mismatch errors. The CMS admin UI becomes inaccessible in production. This is a known Keystatic bug related to proxy headers.

**Why it happens:**
Vercel uses a reverse proxy architecture. Requests pass through a load balancer, so the `Host` header seen by the app differs from the public domain. Keystatic constructs the OAuth callback URL using the request headers, which may resolve to an internal proxy hostname instead of the public domain. The GitHub App's registered callback URL does not match.

**How to avoid:**
1. Register the correct callback URL in your GitHub App settings: `https://yourdomain.com/api/keystatic/github/oauth/callback`.
2. Create Next.js middleware that intercepts OAuth requests and rewrites the URL using `x-forwarded-host` and `x-forwarded-proto` headers.
3. Ensure all four environment variables are set in Vercel's dashboard (not just `.env`): `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`.
4. Test the deployed admin UI immediately after first production deploy -- do not wait until content needs editing.

**Warning signs:**
- "Login with GitHub" button redirects to a GitHub error page
- OAuth callback URL in browser address bar shows `localhost` or an unexpected host
- CMS works in local dev but not on deployed URL

**Phase to address:**
Phase 1 (Infrastructure Setup) -- configure GitHub App and environment variables as part of initial deployment, not deferred to later.

---

### Pitfall 3: Keystatic Requires Node.js Runtime (Not Static Export)

**What goes wrong:**
Developers try to use `output: 'export'` in `next.config.ts` for a fully static site, but Keystatic requires API route handlers (`/api/keystatic/[...params]/route.ts`) that need a Node.js server runtime. The build fails or the CMS admin UI is completely non-functional. Additionally, `generateStaticParams()` issues arise for the Keystatic catch-all route `[[...params]]`.

**Why it happens:**
Keystatic's admin UI communicates with the local filesystem (local mode) or GitHub API (GitHub mode) through API routes. Static export eliminates all server-side routes. This is a fundamental architectural constraint, not a configuration issue.

**How to avoid:**
- Do NOT set `output: 'export'` in `next.config.ts`.
- Deploy to a platform that supports Node.js server functions (Vercel, Netlify, Cloudflare Pages with adapter).
- Use ISR (Incremental Static Regeneration) or static generation for public pages while keeping the API routes functional for the CMS admin.
- The public-facing site pages can still be statically generated at build time using `generateStaticParams` -- only the `/keystatic` admin routes need the server runtime.

**Warning signs:**
- Build errors mentioning "missing generateStaticParams" for Keystatic routes
- 404 errors when accessing `/keystatic` admin UI on deployed site
- API route handler errors in build logs

**Phase to address:**
Phase 1 (Infrastructure Setup) -- establish the correct Next.js configuration from day one.

---

### Pitfall 4: Server/Client Component Boundary Confusion

**What goes wrong:**
Interactive components (audio embeds, image galleries, navigation toggles) fail with cryptic errors because server and client component boundaries are incorrectly drawn. Common manifestations: trying to use `useState` or `useEffect` in a server component, passing non-serializable props across the boundary, or wrapping entire pages in `"use client"` unnecessarily (losing all SSR benefits).

**Why it happens:**
In Next.js App Router, all components are Server Components by default. Developers accustomed to Pages Router or React SPA patterns instinctively reach for hooks and browser APIs without marking components as client components. Conversely, once they discover `"use client"`, they apply it too broadly, turning entire page trees into client components and losing SSR/streaming benefits.

**How to avoid:**
- Default to Server Components. Only add `"use client"` when the component needs: hooks (`useState`, `useEffect`), browser APIs (`window`, `document`), event handlers (`onClick`, `onChange`), or third-party client-only libraries.
- Create a clear component architecture: Server Components fetch data and render structure; Client Components handle interactivity.
- Use the "Islands" pattern: wrap only the interactive part in a Client Component and keep the parent as a Server Component.
- Never import server-only code (database queries, API keys, filesystem access) into client components -- use the `server-only` package to enforce this at build time.

**Warning signs:**
- Errors like "useState is not a function" or "window is not defined"
- Entire pages wrapped in `"use client"` for no clear reason
- Props crossing the boundary that include functions, classes, or Date objects

**Phase to address:**
Phase 2 (Core Layout & Components) -- establish the component boundary convention before building individual pages.

---

### Pitfall 5: Audio/Video Embed Hydration Mismatches

**What goes wrong:**
SoundCloud and Spotify iframes cause React hydration errors. The server renders a placeholder or nothing for the iframe, but the client renders the full embed. React detects the mismatch and throws warnings or breaks interactivity. In severe cases, the entire page re-renders on the client, causing flash of content and poor performance.

**Why it happens:**
Third-party embed scripts (SoundCloud Widget API, Spotify iFrame API) manipulate the DOM outside React's control. When the server-rendered HTML does not match what the client produces, React's hydration fails. Additionally, embed scripts may load asynchronously, producing different DOM trees at different times.

**How to avoid:**
1. Use `next/dynamic` with `{ ssr: false }` for all embed components:
   ```typescript
   const SpotifyEmbed = dynamic(() => import('./SpotifyEmbed'), { ssr: false });
   ```
2. Wrap embeds in a Client Component with `"use client"` directive.
3. Provide a consistent loading skeleton/placeholder that renders identically on server and client.
4. Never let the embed script run during SSR -- guard with `typeof window !== 'undefined'` checks or dynamic imports.
5. For SoundCloud, load the Widget API script only on the client side using `useEffect`.

**Warning signs:**
- Console warnings: "Text content does not match server-rendered HTML"
- "Hydration failed because the initial UI does not match what was rendered on the server"
- Flash of unstyled/missing content on page load
- Embed players not responding to clicks after page load

**Phase to address:**
Phase 3 (Releases/Catalog pages) -- when embed components are first integrated.

---

### Pitfall 6: Keystatic Image Storage Path Misconfiguration

**What goes wrong:**
Images uploaded through Keystatic's admin UI are stored in the wrong directory or with incorrect public paths. Result: images appear in the CMS admin but show as broken on the public site. Or worse, images are stored outside `public/` and cannot be served at all.

**Why it happens:**
Keystatic image fields require two path configurations: `directory` (where the file is physically stored on disk) and `publicPath` (the URL path used in the frontend). These must be coordinated. If `directory` is `public/images/releases` but `publicPath` is `/images/releases/`, the trailing slash and slug interpolation can produce unexpected paths. The path template also includes the entry slug, creating nested directories developers may not expect.

**How to avoid:**
- Configure image fields explicitly with both `directory` and `publicPath`:
  ```typescript
  fields.image({
    label: 'Cover Art',
    directory: 'public/images/releases',
    publicPath: '/images/releases/',
  })
  ```
- Test the full workflow: upload an image in the CMS admin, check the file system path, and verify the image renders on the frontend.
- Establish a clear image directory convention early (e.g., `public/images/{collection}/{slug}/`) and document it.
- Remember that the entry slug is automatically included in the path between `publicPath` and the filename.

**Warning signs:**
- Broken images on the public site that work fine in the CMS preview
- Images stored in unexpected directories after CMS upload
- Path values in YAML/JSON files that do not match actual file locations

**Phase to address:**
Phase 1 (Infrastructure/CMS Setup) -- configure and test image paths during initial Keystatic schema definition.

---

### Pitfall 7: Content Schema Design Lock-in

**What goes wrong:**
The Keystatic schema (collections, singletons, field types) is designed without thinking through all content relationships. Later, adding fields requires migrating existing content files. Changing a collection's `path` or `format` breaks all existing entries. For a label site specifically: designing releases without linking to artists, or artists without linking to releases, creates a painful restructuring when building catalog/discography views.

**Why it happens:**
Keystatic stores content as flat files (YAML/JSON + Markdown). There are no database migrations. Changing the schema means manually editing every existing content file or writing migration scripts. Developers rush to see content on screen and defer schema planning.

**How to avoid:**
- Plan the full content model before writing any Keystatic config:
  - **Collections:** releases, artists, podcasts, showcases, press items
  - **Singletons:** site settings, about page, home page configuration, footer/social links
- Map relationships explicitly. Since Keystatic has no relational fields, use slug-based references (e.g., a release has an `artistSlugs: fields.array(fields.text(...))` field).
- Include fields you might need later even if they are optional now: release date, catalog number, genre tags, featured flag, sort order.
- Use `fields.select` or `fields.multiselect` for controlled vocabularies (genres, release types: Single/EP/LP/Compilation).
- Use `entryLayout: 'content'` for collections with a rich text body (press, about page) and `entryLayout: 'form'` for structured data (releases, artists).

**Warning signs:**
- Realizing you need a field that does not exist on 20+ existing entries
- Needing to show "releases by this artist" but having no link between them
- Wanting to reorder content but having no sort field
- Content files accumulating inconsistent structures

**Phase to address:**
Phase 1 (CMS Schema Design) -- the schema must be designed comprehensively before any content is entered. Changing it after content exists is costly.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `"use client"` on entire pages | Quick fix for hook errors | Loses SSR, hurts SEO, increases bundle size | Never for content pages; acceptable for admin-only routes |
| Hardcoded content instead of CMS entries | Faster initial development | Every text change requires a code deploy | MVP prototype only; migrate to CMS within same phase |
| Inline styles / no design tokens | Ship faster visually | Inconsistent design, painful redesign | Never -- Tailwind config should enforce tokens from Phase 1 |
| No `generateMetadata` per page | Pages still render | Missing SEO metadata, poor social sharing | Never -- metadata should be added as each page is built |
| Storing images in repo without optimization | Works immediately | Git repo bloats, slow clones, hit Vercel build limits | Acceptable for small catalogs (<50 releases); plan migration path |
| Skipping loading/error states | Cleaner initial code | Broken UX on slow connections, unhandled errors | Never for public pages |
| One massive `keystatic.config.ts` | All schema in one place | File becomes unreadable at 10+ collections | Acceptable initially but refactor into separate schema files when config exceeds ~200 lines |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SoundCloud embeds | Using the Widget API script globally, causing it to load on every page | Load the SoundCloud script only within the embed component via `useEffect`; use `next/dynamic` with `ssr: false` |
| Spotify embeds | Using `react-spotify-embed` package without checking maintenance status | Use a simple iframe approach with the official oEmbed URL; wrap in a client component with `ssr: false` |
| Beatport links | Hardcoding Beatport URLs that change when releases are re-distributed | Store the Beatport URL as a CMS field so it can be updated without code changes |
| YouTube embeds | Embedding full YouTube iframe (loads 1.5MB+ of scripts per embed) | Use `lite-youtube-embed` or a facade pattern: show a thumbnail that loads the iframe only on click |
| Newsletter signup (Mailchimp/etc) | Using Mailchimp's embedded form HTML which conflicts with React hydration | Use the Mailchimp API via a Next.js server action or API route; build a custom form component |
| Google Analytics / tracking | Loading analytics scripts that block rendering | Use `next/script` with `strategy="afterInteractive"` or `"lazyOnload"` |
| Contact/demo submission forms | Sending emails directly from the client (exposes API keys) | Use Next.js server actions to handle form submissions; validate server-side; use a service like Resend or SendGrid via server-only code |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized release artwork images | LCP > 4s, poor Core Web Vitals, Vercel image optimization quota exhausted | Use `next/image` with `width`/`height`/`sizes`; set `priority` on hero/above-fold images; use WebP/AVIF; keep source images under 1MB | With 50+ releases, each with a 3000x3000px artwork |
| Loading all release artwork on catalog page | Page weighs 10MB+, mobile users bounce | Lazy load below-fold images (default `next/image` behavior); implement pagination or infinite scroll; use `sizes` prop for responsive images | At 20+ releases displayed on a single page |
| No Suspense boundaries around data fetching | Entire page blocked until slowest data source resolves; white screen | Wrap independent data sections in `<Suspense>` with skeleton fallbacks; isolate slow fetches from the page shell | When CMS has 100+ entries or GitHub API is slow |
| Excessive client-side JavaScript | TTI (Time to Interactive) > 5s on mobile | Audit with `next build` bundle analyzer; keep client components minimal; avoid large animation libraries | When total JS bundle exceeds 200KB gzipped |
| Vercel Hobby function timeout (60s max, 10s default) | Demo submission form or CMS operations timeout | Configure `maxDuration` in route config; keep server actions fast; offload heavy processing | When form submissions include file uploads or when GitHub API is slow |
| Git repo bloat from CMS images | Clone times increase, Vercel build times increase, approach storage limits | Set up image optimization pipeline; consider external image storage for v2; keep artwork at web-optimized sizes (1200x1200 max) | At 100+ releases with high-res artwork |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Demo submission form without rate limiting | Spam floods, server action abuse, Vercel function invocation quota exhaustion | Implement rate limiting via middleware or a service like Upstash Redis; add honeypot fields; consider CAPTCHA |
| Exposing Keystatic API routes to public | Unauthorized content modification if GitHub mode tokens are compromised | Keystatic's GitHub mode requires GitHub authentication by design; ensure the API route handler is not accidentally exposed with permissive CORS headers |
| Environment variables in client bundle | `KEYSTATIC_GITHUB_CLIENT_SECRET` or `KEYSTATIC_SECRET` leaked to browser | Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client; verify with `next build` output; use the `server-only` package |
| No input validation on demo submission | XSS via form fields, malicious file uploads | Validate and sanitize all form inputs server-side; restrict file upload types (audio only: .mp3, .wav, .flac); enforce file size limits |
| Unprotected `/keystatic` admin route in production | Non-authenticated users accessing the CMS admin UI | In GitHub mode, authentication is handled via GitHub OAuth; verify this works correctly in production; in local mode, the admin route should not exist in production builds |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback when audio embed is loading | Users click play, nothing happens, they think the site is broken | Show a loading skeleton for embeds; display a clear "Loading player..." state |
| Release catalog with no filtering or sorting | Fans cannot find releases by artist, year, or genre | Add filter chips (by artist, year, genre) and sort options (newest first, A-Z); implement as URL query params for shareable filtered views |
| Mobile navigation that obscures content | Hamburger menu covers release artwork; users cannot see what they came for | Use a slide-in drawer or bottom sheet that does not cover the main content; keep navigation minimal |
| Auto-playing audio on page load | Users are startled; instant bounce; violates browser policies anyway | Never auto-play. Let users choose to play. Most browsers block autoplay with sound regardless |
| Tiny tap targets on mobile for play buttons and links | Users mis-tap, frustration on touch devices | Minimum 44x44px touch targets (WCAG guideline); generous padding on interactive elements |
| No visual hierarchy in release grid | All releases look equally important; new releases do not stand out | Feature recent/flagship releases with larger cards; use a "Featured" flag in the CMS; create visual contrast between featured and catalog items |
| Demo submission form with no confirmation or status | Artists submit demos and have no idea if it worked | Show a clear success message; send a confirmation email; set expectations for response time ("We review demos within 2-4 weeks") |
| Press/EPK page without downloadable assets | Journalists cannot easily get logos, press photos, or one-sheets | Provide clearly labeled download links for: high-res logo, press photos, artist bios, one-sheet PDFs; organize by artist |

## "Looks Done But Isn't" Checklist

- [ ] **Release pages:** Often missing structured data (JSON-LD with schema.org `MusicAlbum` / `MusicRecording`) -- verify with Google's Rich Results Test
- [ ] **Artist pages:** Often missing Open Graph images -- verify social sharing previews on Twitter/Facebook/LinkedIn with their debug tools
- [ ] **Image optimization:** Often missing `sizes` prop on `next/image` -- verify responsive image loading with Chrome DevTools Network tab (check if appropriately sized images load on mobile vs desktop)
- [ ] **Metadata:** Often missing per-page `generateMetadata` -- verify each page has unique title, description, and OG tags (not just the root layout defaults)
- [ ] **Mobile navigation:** Often missing keyboard/screen reader accessibility -- verify with Tab key navigation and a screen reader
- [ ] **Demo submission form:** Often missing error states for individual fields -- verify by submitting with invalid data (empty required fields, wrong file types)
- [ ] **CMS admin UI:** Often missing production testing -- verify the `/keystatic` route works on the deployed URL, not just localhost
- [ ] **404 page:** Often using the default Next.js 404 -- verify a custom `not-found.tsx` exists with label branding
- [ ] **Loading states:** Often missing Suspense fallbacks on dynamic pages -- verify by throttling network in DevTools and navigating between pages
- [ ] **Favicon/manifest:** Often missing or using Next.js defaults -- verify `favicon.ico`, `apple-touch-icon.png`, and `site.webmanifest` exist with label branding
- [ ] **Canonical URLs:** Often missing or incorrect -- verify each page has a canonical URL meta tag to prevent duplicate content issues
- [ ] **RSS feed:** Often forgotten for a music label -- verify an RSS feed exists for releases (useful for aggregators and press)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Vercel Hobby plan violation | LOW | Upgrade to Pro ($20/month) or migrate to Cloudflare Pages; no code changes needed for Vercel Pro upgrade |
| Keystatic OAuth redirect failure | LOW | Create middleware to fix proxy headers; update GitHub App callback URL; redeploy |
| Wrong image storage paths | MEDIUM | Write a migration script to move files and update YAML/JSON references; restructure `directory` and `publicPath` in config |
| Content schema redesign | HIGH | Must edit every existing content file (YAML/JSON) to match new schema; no automated migration tool in Keystatic; write a Node.js script to batch-transform files |
| Server/client boundary errors | MEDIUM | Audit all components for correct `"use client"` usage; extract interactive parts into separate client components; usually fixable without data loss |
| Hydration mismatch from embeds | LOW | Wrap offending components in `next/dynamic` with `ssr: false`; add loading skeletons; typically a quick fix |
| Git repo bloat from images | HIGH | Requires Git history rewriting (`git filter-branch` or BFG Repo Cleaner) to remove large files from history; move to external image hosting; painful and risky |
| Missing SEO metadata | MEDIUM | Retroactively add `generateMetadata` to each page; add JSON-LD structured data; tedious but straightforward; no architectural change needed |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel commercial use restriction | Phase 1: Infrastructure | Confirm hosting plan supports commercial use before first deploy |
| Keystatic GitHub mode OAuth | Phase 1: Infrastructure | Successfully log in to `/keystatic` on deployed production URL |
| Static export incompatibility | Phase 1: Infrastructure | Verify `next.config.ts` does NOT have `output: 'export'`; confirm API routes work on deploy |
| Content schema lock-in | Phase 1: CMS Schema Design | Full content model documented and reviewed before any content entry |
| Image storage path config | Phase 1: CMS Schema Design | Upload a test image via CMS; verify it appears correctly on the public site |
| Server/client component boundaries | Phase 2: Core Layout | Establish documented component architecture convention; no `"use client"` on page-level components |
| Audio embed hydration | Phase 3: Releases/Catalog | Zero hydration warnings in browser console on pages with embeds |
| LCP/image performance | Phase 3: Releases/Catalog | Lighthouse performance score > 90 on release pages |
| Demo submission security | Phase 4: Forms/Submissions | Rate limiting active; input validation on all fields; file type restrictions enforced |
| SEO and structured data | Phase 5: SEO/Polish | All pages pass Google Rich Results Test; Open Graph previews verified |
| Mobile responsiveness for media | Every phase | Test every page on mobile viewport (375px) as it is built; do not defer to a "mobile pass" |

## Sources

- [Vercel Hobby Plan Documentation](https://vercel.com/docs/plans/hobby) -- confirms commercial use restriction
- [Vercel Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) -- defines commercial usage
- [Keystatic GitHub Mode Docs](https://keystatic.com/docs/github-mode) -- OAuth setup and environment variables
- [Keystatic + Next.js Installation](https://keystatic.com/docs/installation-next-js) -- API route requirements, Node.js runtime dependency
- [Keystatic Content Organisation](https://keystatic.com/docs/content-organisation) -- collections vs singletons
- [Keystatic Image Field Docs](https://keystatic.com/docs/fields/image) -- directory and publicPath configuration
- [Keystatic OAuth Redirect Fix](https://vedantbhagwat.com/blog/fixing-keystatic-oauth-redirect-uri-localhost-error) -- proxy header bug and middleware workaround
- [Keystatic Environment Variables Issue #1379](https://github.com/Thinkmill/keystatic/issues/1379) -- Vercel deployment env var issues
- [Vercel Blog: Common Next.js App Router Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) -- server/client component pitfalls
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error) -- hydration mismatch causes and fixes
- [Next.js Static Exports Guide](https://nextjs.org/docs/app/guides/static-exports) -- limitations of output: export
- [Next.js Image Component Docs](https://nextjs.org/docs/app/api-reference/components/image) -- optimization, priority, sizes props
- [Next.js generateMetadata Docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) -- per-page metadata
- [Next.js Server Actions File Upload Limitations](https://github.com/vercel/next.js/discussions/50358) -- 1MB default limit, FormData requirements
- [SoundCloud Widget API](https://developers.soundcloud.com/docs/api/html5-widget) -- client-side script requirements
- [Spotify Embed Documentation](https://developer.spotify.com/documentation/embeds) -- iframe API limitations
- [Music Label Website Redesign Signs (Qrolic)](https://qrolic.com/blog/music-label-website-outdated-signs/) -- UX best practices for label sites

---
*Pitfalls research for: Marginalia -- Music Label Website (Next.js + Keystatic)*
*Researched: 2026-04-04*
