---
phase: 05-secondary-content-pages
reviewed: 2026-04-23T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - app/about/page.tsx
  - app/merch/page.tsx
  - app/page.tsx
  - app/podcasts/page.tsx
  - app/press/page.tsx
  - app/showcases/page.tsx
  - components/podcasts/PodcastAccordion.tsx
  - components/podcasts/PodcastRow.tsx
  - components/press/PressEntry.tsx
  - components/showcases/ShowcaseCard.tsx
  - keystatic.config.ts
  - content/about.yaml
  - content/home.yaml
findings:
  critical: 2
  warning: 5
  info: 3
  total: 10
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-04-23
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

The phase 05 secondary content pages are well-structured overall. Server/client component boundaries are correctly managed — `buildSoundCloudEmbedUrl` (behind `import 'server-only'`) is correctly called only in server components and the pre-built URL is passed to client components as a plain prop. Tailwind v4 `bg-(--var)` syntax is used consistently throughout all files. The `rel="noopener noreferrer"` pattern is applied to most external links.

Two critical issues were found: (1) `app/page.tsx` reads a field `entry.artistSlugs` that does not exist in the releases schema — it will always be `undefined`, silently breaking artist display on the homepage featured releases section; and (2) `components/showcases/ShowcaseCard.tsx` passes CMS-sourced `ticketUrl` and `aftermovieUrl` directly to `href` without any URL scheme validation, creating a potential `javascript:` injection vector.

Five warnings cover: unvalidated URLs used as `href` in press entries, raw artist slug displayed instead of artist name in podcast rows, a missing null guard on `entry.date` in `ShowcaseCard`, an iframe without a `sandbox` attribute in `app/merch/page.tsx`, and the `role="list"` on a `div` in `PodcastAccordion` (semantic mismatch that breaks accessibility).

---

## Critical Issues

### CR-01: `entry.artistSlugs` Does Not Exist in Releases Schema

**File:** `app/page.tsx:54`

**Issue:** The releases collection schema in `keystatic.config.ts` does not define an `artistSlugs` field. The featured releases map at line 50–57 reads `entry.artistSlugs`, which will always be `undefined`. Any downstream consumer of `artistSlugs` in `ReleaseCard` (and ultimately any artist attribution rendered on the homepage) will silently receive `undefined` and either crash or display nothing. Content files (`bestiary-vol-1.yaml`, `call-out.yaml`) confirm the field is absent from persisted data.

```tsx
// Current — entry.artistSlugs is always undefined; field does not exist in releases schema
const featured = allReleases
  .filter(({ entry }) => entry.featured === true)
  .map(({ slug, entry }) => ({
    slug,
    entry: {
      title: entry.title,
      artistSlugs: entry.artistSlugs,   // <-- undefined every time
      coverArt: entry.coverArt,
    },
  }));
```

**Fix:** Either (a) add `artistSlugs` to the releases schema in `keystatic.config.ts`:

```ts
// In keystatic.config.ts — releases schema
artistSlugs: fields.array(
  fields.text({ label: 'Artist Slug' }),
  {
    label: 'Artists',
    itemLabel: (props) => props.value,
  }
),
```

or (b) if artist attribution is intentionally not part of releases, remove the field from the map and update `ReleaseCard` to not expect it:

```tsx
// app/page.tsx — drop artistSlugs from the mapped shape
entry: {
  title: entry.title,
  coverArt: entry.coverArt,
},
```

The correct fix depends on whether `ReleaseCard` requires `artistSlugs`. Check `ReleaseCard`'s prop type before deciding.

---

### CR-02: Unvalidated CMS URLs Used as `href` in ShowcaseCard (XSS via `javascript:`)

**File:** `components/showcases/ShowcaseCard.tsx:62` and `components/showcases/ShowcaseCard.tsx:75`

**Issue:** `entry.ticketUrl` and `entry.aftermovieUrl` are passed directly from the CMS to `href` on anchor tags without any scheme validation. If a CMS operator (or an attacker with CMS access) sets one of these to `javascript:alert(1)`, clicking the link executes arbitrary JavaScript. The `merch/page.tsx` already implements a `startsWith('https://')` guard for this exact reason — that pattern is missing here.

```tsx
// Current — no scheme check
<a
  href={entry.ticketUrl}   // could be javascript:...
  target="_blank"
  rel="noopener noreferrer"
  ...
>
```

**Fix:** Add the same guard used in `app/merch/page.tsx` before rendering the anchor. Do this at the call site in `ShowcaseCard` or upstream in `app/showcases/page.tsx` before passing to the component:

