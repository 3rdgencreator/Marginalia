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
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  // ── UPC path ──────────────────────────────────────────────────────────────
  if (upc) {
    const [itunesRes, spotifyAlbum] = await Promise.all([
      fetch(`https://itunes.apple.com/lookup?upc=${encodeURIComponent(upc)}&entity=song`, { next: { revalidate: 0 } }),
      spotifyToken ? fetchSpotifyAlbum(upc, spotifyToken, true) : Promise.resolve(null),
    ]);

    const itunesData = await itunesRes.json();
    const collection: ItunesItem = itunesData.results?.find((r: ItunesItem) => r.wrapperType === 'collection');
    const tracks: ItunesItem[] = itunesData.results?.filter((r: ItunesItem) => r.wrapperType === 'track') ?? [];

    if (!collection) return NextResponse.json({ error: 'UPC not found on iTunes' }, { status: 404 });
    lookupUrl = collection.collectionViewUrl ?? collection.trackViewUrl ?? '';
    if (!lookupUrl) return NextResponse.json({ error: 'No Apple Music link found for this UPC' }, { status: 404 });

    title = (collection.collectionName ?? '').replace(/ - (Single|EP|Album|LP)$/i, '') || null;
    artistName = resolveArtist(collection, tracks);
    coverArt = hiRes(collection.artworkUrl100);
    releaseDate = collection.releaseDate ? collection.releaseDate.split('T')[0] : null;
    releaseType = detectReleaseType(collection.collectionName ?? null, collection.trackCount ?? tracks.length, spotifyAlbum?.album_type);
    spotifyUrlResult = spotifyAlbum?.external_urls?.spotify ?? null;

  // ── URL path ──────────────────────────────────────────────────────────────
  } else if (url) {
    lookupUrl = url;

    // If Spotify URL: get full metadata directly from Spotify API
    const spotifyAlbumId = extractSpotifyAlbumId(url);
    if (spotifyAlbumId && spotifyToken) {
      const album = await fetchSpotifyAlbum(spotifyAlbumId, spotifyToken);
      if (album) {
        title = album.name ?? null;
        artistName = album.artists?.map((a: { name: string }) => a.name).join(', ') || null;
        coverArt = album.images?.[0]?.url ?? null;
        releaseDate = album.release_date?.length === 10 ? album.release_date : null;
        releaseType = detectReleaseType(album.name, album.total_tracks ?? 1, album.album_type);
        spotifyUrlResult = album.external_urls?.spotify ?? url;
      }
    }
  } else {
    return NextResponse.json({ error: 'upc or url required' }, { status: 400 });
  }

  // ── Odesli (platform links) ────────────────────────────────────────────────
  const odesliRes = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(lookupUrl)}&userCountry=US`,
    { next: { revalidate: 0 } }
  );

  let links: Record<string, { url: string }> = {};
  if (odesliRes.ok) {
    const odesli: OdesliResponse = await odesliRes.json();
    links = odesli.linksByPlatform ?? {};

    // For non-Spotify URL path: fill metadata from Odesli + iTunes
    if (!upc && !extractSpotifyAlbumId(url ?? '')) {
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
