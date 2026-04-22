export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();
  if (!q) return Response.json({ error: 'Missing q param' }, { status: 400 });

  // Accept raw UPC digits OR any platform URL
  const songUrl = /^https?:\/\//i.test(q) ? q : `upc:${q}`;

  try {
    const res = await fetch(
      `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(songUrl)}&userCountry=TR`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      const body = await res.text();
      return Response.json(
        { error: `Odesli returned ${res.status}`, detail: body },
        { status: res.status }
      );
    }
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json(
      { error: 'Network error', detail: String(err) },
      { status: 500 }
    );
  }
}
