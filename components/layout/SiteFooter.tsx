import Link from 'next/link';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import { resolveNavbarColor } from '@/lib/navbar-colors';
import Container from './Container';
import Logo from '@/components/ui/Logo';
import SocialIcon, { type Platform } from '@/components/ui/SocialIcon';
import NewsletterForm from './NewsletterForm';

export default async function SiteFooter() {
  const [config, allReleases] = await Promise.all([
    reader.singletons.siteConfig.read(),
    reader.collections.releases.all(),
  ]);

  const socials: Array<{ platform: Platform; url: string | null | undefined }> = [
    { platform: 'instagram', url: config?.instagramUrl },
    { platform: 'soundcloud', url: config?.soundcloudUrl },
    { platform: 'beatport', url: config?.beatportUrl },
    { platform: 'youtube', url: config?.youtubeUrl },
    { platform: 'tiktok', url: config?.tiktokUrl },
    { platform: 'facebook', url: config?.facebookUrl },
  ];

  const presaves = allReleases
    .filter(({ entry }) => entry.presave === true)
    .map(({ slug, entry }) => {
      const pl = (entry.platformLinks ?? {}) as Record<string, string | undefined>;
      const src = entry.coverArt
        ? `/images/releases/${entry.coverArt}`
        : pl.artworkUrl?.replace('3000x3000bb', '600x600bb') ?? null;
      return { slug, title: entry.title, artistName: pl.artistName ?? null, src };
    });

  const newsletterListId = config?.newsletterProvider ?? null;
  const year = new Date().getFullYear();

  return (
    <footer
      className="pt-12 pb-8 mt-auto"
      style={{ backgroundColor: resolveNavbarColor(config?.footerColor ?? 'surface') }}
      aria-label="Site footer"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1 — Brand + Newsletter */}
          <div>
            <Logo className="h-10 w-auto text-(--color-text-primary)" />
            <div
              id="newsletter"
              className="mt-6 border border-white/70 bg-white/10 backdrop-blur-sm px-4 py-3 max-w-xs"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-primary) mb-1">
                Newsletter
              </p>
              <p className="text-[11px] text-(--color-text-secondary) leading-relaxed mb-0">
                New releases, free downloads &amp; events, straight to your inbox.
              </p>
              <NewsletterForm listId={newsletterListId} />
            </div>
          </div>

          {/* Column 2 — Pre-Saves + Connect (mobile) */}
          <div className="flex flex-col gap-6">
            {/* Mobile connect */}
            <div className="md:hidden">
              <h2 className="text-(--text-label) text-(--color-text-primary) font-bold mb-3">
                Connect
              </h2>
              <ul className="flex flex-wrap gap-1">
                {socials.map(({ platform, url }) => (
                  <li key={platform}>
                    <SocialIcon platform={platform} url={url} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Pre-Save releases */}
            {presaves.length > 0 && (
              <div className="mt-6">
              <ul
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(auto-fill, minmax(${Math.max(80, Math.min(130, Math.floor(400 / presaves.length)))}px, 1fr))`,
                }}
              >
                {presaves.map(({ slug, title, artistName, src }) => (
                  <li key={slug}>
                    <Link
                      href={`/releases/${slug}`}
                      aria-label={artistName ? `${title} by ${artistName}` : title}
                      className="group relative block aspect-square overflow-hidden border-2 border-white/70 bg-white/10"
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={title}
                          width={120}
                          height={120}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-(--color-text-muted)">
                          {title[0]}
                        </span>
                      )}
                      {/* Pre-Save badge */}
                      <span
                        style={{
                          position: 'absolute', top: 6, left: 6,
                          background: 'var(--color-accent-lime)',
                          color: '#000',
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          padding: '2px 5px',
                          textTransform: 'uppercase',
                          pointerEvents: 'none',
                          zIndex: 2,
                        }}
                      >
                        Pre-Save
                      </span>
                      {/* Hover overlay */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 hidden md:flex flex-col items-center justify-center gap-1 p-2 bg-[rgba(31,31,33,0.70)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-200 ease-out"
                      >
                        <span className="text-[10px] font-bold text-center text-white leading-tight">{title}</span>
                        {artistName && (
                          <span className="text-[9px] text-white/70 text-center">{artistName}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-(--text-label) text-(--color-text-secondary)">
            © {year} Marginalia. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
