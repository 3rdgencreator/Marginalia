import { NextRequest, NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface RawTrack {
  title?: string;
  artwork_url?: string | null;
  duration?: number;
  user?: { username?: string } | null;
  permalink_url?: string;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  // Strip tracking params — SoundCloud resolves cleanly without them
  const cleanUrl = rawUrl.split('?')[0];

  try {
    const html = await fetch(cleanUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.text());

    // Extract hydration JSON embedded in the page
    const idx = html.indexOf('window.__sc_hydration = ');
    const match = idx !== -1 ? html.slice(idx).match(/window\.__sc_hydration\s*=\s*(\[[\s\S]+?\]);\s*<\/script>/) : null;
    if (!match) return NextResponse.json({ error: 'hydration not found' }, { status: 502 });

    const hydration = JSON.parse(match[1]) as Array<{ hydratable: string; data: { tracks?: RawTrack[] } }>;
    const entry = hydration.find(e => e.hydratable === 'playlist');
    if (!entry) return NextResponse.json({ error: 'playlist entry not found' }, { status: 502 });

    const tracks: RawTrack[] = entry.data?.tracks ?? [];
    // SoundCloud hydration only includes full data for the first ~5 tracks — filter stubs
    const result = tracks
      .filter(t => t.title && t.duration)
      .map(t => ({
        title: t.title ?? '',
        artwork_url: t.artwork_url ?? null,
        duration: t.duration ?? 0,
        username: t.user?.username ?? '',
        permalink_url: t.permalink_url ?? '',
      }));

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('soundcloud-playlist error:', err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
