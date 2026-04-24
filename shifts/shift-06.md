# Marginalia Web Site — Shift 6

## Shift 6 — April 24, 2026

**Duration:** ~5–6 hours
**Status:** Demo page, Showcases, MiniPlayer, FirstVisitPrompt — all shipped ✓

---

### Starting State

- Phase 3 (Releases) complete from Shift 5
- Mini player (Spotify-style, singleton SC iframe) just landed in previous commit
- Volume slider too large and in wrong position
- No demo submission page
- Showcases page had manual status field, no auto-classification
- No session prompt to encourage podcast listening

---

### What Was Done

#### 1. Mini Player — Volume Slider Redesign

Volume slider moved from standalone position to the right of the playback controls. Redesigned to match Spotify's thin-slider style:

- 3px track height, 10px circular thumb
- CSS `linear-gradient` fills the track with lime (`#9EFF0A`) up to current volume — implemented via CSS custom property `--vol` on the input
- `::-webkit-slider-thumb` and `::-moz-range-thumb` overrides for cross-browser consistency
- Hover state: thumb turns lime + 1.15× scale
- Mute toggle button left of slider (cycles between three SVG volume icons)

#### 2. Mini Player — Pause Bug Fixed

`togglePlay()` previously called `widget.isPaused(cb)` (async callback) to determine current state — the callback could fire stale. Fixed by reading `this.state.isPlaying` directly from in-memory store state, which is always current.

```ts
// Before (broken)
this.widget.isPaused((paused) => { if (paused) widget.play(); else widget.pause(); });

// After (correct)
if (this.state.isPlaying) { this.widget.pause(); } else { this.widget.play(); }
```

#### 3. Demo Submission Page — `/demo`

Full demo submission flow built:

**Keystatic singleton (`demoPage`):**
- `acceptingDemos` checkbox toggle — controls which message visitors see
- `heading` text field
- `intro` rich text document (full DocumentRenderer support)

**`/demo` page (`app/demo/page.tsx`):**
- Server component reads singleton from Keystatic
- Passes `acceptingDemos` flag to `<DemoForm>`

**`DemoForm.tsx` (client component):**
- Fields: artist name, genre/style, SoundCloud / streaming link, contact email, message
- Honeypot field (`website`) — invisible to users, blocks bots
- If `acceptingDemos = false`: shows closed banner ("We are no longer accepting demos for 2026...") but form remains accessible
- On submit: POST to `/api/demo/route.ts` → Brevo transactional email
- Success / error states with inline feedback

**`/api/demo` route:**
- Honeypot check first — silent 200 if bot
- Validates required fields
- Sends via Brevo API (`/v3/smtp/email`) with structured HTML body
- Brevo API key stored in `BREVO_API_KEY` environment variable

#### 4. Showcases — Auto Date Classification

Removed manual `status` field from Keystatic schema. Status is now derived automatically at render time by comparing `event.date` (ISO string, `YYYY-MM-DD`) to today's date — lexicographic comparison works for this format.

**ShowcaseCard visual states:**
- **Upcoming:** full opacity + lime glow (`box-shadow: 0 0 24px 8px rgba(158,255,10,0.1), 0 0 6px 2px rgba(158,255,10,0.18)`)
- **Past:** `opacity: 0.45`, `filter: grayscale(0.5)` — naturally fades without section headings
- No "Upcoming" / "Past" section labels — single grid, visual differentiation only

**Added `soundcloudSetUrl` field** to showcases Keystatic schema — renders as "LISTEN ↗" link on the card when populated.

#### 5. MiniPlayer — Artwork Thumbnail + Now Playing Label

Additional MiniPlayer polish:

- **Artwork thumbnail:** 60×60px image, fixed at `bottom: 48px, left: 20px`, `borderRadius: 6`, lime glow shadow — floats above the mini player bar, implemented via `createPortal` Fragment (artwork + bar as siblings)
- **"NOW PLAYING" label:** 8px, font-weight 300, red (`rgba(220,50,50,0.85)`), uppercase, only visible when `isPlaying = true`
- **Track title:** font-weight 300, 12px, muted white — truncates with ellipsis
- **MiniPlayer background opacity:** reduced progressively to `rgba(10,10,12,0.10)` (10%) for a barely-there feel
- **Podcasts page exclusion:** `if (pathname === '/podcasts') return null` — avoids player clash on the page with native SC embeds

#### 6. FirstVisitPrompt — Session Podcast Play Encourage