```tsx
// In ShowcaseCard or in showcases/page.tsx before mapping
function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('https://') || url.startsWith('http://') ? url : null;
}

// Then in JSX:
{variant === 'upcoming' && safeHref(entry.ticketUrl) && (
  <a href={safeHref(entry.ticketUrl)!} target="_blank" rel="noopener noreferrer" ...>
    GET TICKETS
  </a>
)}
{variant === 'past' && safeHref(entry.aftermovieUrl) && (
  <a href={safeHref(entry.aftermovieUrl)!} target="_blank" rel="noopener noreferrer" ...>
    WATCH AFTERMOVIE ↗
  </a>
)}
```

---

## Warnings

### WR-01: Unvalidated CMS URL Used as `href` in PressEntry

**File:** `components/press/PressEntry.tsx:37` and `components/press/PressEntry.tsx:68`

**Issue:** `entry.url` from the press collection is passed directly to `href` on two anchor elements without a scheme check. Same `javascript:` injection risk as CR-02. The Keystatic `fields.url()` type does validate format in the CMS UI but does not prevent a raw YAML edit from injecting an arbitrary scheme.

**Fix:** Apply the same `startsWith('https://') || startsWith('http://')` guard before rendering the link. Since both anchors use `entry.url`, a single computed safe URL variable at the top of the component handles both:

```tsx
export default function PressEntry({ entry }: PressEntryProps) {
  const safeUrl =
    entry.url && (entry.url.startsWith('https://') || entry.url.startsWith('http://'))
      ? entry.url
      : null;
  // Replace all uses of entry.url with safeUrl
  ...
}
```

---

### WR-02: `role="list"` on a `<div>` Is Incorrect — Use `<ul>` or Remove Role

**File:** `components/podcasts/PodcastAccordion.tsx:24`

**Issue:** `<div role="list">` is not a valid ARIA pattern. The `list` role is meaningful only when its children have `role="listitem"`, but the direct children here are `PodcastRow` components that render `<div>` elements — not `<li>` elements and not elements with `role="listitem"`. Screen readers may announce an empty or malformed list. Additionally, `app/press/page.tsx:29` wraps `PressEntry` in a `<ul role="list">` with `<li>` children, which is the correct pattern.

**Fix:** Either change the container to `<ul>` and ensure each `PodcastRow` renders an `<li>` root (consistent with the press list pattern), or remove `role="list"` from the `<div>` entirely:

```tsx
// Option A — semantic list (preferred, matches press pattern)
<ul className="divide-y divide-(--color-surface)">
  {episodes.map(ep => (
    <PodcastRow key={ep.slug} episode={ep} ... />  // PodcastRow must render <li> root
  ))}
</ul>

// Option B — remove invalid role
<div className="divide-y divide-(--color-surface)">
  {episodes.map(ep => (
    <PodcastRow key={ep.slug} episode={ep} ... />
  ))}
</div>
```

---

### WR-03: `artistSlug` Displayed as Raw Slug Instead of Resolved Artist Name

**File:** `components/podcasts/PodcastRow.tsx:43-46`

**Issue:** The component renders `episode.artistSlug` directly as text (e.g., "elif-koz") rather than the artist's display name (e.g., "Elif Koz"). The `Episode` type carries `artistSlug: string | null` and the server component in `app/podcasts/page.tsx` passes it through unchanged. The `lib/releases.ts` already exports `resolveArtistNames` for exactly this purpose.

**Fix:** In `app/podcasts/page.tsx`, resolve the artist name server-side before passing to the client component:

```tsx
// app/podcasts/page.tsx
const episodes = await Promise.all(
  sorted.map(async ({ slug, entry }) => {
    const artistName = entry.artistSlug
      ? (await resolveArtistNames([entry.artistSlug]))[0] ?? entry.artistSlug
      : null;
    return {
      slug,
      title: entry.title,
      artistName,          // resolved display name
      date: entry.date ?? null,
      description: entry.description ?? null,
      coverImage: entry.coverImage ?? null,
      embedUrl: entry.soundcloudUrl ? buildSoundCloudEmbedUrl(entry.soundcloudUrl) : null,
    };
  })
);
```

Update `PodcastRow`'s `Episode` type to accept `artistName: string | null` and render that instead of `artistSlug`.

---

### WR-04: `entry.date` Rendered Without Null Guard in ShowcaseCard

**File:** `components/showcases/ShowcaseCard.tsx:56`

**Issue:** `entry.date` is typed `string | null` (line 6) but is rendered directly in JSX at line 56 with no conditional:

```tsx
<p ...>
  {entry.date}   // renders empty if null, no guard
</p>
```

