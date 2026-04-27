import { NextRequest, NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface RawTrack {
  id?: number;
  title?: string;
  artwork_url?: string | null;
  duration?: number;
  user?: { username?: string } | null;
  permalink_url?: string;
}

interface CachedResult {
  tracks: ReturnType<typeof mapTrack>[];
  at: number;
}

const cache = new Map<string, CachedResult>();

function mapTrack(t: RawTrack) {
  return {
    title: t.title ?? '',
    artwork_url: t.artwork_url ?? null,
    duration: t.duration ?? 0,
    username: t.user?.username ?? '',
    permalink_url: t.permalink_url ?? '',
  };
}

async function fetchAllTracks(cleanUrl: string): Promise<ReturnType<typeof mapTrack>[]> {
  const html = await fetch(cleanUrl, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(10000),
  }).then(r => r.text());

  const idx = html.indexOf('window.__sc_hydration = ');
  const match = idx !== -1 ? html.slice(idx).match(/window\.__sc_hydration\s*=\s*(\[[\s\S]+?\]);\s*<\/script>/) : null;
  if (!match) throw new Error('hydration not found');

  const hydration = JSON.parse(match[1]) as Array<{ hydratable: string; data: unknown }>;

  const clientId = (hydration.find(e => e.hydratable === 'apiClient')?.data as { id?: string } | undefined)?.id ?? null;
  const playlistEntry = hydration.find(e => e.hydratable === 'playlist');
  if (!playlistEntry) throw new Error('playlist not found');

  const tracks: RawTrack[] = (playlistEntry.data as { tracks?: RawTrack[] }).tracks ?? [];
  const fullTracks = tracks.filter(t => t.title && t.duration);
  const stubIds = tracks.filter(t => !t.title && t.id).map(t => t.id as number);

  if (stubIds.length === 0 || !clientId) return fullTracks.map(mapTrack);

  const CHUNK = 50;
  const fetched: RawTrack[] = [];
  for (let i = 0; i < stubIds.length; i += CHUNK) {
    const ids = stubIds.slice(i, i + CHUNK).join(',');
    try {
      const res = await fetch(
        `https://api-v2.soundcloud.com/tracks?ids=${ids}&client_id=${clientId}`,
        { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(8000) }
      );
      if (res.ok) fetched.push(...(await res.json() as RawTrack[]));
    } catch { /* skip chunk */ }
  }

  const fetchedMap = new Map(fetched.map(t => [t.id, t]));
  return tracks
    .map(t => t.title && t.duration ? t : (t.id ? fetchedMap.get(t.id) ?? null : null))
    .filter((t): t is RawTrack => t !== null && !!(t.title && t.duration))
    .map(mapTrack);
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  const cleanUrl = rawUrl.split('?')[0];

  const cached = cache.get(cleanUrl);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return NextResponse.json(cached.tracks, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  }

  try {
    const tracks = await fetchAllTracks(cleanUrl);
    cache.set(cleanUrl, { tracks, at: Date.now() });
    return NextResponse.json(tracks, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    console.error('soundcloud-playlist error:', err);
    // Return stale cache if available rather than an error
    if (cached) return NextResponse.json(cached.tracks);
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
