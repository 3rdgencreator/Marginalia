import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import Logo from '@/components/ui/Logo';
import ReleaseCard from '@/components/releases/ReleaseCard';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import HeroYouTube from '@/components/ui/HeroYouTube';

// Extract YouTube video ID via regex and build a safe embed URL.
// The raw CMS URL is NEVER used directly as an iframe src — only the
// constructed youtube.com/embed/{ID}?{params} URL reaches the DOM.
function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function buildYouTubeEmbedUrl(url: string | null | undefined, startSecond?: number | null, mobile = false): string | null {
  if (!url) return null;
  const isShorts = url.includes('/shorts/');
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    rel: '0',
    iv_load_policy: '3',
    modestbranding: '1',
  });
  if (!mobile || !isShorts) {
    // Shorts don't support playlist loop — skip for mobile Shorts
    params.set('loop', '1');
    params.set('playlist', match[1]);
    params.set('controls', '0');
    params.set('showinfo', '0');
  }
  if (startSecond) params.set('start', String(startSecond));
  return `https://www.youtube.com/embed/${match[1]}?${params.toString()}`;
}

export const metadata: Metadata = {
  title: 'Marginalia',
  description: 'Barcelona-based melodic house and techno record label.',
};

export default async function HomePage() {
  // Singleton read — .read() returns null if content/home.yaml is missing or empty.
  // NEVER use .readOrThrow() — home.yaml may be seeded but not filled.
  const [homeData, siteConfig] = await Promise.all([
    reader.singletons.homePage.read(),
    reader.singletons.siteConfig.read(),
  ]);

  const heroDesktop = (homeData?.heroVideoDesktop as { r2Url?: string; file?: string; youtubeUrl?: string } | null | undefined) ?? null;
  const heroMobile = (homeData?.heroVideoMobile as { r2Url?: string; file?: string; youtubeUrl?: string } | null | undefined) ?? null;
  const heroVideoStartSecond = homeData?.heroVideoStartSecond ?? null;
  const beatportAccolade = homeData?.beatportAccolade ?? null;
  const heroLayloEmbedUrl = homeData?.heroLayloEmbedUrl ?? null;

  // Priority: R2 URL → uploaded file → YouTube fallback
  const desktopFile = heroDesktop?.r2Url ?? heroDesktop?.file ?? null;
  const mobileFile = heroMobile?.r2Url ?? heroMobile?.file ?? null;

  // Build YouTube embed URL server-side — only used when no direct video is set.
  const desktopEmbedUrl = !desktopFile ? buildYouTubeEmbedUrl(heroDesktop?.youtubeUrl, heroVideoStartSecond) : null;
  const mobileEmbedUrl = !mobileFile ? buildYouTubeEmbedUrl(heroMobile?.youtubeUrl, null, true) : null;
  const desktopYouTubeId = !desktopFile ? extractYouTubeId(heroDesktop?.youtubeUrl) : null;
  const desktopThumbnailUrl = desktopYouTubeId ? `https://i.ytimg.com/vi/${desktopYouTubeId}/maxresdefault.jpg` : null;

  // Featured releases — filter by featured=true flag (per D-07, NOT featuredReleaseSlug).
  const allReleases = await reader.collections.releases.all();
  const featured = allReleases
    .filter(({ entry }) => entry.featured === true)
    .map(({ slug, entry }) => {
      const pl = (entry.platformLinks ?? {}) as Record<string, string | undefined>;
      return {
        slug,
        entry: {
          title: entry.title,
          coverArt: entry.coverArt,
          artistName: pl.artistName,
          artworkUrl: pl.artworkUrl,
          presave: true,
          badgeText: entry.badgeText || null,
        },
      };
    });

  return (
    <main>
      {siteConfig?.announcementActive && siteConfig.announcementText && (
        <AnnouncementBar
          text={siteConfig.announcementText}
          url={siteConfig.announcementUrl ?? null}
        />
      )}

      {/* <SplashScreen /> */}
      {/* HERO — full viewport, YouTube video background, Logo centered */}
      <section className="relative h-[100dvh] overflow-hidden bg-(--color-bg)">
        {/* Desktop — direct MP4 (priority) */}
        {desktopFile && (
          <div className="hidden md:block absolute inset-0 overflow-hidden">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'max(120vw, calc(120dvh * 16 / 9))', height: 'max(120dvh, calc(120vw * 9 / 16))' }}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={`${desktopFile}#t=0.001`} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', imageRendering: 'auto', willChange: 'transform' }} />
            </div>
          </div>
        )}
        {/* Desktop — YouTube embed with thumbnail poster */}
        {!desktopFile && desktopEmbedUrl && desktopThumbnailUrl && (
          <div className="hidden md:block absolute inset-0 overflow-hidden">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'max(120vw, calc(120dvh * 16 / 9))', height: 'max(120dvh, calc(120vw * 9 / 16))' }}>
              <HeroYouTube embedUrl={desktopEmbedUrl} thumbnailUrl={desktopThumbnailUrl} />
            </div>
          </div>
        )}
        {/* Mobile — direct MP4 (priority) */}
        {mobileFile && (
          <div className="block md:hidden absolute inset-0 overflow-hidden">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'max(120vw, calc(120dvh * 9 / 16))', height: 'max(120dvh, calc(120vw * 16 / 9))' }}>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={`${mobileFile}#t=0.001`} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            </div>
          </div>
        )}
        {/* Mobile — YouTube embed fallback */}
        {!mobileFile && mobileEmbedUrl && (
          <div className="block md:hidden absolute inset-0 overflow-hidden">
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'max(120vw, calc(120dvh * 9 / 16))', height: 'max(120dvh, calc(120vw * 16 / 9))' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                src={mobileEmbedUrl}
                title="Marginalia hero background video (mobile)"
                aria-hidden="true"
                allow="autoplay; encrypted-media"
                loading="eager"
              />
            </div>
          </div>
        )}
        {/* Logo centered over video */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo className="h-16 md:h-24 w-auto" />
        </div>
        {/* Laylo CTA — bottom-center */}
        {heroLayloEmbedUrl && (
          <div style={{ position: 'absolute', bottom: '9rem', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <a
              href={heroLayloEmbedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150"
            >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                <span className="text-sm font-semibold tracking-tight">Join the community</span>
            </a>
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

    </main>
  );
}
