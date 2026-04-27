import { NextRequest, NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface RawTrack {
  id?: number;
  title?: string;
  artwork_url?: string | null;
  duration?: number;
  user?: { username?: string } | null;
  permalink_url?: string;
}

function mapTrack(t: RawTrack) {
  return {
    title: t.title ?? '',
    artwork_url: t.artwork_url ?? null,
    duration: t.duration ?? 0,
    username: t.user?.username ?? '',
    permalink_url: t.permalink_url ?? '',
  };
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  const cleanUrl = rawUrl.split('?')[0];

  try {
    const html = await fetch(cleanUrl, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.text());

    // Extract hydration JSON
    const idx = html.indexOf('window.__sc_hydration = ');
    const match = idx !== -1 ? html.slice(idx).match(/window\.__sc_hydration\s*=\s*(\[[\s\S]+?\]);\s*<\/script>/) : null;
    if (!match) return NextResponse.json({ error: 'hydration not found' }, { status: 502 });

    const hydration = JSON.parse(match[1]) as Array<{ hydratable: string; data: unknown }>;

    // client_id lives in the apiClient hydration entry
    const apiClientEntry = hydration.find(e => e.hydratable === 'apiClient');
    const clientId = (apiClientEntry?.data as { id?: string } | undefined)?.id ?? null;

    const playlistEntry = hydration.find(e => e.hydratable === 'playlist');
    if (!playlistEntry) return NextResponse.json({ error: 'playlist entry not found' }, { status: 502 });

    const tracks: RawTrack[] = (playlistEntry.data as { tracks?: RawTrack[] }).tracks ?? [];
    const fullTracks = tracks.filter(t => t.title && t.duration);
    const stubIds = tracks.filter(t => !t.title && t.id).map(t => t.id as number);

    if (stubIds.length > 0 && clientId) {
      const CHUNK = 50;
      const fetched: RawTrack[] = [];
      for (let i = 0; i < stubIds.length; i += CHUNK) {
        const ids = stubIds.slice(i, i + CHUNK).join(',');
        try {
          const res = await fetch(
            `https://api-v2.soundcloud.com/tracks?ids=${ids}&client_id=${clientId}`,
            { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }
          );
          if (res.ok) {
            const data: RawTrack[] = await res.json();
            fetched.push(...data);
          }
        } catch { /* skip chunk on error */ }
      }

      // Rebuild in original playlist order
      const fetchedMap = new Map(fetched.map(t => [t.id, t]));
      const ordered = tracks.map(t =>
        t.title && t.duration ? t : (t.id ? fetchedMap.get(t.id) ?? null : null)
      ).filter((t): t is RawTrack => t !== null && !!(t.title && t.duration));

      return NextResponse.json(ordered.map(mapTrack), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    return NextResponse.json(fullTracks.map(mapTrack), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('soundcloud-playlist error:', err);
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
