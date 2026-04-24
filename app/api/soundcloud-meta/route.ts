import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Marginalia/1.0' },
      // 8s timeout — SoundCloud oEmbed can be slow
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `SoundCloud returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({
      title: data.title ?? null,
      artistName: data.author_name ?? null,
      artworkUrl: data.thumbnail_url ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
