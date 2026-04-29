import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface ItunesItem {
  wrapperType: string;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
  collectionViewUrl?: string;
  trackViewUrl?: string;
  releaseDate?: string;
  trackCount?: number;
}

interface OdesliEntity {
  title?: string;
  artistName?: string;
  thumbnailUrl?: string;
}

interface OdesliResponse {
  entityUniqueId: string;
  entitiesByUniqueId: Record<string, OdesliEntity>;
  linksByPlatform: Record<string, { url: string }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function hiRes(url: string | undefined | null) {
  return url?.replace(/\/\d+x\d+bb\./, '/3000x3000bb.') ?? null;
}

function detectReleaseType(rawTitle: string | null, trackCount: number, spotifyAlbumType?: string): string {
  if (spotifyAlbumType === 'single') return trackCount >= 2 ? 'ep' : 'single';
  const lc = (rawTitle ?? '').toLowerCase();
  if (lc.endsWith(' - ep') || lc.includes(' ep)') || lc.includes('(ep)')) return 'ep';
  if (lc.endsWith(' - album') || lc.endsWith(' - lp')) return 'album';
  if (lc.endsWith(' - single')) return 'single';
  if (trackCount >= 7) return 'album';
  if (trackCount >= 2) return 'ep';
  return 'single';
}

function resolveArtist(collection: ItunesItem, tracks: ItunesItem[]): string | null {
  if (collection.artistName && collection.artistName !== 'Various Artists') {
    return collection.artistName;
  }
  const splitAtoms = (s: string) =>
    s.split(', ').map(a => a.trim()).filter(a => a && a !== 'Various Artists');
  const validTracks = tracks.filter(t => t.artistName && t.artistName !== 'Various Artists');
  const base = validTracks.length > 0 ? splitAtoms(validTracks[0].artistName!) : [];
  if (validTracks.length > 1 && validTracks[1].artistName) {
    const extra = splitAtoms(validTracks[1].artistName).filter(
      a => !base.includes(a) && !base.some(b => b.includes(a) || a.includes(b))
    );
    base.push(...extra);
  }
  return base.length > 0 ? base.join(', ') : null;
}

function extractItunesId(appleMusicUrl: string): string | null {
  return appleMusicUrl.match(/\/album\/[^/]+\/(\d+)/)?.[1] ?? null;
}

function extractSpotifyAlbumId(spotifyUrl: string): string | null {
  return spotifyUrl.match(/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/)?.[1] ?? null;
}

async function fetchItunesById(id: string): Promise<{ collection: ItunesItem; tracks: ItunesItem[] } | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    const collection: ItunesItem = data.results?.find((r: ItunesItem) => r.wrapperType === 'collection');
    if (!collection) return null;
    const tracks: ItunesItem[] = data.results?.filter((r: ItunesItem) => r.wrapperType === 'track') ?? [];
    return { collection, tracks };
  } catch { return null; }
}

async function getSpotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
      next: { revalidate: 3500 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch { return null; }
}

async function fetchSpotifyAlbum(idOrUpc: string, token: string, byUpc = false) {
  try {
    const endpoint = byUpc
      ? `https://api.spotify.com/v1/search?q=upc:${encodeURIComponent(idOrUpc)}&type=album&limit=1`
      : `https://api.spotify.com/v1/albums/${idOrUpc}`;
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return byUpc ? (data.albums?.items?.[0] ?? null) : data;
  } catch { return null; }
}