New component to increase SoundCloud play counts — appears once per session, 1.5s after page load:

- Fixed position top-left below nav (`top: 64, left: 20`)
- Dark glass card: `rgba(20,20,24,0.82)` + `backdrop-filter: blur(12px)`, 1px border, square corners
- Text: "Want to listen our latest podcast while you browse?"
- "▶ Play" button + "Not now" dismiss button
- Dismissed via `sessionStorage` — never re-appears within the same tab session
- Hidden on `/podcasts` page (where native embeds already exist)

**Data wired in `app/layout.tsx`:**
- Server component reads latest podcast from Keystatic, builds embed URL
- Falls back to `soundcloudPlaylistUrl` from `siteConfig` singleton if no podcast entries exist
- `<FirstVisitPrompt>` rendered inside `<PlayerProvider>`

#### 7. FirstVisitPrompt Play — Extended Debug Session

Getting the play button to reliably start audio took several iterations due to SC Widget API's initialization lifecycle:

| Attempt | Problem |
|---------|---------|
| `setTimeout(() => togglePlay(), 800)` | Fires before widget initialized → no-op |
| `pendingPlay` flag + `initWidget()` check | Widget fires own PLAY→PAUSE during init (`auto_play: false`), our call arrives mid-sequence |
| `getCurrentSoundIndex` ping before play | Ping resolves but `widget.play()` still hits the init window |
| Retry loop every 2s | SC keeps firing PAUSE regardless |
| `auto_play=true` in embed URL | Works on Windows/Chrome; Safari blocks cross-origin iframe autoplay |
| **Final: preload widget when prompt appears** | Widget fully initialized before click → `togglePlay()` called synchronously within user gesture |

**Final architecture:**
1. When prompt becomes visible (t+1.5s): `loadPlaylist(embedUrl, scUrl)` called — SC iframe created with `auto_play: false`, widget initializes in background
2. User clicks "▶ Play": `togglePlay()` called **synchronously within click gesture** (Safari-safe), plus `playOnReady()` as fallback if widget not ready yet
3. Mini player appears as soon as PLAY event fires

**Safari note:** Cross-origin iframe audio cannot be auto-triggered via postMessage without direct user gesture in the iframe context — fundamental browser limitation, no clean fix available without replacing the SC Widget approach.

---

### Files Changed This Shift

```
app/layout.tsx                          — async, reads latest podcast, renders FirstVisitPrompt
app/demo/page.tsx                       — new: demo submission page
app/showcases/page.tsx                  — remove manual status; auto date classification
app/api/demo/route.ts                   — new: Brevo email API route with honeypot
components/layout/MiniPlayer.tsx        — volume slider redesign, artwork, now playing label
components/ui/FirstVisitPrompt.tsx      — new: session podcast prompt
components/demos/DemoForm.tsx           — new: full demo form with accepting/closed toggle
components/showcases/ShowcaseCard.tsx   — glow/dim based on date; soundcloudSetUrl link
content/demo-page.yaml                  — new: Keystatic singleton content
keystatic.config.ts                     — demoPage singleton; showcases schema updates
lib/player-store.ts                     — pause fix; pendingPlay; playOnReady
lib/player-context.tsx                  — expose playOnReady action
```

---

### Commit History

```
c8a6fb5  fix(player): preload widget on prompt show, togglePlay synchronously on click
5a4f2c9  fix(player): use auto_play=true iframe URL — attempt (reverted approach)
4032164  fix(player): use getCurrentSoundIndex ping to confirm iframe ready before play
f05281f  fix(player): make playOnReady reliable for fresh and already-initialized widget
31fdc4d  feat(player): fix FirstVisitPrompt play via pendingPlay + add playOnReady
8c4bcac  feat(player): artwork thumbnail, now playing label, opacity tuning
afa6b71  feat: demo submission page, showcases auto-classification, mini player fixes
0ff601b  chore: redeploy to apply new Brevo API key
a8099e5  chore: retrigger deployment from correct account
ffa2933  feat(player): persistent Spotify-style mini player with singleton SC iframe
```

---

### Known Issues / Watch Items

- Safari autoplay: FirstVisitPrompt "▶ Play" may not start audio in Safari due to cross-origin iframe autoplay restriction — no fix available at the SC Widget API level
- `sessionStorage` clears when tab is closed — prompt may re-appear on next visit (acceptable behavior per design)

---

### Next Session

Continue with Phase 4 or any outstanding content/feature work.

---

*Shift 6 recorded: 2026-04-24*
