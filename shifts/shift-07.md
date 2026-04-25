# Marginalia Web Site — Shift 7

## Shift 7 — April 25, 2026

**Duration:** ~3–4 hours
**Status:** MiniPlayer Pioneer CDJ redesign, VU meter, mobile hide, ngrok setup — all shipped ✓

---

### Starting State

- MiniPlayer from Shift 6: Spotify-style volume slider, mute button, close button
- FirstVisitPrompt: text card prompt ("Want to listen our latest podcast?")
- Both worked but lacked visual identity

---

### What Was Done

#### 1. FirstVisitPrompt — Icon Redesign

Replaced the text card with a minimal floating icon:

- Removed the glass card, text, and dismiss button entirely
- Replaced with a single SVG icon (SF Symbols–style, stroke-based):
  - **Playing state:** speaker with sound waves (polygon + two arc paths)
  - **Muted/paused state:** speaker with X lines
- Position: fixed top-left, below the announcement bar (`top: calc(var(--nav-height-mobile) + 6px + 20px + 8px)`, `left: 2rem`)
- `opacity: 0.7`, no border, no background — pure icon
- Crystal/glow SVG filter (`#fvp-glow`) applied for brand-consistent purple halo
- Visibility logic: shows only before first play OR after MiniPlayer is dismissed (`!visible || (hasPlayed && !dismissed)`)
- No `sessionStorage` — reappears on every page refresh (intentional, it's an ambient UI element not an alert)

#### 2. MiniPlayer — Pioneer CDJ Transport Controls

Replaced generic play/pause/next buttons with Pioneer CDJ-2000NXS2-style circular buttons:

- **CUE button** (22×22px): brushed metal radial gradient, orange LED ring glowing when paused, dim when playing — calls `seekTo(0)` to return to track start
- **Play/Pause button** (22×22px): same metal gradient, green LED ring glowing when playing, dim when paused — calls `togglePlay()`
- **Next button** (18×18px): same gradient, neutral dim border, smaller diameter — calls `skipNext()`

LED ring implementation via `box-shadow` + `border`:
```tsx
border: `1px solid ${isPlaying ? '#14e014' : 'rgba(20,224,20,0.18)'}`,
boxShadow: isPlaying
  ? '0 0 7px rgba(20,224,20,0.75), 0 0 15px rgba(20,224,20,0.25), inset 0 0 5px rgba(0,0,0,0.7)'
  : 'inset 0 0 5px rgba(0,0,0,0.7)',
```

#### 3. MiniPlayer — Stereo VU Meter (Pioneer V10-style)

Replaced the volume slider with a simulated stereo VU meter that overflows above the player bar:

- 12 segments per channel, L/R independent animation
- Segment size: 4×4px, `borderRadius: '50%'` (round dots), gap 2px
- **Color zones (bottom → top):**
  - Segments 0–5: Marginalia lime (`#9EFF0A`)
  - Segments 6–9: white (`rgba(255,255,255,0.92)`)
  - Segments 10–11: red (`#ff2828`)
- SoundCloud iframe is cross-origin — real audio analysis impossible. Simulated with `setInterval` 60ms:
  - `nextTarget()` probability distribution: 0.6% peak (85–100), 10% high (55–75), 35% low (0–12), 54% normal (15–45)
  - Attack: +32 per tick, Decay: −18 per tick (both free to 0, no floor clamping)
  - Target update probability: 22% per tick
  - L/R channels update independently for stereo effect
- Volume scaling: `volumeRef` pattern — `setInterval` reads `volumeRef.current` to avoid stale closure without recreating the interval
- Positioned `fixed, bottom: 44` so it overflows above the bar

#### 4. MiniPlayer — Gain Knob → Replaced with Minimize Button

Initially added a Pioneer-style circular drag gain knob (SVG perimeter dot, 270° sweep, pointer capture API). After testing, replaced with:

- Apple Music-style chevron-down SVG button (`⌄`, SF Symbols stroke style)
- Calls `dismiss()` — same behavior as the old X button
- Positioned inside the right side of the bar below the VU meter

#### 5. MiniPlayer — Mobile Hidden

MiniPlayer is desktop-only. On mobile, only the FirstVisitPrompt icon handles audio interaction:

```tsx
return createPortal(
  <div className="hidden md:block">
    {/* all player content */}
  </div>,
  document.body
);
```

#### 6. Player — Intermittent Pause Fix

SC widget occasionally ignores the first `widget.play()` call (known widget behavior). Fixed by adding multiple retries in `playOnReady()` within the browser's 5-second user gesture activation window:

```ts
playOnReady() {
  if (this.widget) {
    [300, 800, 1800].forEach(delay => {
      setTimeout(() => { if (!this.state.isPlaying) this.widget?.play(); }, delay);
    });
  } else {
    this.pendingPlay = true;
  }
}
```

Each retry checks `isPlaying` first — if already playing, no-op. All three timeouts (300ms, 800ms, 1800ms) fall within the 5-second transient activation window.

#### 7. ngrok Setup for CMS Sharing

Configured ngrok for sharing the local Keystatic CMS with collaborators:

- Installed via `npm install ngrok`
- Authenticated with user's ngrok account token
- Static free domain: `grader-cope-scouts.ngrok-free.dev`
- Keystatic URL: `https://grader-cope-scouts.ngrok-free.dev/keystatic`
- Command: `npx ngrok http --domain=grader-cope-scouts.ngrok-free.dev 3000`

Keystatic remains in `local` mode (GitHub mode blocked by Cloudflare Workers issue #1497 — not applicable here on Vercel, but not switched yet). Changes made via ngrok tunnel write directly to local filesystem and are committed via git.

---

### Files Changed This Shift

```
components/layout/MiniPlayer.tsx    — CDJ transport, VU meter, gain knob → chevron, mobile hide
components/ui/FirstVisitPrompt.tsx  — icon redesign, visibility logic
lib/player-store.ts                 — playOnReady multi-retry
```

---

### Commit History

```
47e832c  feat(player): Pioneer V10-style VU meter, CDJ transport, gain knob, minimize button
717046c  fix(player): hide MiniPlayer on mobile, retry playOnReady on SC widget ignore
```

---

### Known Issues / Watch Items

- Keystatic still in `local` mode — Vercel deployment cannot save CMS changes. GitHub mode switch pending (straightforward now that we're on Vercel, not Cloudflare Workers)
- ngrok URL is static (`grader-cope-scouts.ngrok-free.dev`) but requires local dev server + ngrok running simultaneously

---

### Next Session

- Consider switching Keystatic to GitHub mode for persistent production CMS
- Continue content population and any outstanding feature work

---

*Shift 7 recorded: 2026-04-25*
