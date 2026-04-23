// Proxy: fetches an image URL server-side and streams it back.
// Used by the Keystatic admin to inject cover art without CORS issues.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url || !/^https?:\/\//i.test(url)) {
    return new Response('Missing or invalid url param', { status: 400 });
  }
  try {
    const upstream = await fetch(url, { cache: 'no-store' });
    if (!upstream.ok) {
      return new Response('Upstream fetch failed', { status: 502 });
    }
    const contentType = upstream.headers.get('content-type') ?? 'image/jpeg';
    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    return new Response(String(err), { status: 500 });
  }
}
