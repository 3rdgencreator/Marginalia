import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import Logo from '@/components/ui/Logo';
import ReleaseCard from '@/components/releases/ReleaseCard';
import ArtistCard from '@/components/artists/ArtistCard';

// Extract YouTube video ID via regex and build a safe embed URL.
// The raw CMS URL is NEVER used directly as an iframe src — only the
// constructed youtube.com/embed/{ID}?{params} URL reaches the DOM.
function buildYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    controls: '0',
    playlist: match[1], // Required for loop=1 to work on YouTube iframes
    playsinline: '1',
    rel: '0',
  });
  return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
}

export const metadata: Metadata = {
  title: 'Marginalia',
  description: 'Barcelona-based melodic house and techno record label.',
};

export default async function HomePage() {
  // Singleton read — .read() returns null if content/home.yaml is missing or empty.
  // NEVER use .readOrThrow() — home.yaml may be seeded but not filled.
  const homeData = await reader.singletons.homePage.read();

  const heroVideoUrl = homeData?.heroVideoUrl ?? null;
  const heroVideoMobileUrl = homeData?.heroVideoMobileUrl ?? null;
  const beatportAccolade = homeData?.beatportAccolade ?? null;
  const featuredArtistSlugs = homeData?.featuredArtistSlugs ?? [];

  // Build YouTube embed URLs server-side — extract video ID via regex, never pass raw URL as src.
  const desktopEmbedUrl = buildYouTubeEmbedUrl(heroVideoUrl);
  const mobileEmbedUrl = buildYouTubeEmbedUrl(heroVideoMobileUrl);

  // Featured releases — filter by featured=true flag (per D-07, NOT featuredReleaseSlug).
  const allReleases = await reader.collections.releases.all();
  const featured = allReleases
    .filter(({ entry }) => entry.featured === true)
    .map(({ slug, entry }) => ({
      slug,
      entry: {
        title: entry.title,
        artistSlugs: entry.artistSlugs,
        coverArt: entry.coverArt,
      },
    }));

  // Artist teaser — filter by featuredArtistSlugs if non-empty, otherwise show all (per D-08).
  const artistSlugs = await reader.collections.artists.list();
  const allArtists = (
    await Promise.all(
      artistSlugs.map(async (slug) => {
        const entry = await reader.collections.artists.read(slug);
        return entry ? { slug, entry } : null;
      })
    )
  ).filter((a): a is NonNullable<typeof a> => a !== null);

  const artists =
    Array.isArray(featuredArtistSlugs) && featuredArtistSlugs.length > 0
      ? allArtists.filter(({ slug }) => featuredArtistSlugs.includes(slug))
      : allArtists;

  return (
    <main>
      {/* HERO — full viewport, YouTube video background, Logo centered */}
      <section className="relative h-[100dvh] overflow-hidden bg-(--color-bg)">
        {/* Desktop video (16:9) — hidden on mobile, visible on md+ */}
        {desktopEmbedUrl && (
          <iframe
            className="hidden md:block absolute inset-0 w-full h-full"
            src={desktopEmbedUrl}
            title="Marginalia hero background video"
            aria-hidden="true"
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        )}
        {/* Mobile video (9:16) — visible on mobile, hidden on md+ */}
        {mobileEmbedUrl && (
          <iframe
            className="block md:hidden absolute inset-0 w-full h-full"
            src={mobileEmbedUrl}
            title="Marginalia hero background video"
            aria-hidden="true"
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        )}
        {/* Dark overlay — ensures logo legibility over video */}
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        {/* Logo centered absolutely over video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo className="h-16 md:h-24 w-auto" />
        </div>
      </section>

      {/* BEATPORT ACCOLADE BADGE — omit section entirely when field is empty (per D-06) */}
      {beatportAccolade && (
        <div className="border-l-4 border-(--color-accent-violet) bg-(--color-surface) px-(--space-lg) py-(--space-md)">
          <p className="text-(--text-label) font-bold uppercase text-(--color-text-primary) tracking-wide">
            HYPE LABEL OF THE MONTH
          </p>
          <p className="text-(--text-label) text-(--color-text-secondary)">{beatportAccolade}</p>
        </div>
      )}

      {/* FEATURED RELEASES GRID — omit section entirely when no featured releases (per D-07) */}
      {featured.length > 0 && (
        <Container className="py-(--space-3xl)">
          <h2 className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-text-primary)">
            RELEASES
          </h2>
          {/* CRITICAL: Do NOT use ReleaseGrid here — it has catalog density (5 cols).
              Homepage uses its own grid per UI-SPEC: 2 cols mobile → 4 cols desktop. */}
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)">
            {featured.map(({ slug, entry }) => (
              <li key={slug}>
                <ReleaseCard slug={slug} entry={entry} />
              </li>
            ))}
          </ul>
        </Container>
      )}

      {/* ARTIST ROSTER TEASER — always shown when artists exist (per D-08) */}
      {artists.length > 0 && (
        <Container className="py-(--space-3xl)">
          <h2 className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-text-primary)">
            ARTISTS
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-(--space-sm)">
            {artists.map(({ slug, entry }) => (
              <li key={slug}>
                <ArtistCard slug={slug} entry={entry} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </main>
  );
}
