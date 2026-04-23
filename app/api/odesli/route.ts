// UPC flow:
//   1. iTunes lookup (no auth) → Apple Music URL + title/artist metadata
//   2. Spotify: UPC search first, then title+artist fallback
//   3. Deezer: title+artist search (free, no auth)
//   4. Odesli with Spotify URL → Tidal, Pandora, etc.
//   5. Inject Apple Music + Deezer into result if Odesli missed them
// URL flow: pass directly to Odesli

type ItunesResult = {
  collectionViewUrl: string;
  collectionName: string;
  artistName: string;
  releaseDate: string;
  releaseType: string;
  artworkUrl: string;
} | null;

async function itunesLookupByUpc(upc: string): Promise<ItunesResult> {
  const res = await fetch(
    `https://itunes.apple.com/lookup?upc=${encodeURIComponent(upc)}&entity=album`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.results?.[0];
  if (!item?.collectionViewUrl) return null;
  const rawDate: string = item.releaseDate ?? '';
  const releaseDate = rawDate ? rawDate.slice(0, 10) : '';
  const collectionName: string = (item.collectionName as string) ?? '';
  // Derive release type from iTunes name suffix
  let releaseType = 'album';
  if (/\s*-\s*Single$/i.test(collectionName)) releaseType = 'single';
  else if (/\s*-\s*EP$/i.test(collectionName)) releaseType = 'ep';
  else if (/\s*-\s*Compilation$/i.test(collectionName)) releaseType = 'compilation';
  // Upgrade artwork to highest resolution (iTunes returns 100x100 by default)
  const rawArtwork: string = (item.artworkUrl100 as string) ?? '';
  const artworkUrl = rawArtwork.replace(/\d+x\d+bb(\.\w+)$/, '3000x3000bb$1');
  return {
    collectionViewUrl: item.collectionViewUrl as string,
    collectionName,
    artistName: (item.artistName as string) ?? '',
    releaseDate,
    releaseType,
    artworkUrl,
  };
}

async function getSpotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const { access_token } = await res.json();
  return (access_token as string) ?? null;
}

async function spotifySearch(query: string, token: string): Promise<string | null> {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.albums?.items?.[0]?.external_urls?.spotify ?? null;
}

async function spotifyUrlForUpc(
  upc: string,
  fallbackTitle?: string,
  fallbackArtist?: string
): Promise<string | null> {
  const token = await getSpotifyToken();
  if (!token) return null;
  const byUpc = await spotifySearch(`upc:${upc}`, token);
  if (byUpc) return byUpc;
  if (fallbackTitle && fallbackArtist) {
    return spotifySearch(`${fallbackTitle} ${fallbackArtist}`, token);
  }
  return null;
}

async function deezerUrlByTitle(title: string, artist: string): Promise<string | null> {
  // Strip iTunes suffixes like " - Single", " - EP", " - Album" before searching
  const cleanTitle = title.replace(/\s*-\s*(Single|EP|Album|Compilation)$/i, '').trim();
  const q = encodeURIComponent(`${cleanTitle} ${artist}`);
  const res = await fetch(
    `https://api.deezer.com/search/album?q=${q}&limit=1`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.[0]?.link ?? null;
}

async function queryOdesli(url: string): Promise<{ ok: boolean; data: unknown }> {
  const res = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}&userCountry=TR`,
    { cache: 'no-store' }
  );
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function injectIfMissing(
  byPlatform: Record<string, unknown>,
  key: string,
  url: string | null | undefined
) {
  if (url && !byPlatform[key]) {
    byPlatform[key] = { url };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  if (!q) return Response.json({ error: 'Missing q param' }, { status: 400 });

  const isUrl = /^https?:\/\//i.test(q);
  const normalized = isUrl ? q : q.replace(/[\s\-]/g, '');

  try {
    if (isUrl) {
      const { ok, data } = await queryOdesli(normalized);
      if (ok) return Response.json(data);
      return Response.json(
        { error: 'Release not found — try a different platform URL' },
        { status: 400 }
      );
    }

    // Step 1: iTunes (no auth) — fast, great UPC coverage, returns metadata
    const itunes = await itunesLookupByUpc(normalized);

    // Steps 2+3: Spotify + Deezer in parallel using iTunes metadata
    const [spotifyUrl, deezerUrl] = await Promise.all([
      spotifyUrlForUpc(normalized, itunes?.collectionName, itunes?.artistName),
      itunes?.collectionName && itunes?.artistName
        ? deezerUrlByTitle(itunes.collectionName, itunes.artistName)
        : Promise.resolve(null),
    ]);

    // Step 4: Odesli with Spotify URL for best multi-platform coverage
    const platformUrl = spotifyUrl ?? itunes?.collectionViewUrl;

    if (platformUrl) {
      const { ok, data } = await queryOdesli(platformUrl);
      if (ok) {
        const d = data as Record<string, unknown>;
        const byPlatform = (d.linksByPlatform ?? {}) as Record<string, unknown>;
        injectIfMissing(byPlatform, 'appleMusic', itunes?.collectionViewUrl);
        injectIfMissing(byPlatform, 'deezer', deezerUrl);
        d.linksByPlatform = byPlatform;
        if (itunes) {
          d.meta = {
            title: itunes.collectionName.replace(/\s*-\s*(Single|EP|Album|Compilation)$/i, '').trim(),
            artist: itunes.artistName,
            releaseDate: itunes.releaseDate,
            releaseType: itunes.releaseType,
            artworkUrl: itunes.artworkUrl || undefined,
          };
        }
        return Response.json(d);
      }
    }

    // Last resort: Odesli direct UPC
    const { ok, data } = await queryOdesli(`upc:${normalized}`);
    if (ok) return Response.json(data);

    return Response.json(
      { error: 'Release not found — try pasting a platform URL (Spotify, Apple Music) directly' },
      { status: 400 }
    );
  } catch (err) {
    return Response.json(
      { error: 'Network error — check your connection', detail: String(err) },
      { status: 500 }
    );
  }
}
