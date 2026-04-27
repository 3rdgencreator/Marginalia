import Image from 'next/image';
import Link from 'next/link';
import { reader } from '@/lib/keystatic';
import { resolveNavbarColor } from '@/lib/navbar-colors';
import Container from './Container';
import Logo from '@/components/ui/Logo';
import SocialIcon, { type Platform } from '@/components/ui/SocialIcon';
import NewsletterForm from './NewsletterForm';

export default async function SiteFooter() {
  const config = await reader.singletons.siteConfig.read();

  const socials: Array<{ platform: Platform; url: string | null | undefined }> = [
    { platform: 'instagram', url: config?.instagramUrl },
    { platform: 'soundcloud', url: config?.soundcloudUrl },
    { platform: 'beatport', url: config?.beatportUrl },
    { platform: 'youtube', url: config?.youtubeUrl },
    { platform: 'tiktok', url: config?.tiktokUrl },
    { platform: 'facebook', url: config?.facebookUrl },
  ];
  const newsletterListId = config?.newsletterProvider ?? null;
  const year = new Date().getFullYear();

  const manualSlugs = (config?.footerPresaveSlugs ?? []).slice(0, 2);

  const slugsToShow: string[] = manualSlugs.length > 0
    ? manualSlugs
    : await (async () => {
        const allSlugs = await reader.collections.releases.list();
        const withDates = (
          await Promise.all(
            allSlugs.map(async (slug) => {
              const r = await reader.collections.releases.read(slug);
              return r ? { slug, releaseDate: r.releaseDate ?? '' } : null;
            })
          )
        ).filter(Boolean) as Array<{ slug: string; releaseDate: string }>;
        return withDates
          .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate))
          .slice(0, 2)
          .map((r) => r.slug);
      })();

  const presaveReleases = (
    await Promise.all(
      slugsToShow.map(async (slug) => {
        const release = await reader.collections.releases.read(slug);
        if (!release) return null;
        const coverSrc = release.coverArt
          ? `/images/releases/${release.coverArt}`
          : (release.platformLinks as { artworkUrl?: string })?.artworkUrl ?? null;
        const layloUrl = (release.platformLinks as { layloUrl?: string })?.layloUrl ?? null;
        const artistName = (release.platformLinks as { artistName?: string })?.artistName ?? null;
        return { slug, title: release.title, artistName, coverSrc, layloUrl };
      })
    )
  ).filter(Boolean) as Array<{ slug: string; title: string; artistName: string | null; coverSrc: string | null; layloUrl: string | null }>;

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
                New releases, free downloads &amp; events — straight to your inbox.
              </p>
              <NewsletterForm listId={newsletterListId} />
            </div>
          </div>

          {/* Column 2 — Connect (mobile only) + Pre-Save Releases */}
          <div className="flex flex-col gap-6">
            {/* Connect — mobile only */}
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

            {/* Pre-Save Releases */}
            {presaveReleases.length > 0 && (
              <div>
                <h2 className="text-(--text-label) text-(--color-text-primary) font-bold mb-3 uppercase tracking-widest text-[10px]">
                  Pre-Save
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {presaveReleases.map(({ slug, title, artistName, coverSrc, layloUrl }) => (
                    <div key={slug} className="group flex flex-col gap-2" style={{ width: 112, flexShrink: 0 }}>
                      <Link href={`/releases/${slug}`} className="relative bg-white/10 overflow-hidden" style={{ display: 'block', width: 112, height: 112, flexShrink: 0 }}>
                        {coverSrc && (
                          <Image
                            src={coverSrc}
                            alt={title}
                            width={112}
                            height={112}
                            style={{ width: 112, height: 112, objectFit: 'cover' }}
                          />
                        )}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 bg-[rgba(31,31,33,0.70)] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          {artistName && (
                            <span className="text-[9px] text-white uppercase tracking-widest text-center line-clamp-1">{artistName}</span>
                          )}
                          <span className="text-[10px] font-bold text-white text-center line-clamp-2">{title}</span>
                        </div>
                      </Link>
                      <p className="text-[11px] text-(--color-text-primary) leading-tight line-clamp-2">{title}</p>
                      {layloUrl && (
                        <Link
                          href={layloUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold uppercase tracking-widest text-(--color-bg) bg-(--color-accent-lime) px-2 py-1 text-center hover:opacity-80 transition-opacity"
                        >
                          Pre-Save
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
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
