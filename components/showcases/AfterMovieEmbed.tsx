'use client';

function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes('youtu.be')) {
      videoId = u.pathname.slice(1);
    } else if (u.hostname.includes('youtube.com')) {
      videoId = u.searchParams.get('v') ?? u.pathname.split('/').pop() ?? null;
    }
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  } catch {
    return null;
  }
}

export default function AfterMovieEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = youtubeEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="aspect-video w-full overflow-hidden">
      <iframe
        src={embedUrl}
        title={`${title} aftermovie`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
