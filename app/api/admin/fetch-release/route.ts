import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

interface OdesliEntity {
  title?: string;
  artistName?: string;
  thumbnailUrl?: string;
}

interface OdesliResponse {
  entitiesByUniqueId: Record<string, OdesliEntity>;
  linksByPlatform: Record<string, { url: string }>;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const upc = searchParams.get('upc')?.trim();
  const url = searchParams.get('url')?.trim();

  let lookupUrl: string;

  if (upc) {
    const res = await fetch(
      `https://itunes.apple.com/lookup?upc=${encodeURIComponent(upc)}&limit=1`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();
    const item = data.results?.[0];
    if (!item) return NextResponse.json({ error: 'UPC bulunamadı' }, { status: 404 });
    lookupUrl = item.collectionViewUrl ?? item.trackViewUrl;
    if (!lookupUrl) return NextResponse.json({ error: 'Apple Music linki yok' }, { status: 404 });
  } else if (url) {
    lookupUrl = url;
  } else {
    return NextResponse.json({ error: 'upc veya url gerekli' }, { status: 400 });
  }

  const odesliRes = await fetch(
    `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(lookupUrl)}&userCountry=US`,
    { next: { revalidate: 0 } }
  );
  if (!odesliRes.ok) return NextResponse.json({ error: 'Odesli isteği başarısız' }, { status: 502 });

  const odesli: OdesliResponse = await odesliRes.json();
  const entity = Object.values(odesli.entitiesByUniqueId)[0];
  const links = odesli.linksByPlatform ?? {};

  const rawThumb = entity?.thumbnailUrl ?? '';
  const coverArt = rawThumb.replace(/\/\d+x\d+bb\./, '/3000x3000bb.');

  return NextResponse.json({
    title: entity?.title ?? null,
    artistName: entity?.artistName ?? null,
    artworkUrl: rawThumb || null,
    coverArt: coverArt || null,
    spotifyUrl: links.spotify?.url ?? null,
    appleMusicUrl: links.appleMusic?.url ?? null,
    beatportUrl: links.beatport?.url ?? null,
    soundcloudUrl: links.soundcloud?.url ?? null,
    tidalUrl: links.tidal?.url ?? null,
    deezerUrl: links.deezer?.url ?? null,
    amazonUrl: links.amazon?.url ?? null,
    youtubeUrl: links.youtube?.url ?? null,
    pandoraUrl: links.pandora?.url ?? null,
    anghamiUrl: links.anghami?.url ?? null,
  });
}