When `date` is `null`, React renders nothing inside the `<p>`, leaving a visible but empty paragraph that may carry layout spacing. This is a minor rendering defect but could produce unexpected whitespace for showcase entries without a set date.

**Fix:** Guard the paragraph render:

```tsx
{entry.date && (
  <p className={`text-(--text-label) mt-(--space-sm) ${...}`}>
    {entry.date}
  </p>
)}
```

---

### WR-05: Merch iframe Missing `sandbox` Attribute

**File:** `app/merch/page.tsx:23`

**Issue:** The Shopify iframe has no `sandbox` attribute. Without `sandbox`, the embedded Shopify page runs with full permissions: it can execute scripts, submit forms, open popups, and navigate the top frame. For an iframe embedding a third-party commerce store, this is a meaningful security posture gap. The `sandbox` attribute restricts these capabilities by default and allows specific ones to be granted explicitly.

**Fix:** Add a `sandbox` attribute that permits the minimum required for a Shopify checkout flow:

```tsx
<iframe
  src={safeUrl}
  title="Marginalia Merch Store"
  className="w-full border-0 flex-1 min-h-[80vh]"
  loading="lazy"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
/>
```

Note: `allow-popups-to-escape-sandbox` is needed so Shopify's payment popups and 3DS authentication can open. If the iframe continues to appear blank after adding `sandbox`, the Shopify X-Frame-Options restriction (documented in the inline comment) is the likely cause — the sandbox attribute is not the source of that issue.

---

## Info

### IN-01: Stale `featuredReleaseSlug` Field in Keystatic Schema Is Never Consumed

**File:** `keystatic.config.ts:303-306`

**Issue:** The `homePage` singleton schema defines a `featuredReleaseSlug` field (line 303) with the label "Featured Release Slug — Manually curated featured release". `app/page.tsx` ignores this field entirely and instead uses `entry.featured === true` (the checkbox on each release). The schema field is dead — it creates confusion in the CMS UI (Elif sees a "Featured Release Slug" input that has no effect) and suggests a different design intent that was superseded.

**Fix:** Either remove the field from the schema if the per-release checkbox approach is final, or document in the field's `description` that it is reserved / not yet implemented:

```ts
featuredReleaseSlug: fields.text({
  label: 'Featured Release Slug (reserved)',
  description: 'Not yet in use — featured releases are controlled by the checkbox on each Release entry.',
}),
```

---

### IN-02: Podcast Cover Image Path Assumes `releases/` Directory

**File:** `components/podcasts/PodcastRow.tsx:85`

**Issue:** Cover images for podcast episodes are served from `/images/releases/`:

```tsx
src={`/images/releases/${episode.coverImage}`}
```

The Keystatic schema for `podcasts` at `keystatic.config.ts:148` also stores cover images under `public/images/releases`. This means podcast cover art and release cover art share the same directory. If a podcast episode has a cover image with the same filename as a release cover, they would collide. This is a naming/organisation risk, not a runtime bug — but it may cause silent overwrite issues when content is managed.

**Fix:** Give podcasts their own directory in the schema and update the image path in the component:

```ts
// keystatic.config.ts — podcasts schema
coverImage: fields.image({
  label: 'Cover Image',
  directory: 'public/images/podcasts',
  publicPath: '/images/podcasts/',
}),
```

```tsx
// PodcastRow.tsx
src={`/images/podcasts/${episode.coverImage}`}
```

---

### IN-03: `buildSoundCloudEmbedUrl` Does Not Validate That the Input Is a SoundCloud URL

**File:** `lib/releases.ts:4`

**Issue:** `buildSoundCloudEmbedUrl` accepts any string and passes it as the `url` parameter to the SoundCloud widget endpoint without checking that it is actually a SoundCloud URL. A non-SoundCloud URL would result in a broken or potentially misleading embed. This is low-risk because the field is an admin-only CMS input, but it is inconsistent with the validation pattern used for YouTube (`buildYouTubeEmbedUrl` in `app/page.tsx` extracts a video ID via regex and constructs the URL from scratch).

**Fix:** Add a basic domain check before building the embed URL:

```ts
export function buildSoundCloudEmbedUrl(soundcloudUrl: string): string | null {
  if (!soundcloudUrl.includes('soundcloud.com/')) return null;
  const params = new URLSearchParams({ ... });
  return `https://w.soundcloud.com/player/?${params.toString()}`;
}
```

Update the call site in `app/podcasts/page.tsx` to handle the `null` return (it already guards with a ternary, so the change is minimal).

---

_Reviewed: 2026-04-23_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