// ── Route ──────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // Auth: either an admin session, or a cron-secret header (for the
  // release-day cleanup job calling itself).
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = req.headers.get('x-cron-secret');
  const isCron = cronSecret && headerSecret && headerSecret === cronSecret;
  if (!isCron) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const upc = searchParams.get('upc')?.trim();
  const url = searchParams.get('url')?.trim();

  let lookupUrl = '';
  let title: string | null = null;
  let artistName: string | null = null;
  let coverArt: string | null = null;
  let releaseDate: string | null = null;
  let releaseType: string | null = null;
  let spotifyUrlResult: string | null = null;

  const spotifyToken = await getSpotifyToken();

  if (!upc && !url) {
    return NextResponse.json({ error: 'upc or url required' }, { status: 400 });
  }

  // ── Run all available lookups in parallel ─────────────────────────────────
  const spotifyUrlAlbumId = url ? extractSpotifyAlbumId(url) : null;

  const [itunesUpcRes, spotifyByUpc, spotifyByUrl] = await Promise.all([
    upc
      ? fetch(`https://itunes.apple.com/lookup?upc=${encodeURIComponent(upc)}&entity=song`, { next: { revalidate: 0 } })
      : Promise.resolve(null),
    upc && spotifyToken ? fetchSpotifyAlbum(upc, spotifyToken, true) : Promise.resolve(null),
    spotifyUrlAlbumId && spotifyToken ? fetchSpotifyAlbum(spotifyUrlAlbumId, spotifyToken) : Promise.resolve(null),
  ]);

  // Parse iTunes UPC response
  let itunesCollection: ItunesItem | null = null;
  let itunesTracks: ItunesItem[] = [];
  if (itunesUpcRes) {
    const itunesData = await itunesUpcRes.json();
    itunesCollection = itunesData.results?.find((r: ItunesItem) => r.wrapperType === 'collection') ?? null;
    itunesTracks = itunesData.results?.filter((r: ItunesItem) => r.wrapperType === 'track') ?? [];
  }

  const spotifyAlbum = spotifyByUrl ?? spotifyByUpc ?? null; // URL preferred (direct lookup more reliable)

  if (!itunesCollection && !spotifyAlbum && !url) {
    return NextResponse.json({ error: 'UPC not found on Spotify or iTunes' }, { status: 404 });
  }

  // ── Merge: each field uses first non-null source. Order: iTunes > Spotify ──
  // (iTunes has richer track-level data; Spotify is the fallback when iTunes lacks it.)
  if (itunesCollection) {
    title = (itunesCollection.collectionName ?? '').replace(/ - (Single|EP|Album|LP)$/i, '') || null;
    artistName = resolveArtist(itunesCollection, itunesTracks);
    coverArt = hiRes(itunesCollection.artworkUrl100);
    releaseDate = itunesCollection.releaseDate ? itunesCollection.releaseDate.split('T')[0] : null;
    releaseType = detectReleaseType(itunesCollection.collectionName ?? null, itunesCollection.trackCount ?? itunesTracks.length, spotifyAlbum?.album_type);
    lookupUrl = itunesCollection.collectionViewUrl ?? itunesCollection.trackViewUrl ?? '';
  }

  if (spotifyAlbum) {
    title ??= (spotifyAlbum.name ?? '').replace(/ - (Single|EP|Album|LP)$/i, '') || null;
    artistName ??= spotifyAlbum.artists?.map((a: { name: string }) => a.name).join(', ') || null;
    coverArt ??= spotifyAlbum.images?.[0]?.url ?? null;
    releaseDate ??= spotifyAlbum.release_date?.length === 10 ? spotifyAlbum.release_date : null;
    releaseType ??= detectReleaseType(spotifyAlbum.name ?? null, spotifyAlbum.total_tracks ?? 1, spotifyAlbum.album_type);
    spotifyUrlResult = spotifyAlbum.external_urls?.spotify ?? null;
    if (!lookupUrl) lookupUrl = spotifyAlbum.external_urls?.spotify ?? '';
  }

  // If user pasted a URL but it wasn't a Spotify album URL, use it as the lookup URL for Odesli
  if (!lookupUrl && url) lookupUrl = url;

  // ── Odesli (platform links) ────────────────────────────────────────────────
  const odesliRes = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(lookupUrl)}&userCountry=US`,
    { next: { revalidate: 0 } }
  );

  let links: Record<string, { url: string }> = {};
  if (odesliRes.ok) {
    const odesli: OdesliResponse = await odesliRes.json();
    links = odesli.linksByPlatform ?? {};

    // Enrich any still-missing fields from Odesli entity + iTunes-by-id lookup
    // (Useful when input was a non-Spotify URL like Beatport/SoundCloud, OR when
    // iTunes UPC lookup failed but Odesli could resolve via the Spotify URL.)
    const stillMissing = !title || !artistName || !coverArt || !releaseDate || !releaseType;
    if (stillMissing) {
      const entity = odesli.entitiesByUniqueId?.[odesli.entityUniqueId];
      if (entity) {
        title ??= (entity.title ?? '').replace(/ - (Single|EP|Album|LP)$/i, '') || null;
        if (!artistName && entity.artistName !== 'Various Artists') artistName = entity.artistName ?? null;
        coverArt ??= hiRes(entity.thumbnailUrl);
      }
      const itunesId = links.appleMusic?.url ? extractItunesId(links.appleMusic.url) : null;
      if (itunesId) {
        const itunes = await fetchItunesById(itunesId);
        if (itunes) {
          const { collection, tracks } = itunes;
          title ??= (collection.collectionName ?? '').replace(/ - (Single|EP|Album|LP)$/i, '') || null;
          coverArt ??= hiRes(collection.artworkUrl100);
          releaseDate ??= collection.releaseDate ? collection.releaseDate.split('T')[0] : null;
          artistName ??= resolveArtist(collection, tracks);
          releaseType ??= detectReleaseType(collection.collectionName ?? null, collection.trackCount ?? tracks.length);
        }
      }
    }
  }

  // Fallback: if input was a platform URL, always include it
  const fromInput = (domain: string) => url?.includes(domain) ? url : null;

  return NextResponse.json({
    title,
    artistName,
    artworkUrl: coverArt,
    coverArt,
    releaseDate,
    releaseType,
    spotifyUrl:    spotifyUrlResult ?? links.spotify?.url    ?? fromInput('open.spotify.com'),
    appleMusicUrl: links.appleMusic?.url ?? fromInput('music.apple.com'),
    beatportUrl:   links.beatport?.url   ?? fromInput('beatport.com'),
    soundcloudUrl: links.soundcloud?.url ?? fromInput('soundcloud.com'),
    tidalUrl:      links.tidal?.url      ?? fromInput('tidal.com'),
    deezerUrl:     links.deezer?.url     ?? fromInput('deezer.com'),
    amazonUrl:     links.amazon?.url     ?? fromInput('music.amazon'),
    youtubeUrl:    links.youtube?.url    ?? fromInput('youtube.com'),
    pandoraUrl:    links.pandora?.url    ?? fromInput('pandora.com'),
    anghamiUrl:    links.anghami?.url    ?? fromInput('anghami.com'),
  });
}
