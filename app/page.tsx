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
    playlist: match[1],
    playsinline: '1',
    rel: '0',
    showinfo: '0',
    iv_load_policy: '3',
    modestbranding: '1',
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
  const heroLayloEmbedUrl = homeData?.heroLayloEmbedUrl ?? null;

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

      {/* <SplashScreen /> */}
      {/* HERO — full viewport, YouTube video background, Logo centered */}
      <section className="relative h-[100dvh] overflow-hidden bg-(--color-bg)">
        {/* Desktop video — 300% wide trick clips YouTube title/logo at edges */}
        {desktopEmbedUrl && (
          <div className="hidden md:block absolute inset-0 overflow-hidden" style={{ opacity: 0.8 }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(120vw, calc(120dvh * 16 / 9))',
              height: 'max(120dvh, calc(120vw * 9 / 16))',
            }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                src={desktopEmbedUrl}
                title="Marginalia hero background video"
                aria-hidden="true"
                allow="autoplay; encrypted-media"
                loading="eager"
              />
            </div>
          </div>
        )}
        {/* Mobile video — same trick */}
        {mobileEmbedUrl && (
          <div className="block md:hidden absolute inset-0 overflow-hidden" style={{ opacity: 0.8 }}>
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(120vw, calc(120dvh * 16 / 9))',
              height: 'max(120dvh, calc(120vw * 9 / 16))',
            }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                src={mobileEmbedUrl}
                title="Marginalia hero background video"
                aria-hidden="true"
                allow="autoplay; encrypted-media"
                loading="eager"
              />
            </div>
          </div>
        )}
        {/* Dark overlay — ensures logo legibility over video */}
        <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
        {/* SVG filter defs — shared by logo and CTA button.
            NOTE: width/height must be > 0 for iOS Safari to render the defs. */}
        <svg
          width="1"
          height="1"
          aria-hidden="true"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        >
          <defs>
            <filter id="crystal-outline" x="-50%" y="-150%" width="200%" height="400%">
              <feMorphology in="SourceAlpha" result="expanded" operator="dilate" radius="16" />
              <feGaussianBlur in="expanded" result="softEdge" stdDeviation="28" />
              <feFlood floodColor="rgba(202,201,249,0.45)" result="color" />
              <feComposite in="color" in2="softEdge" operator="in" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
            <filter id="crystal-outline-pill" x="-50%" y="-200%" width="200%" height="500%">
              <feMorphology in="SourceAlpha" result="expanded" operator="dilate" radius="5" />
              <feGaussianBlur in="expanded" result="softEdge" stdDeviation="10" />
              <feFlood floodColor="rgba(202,201,249,0.5)" result="color" />
              <feComposite in="color" in2="softEdge" operator="in" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
        </svg>
        {/* Logo centered over video — SVG morphology organic glass shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ filter: 'url(#crystal-outline)', WebkitFilter: 'url(#crystal-outline)' }}>
            <Logo className="h-16 md:h-24 w-auto" />
          </div>
        </div>
        {/* Laylo CTA — bottom-center */}
        {heroLayloEmbedUrl && (
          <div style={{ position: 'absolute', bottom: '5rem', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ filter: 'url(#crystal-outline-pill)', WebkitFilter: 'url(#crystal-outline-pill)', display: 'inline-block' }}>
              <a
                href={heroLayloEmbedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-full px-5 py-3 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150"
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                <span className="text-sm font-semibold tracking-tight">Stay in the loop</span>
              </a>
            </div>
          </div>
        )}
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
                <ArtistCard slug={slug} name={entry.name} role={entry.role ?? null} photo={entry.photo ?? null} />
              </li>
            ))}
          </ul>
        </Container>
      )}
    </main>
  );
}
