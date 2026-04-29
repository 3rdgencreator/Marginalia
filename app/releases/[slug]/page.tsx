import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllReleases, getReleaseBySlug, resolveImageUrl } from '@/lib/db/queries';
import { buildSoundCloudEmbedUrl } from '@/lib/releases';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ReleaseMetaHeader from '@/components/releases/ReleaseMetaHeader';
import LayloButton from '@/components/releases/LayloButton';
import PlatformIconRow from '@/components/releases/PlatformIconRow';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
import MorePlatforms from '@/components/releases/MorePlatforms';
import type { ReleasePlatform } from '@/components/releases/platform-icons';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const releases = await getAllReleases();
  return releases.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = await getReleaseBySlug(slug);
  if (!r) return {};

  const artistStr = r.artistName ?? '';
  const title = artistStr ? `${r.title} by ${artistStr} | Marginalia` : `${r.title} | Marginalia`;
  const description = r.description
    ? r.description.slice(0, 160)
    : (artistStr
      ? `${r.title} by ${artistStr}, out ${r.releaseDate ?? 'soon'} on Marginalia.`
      : `${r.title}, out ${r.releaseDate ?? 'soon'} on Marginalia.`);

  const coverSrc = resolveImageUrl(r.coverArt, '/images/releases/') ?? r.artworkUrl ?? null;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.album',
      url: `/releases/${slug}`,
      ...(coverSrc ? { images: [{ url: coverSrc, width: 1200, height: 1200, alt: `${r.title} cover artwork` }] } : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = await getReleaseBySlug(slug);
  if (!r) notFound();

  const artistStr = r.artistName ?? '';

  const urls: Partial<Record<ReleasePlatform, string | null | undefined>> = {
    beatport: r.beatportUrl,
    spotify: r.spotifyUrl,
    soundcloud: r.soundcloudUrl,
    appleMusic: r.appleMusicUrl,
    deezer: r.deezerUrl,
    bandcamp: r.bandcampUrl,
    tidal: r.tidalUrl,
    traxsource: r.traxsourceUrl,
    juno: r.junoUrl,
    boomkat: r.boomkatUrl,
    amazon: r.amazonUrl,
    youtube: r.youtubeUrl,
    anghami: r.anghamiUrl,
    mixcloud: r.mixcloudUrl,
    netEase: r.netEaseUrl,
    pandora: r.pandoraUrl,
    saavn: r.saavnUrl,
    facebook: r.soundcloudPodcastUrl,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';
  const coverSrc = (resolveImageUrl(r.coverArt, '/images/releases/') ?? r.artworkUrl)
    ?.replace('3000x3000bb', '600x600bb') ?? null;
  const coverArtAbsolute = r.coverArt
    ? (r.coverArt.startsWith('http') ? r.coverArt : `${siteUrl}/images/releases/${r.coverArt}`)
    : (r.artworkUrl ?? null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: r.title,
    ...(artistStr ? { byArtist: { '@type': 'MusicGroup', name: artistStr } } : {}),
    ...(r.releaseDate ? { datePublished: r.releaseDate } : {}),
    ...(coverArtAbsolute ? { image: coverArtAbsolute } : {}),
    ...(r.description ? { description: r.description.slice(0, 500) } : {}),
    url: `${siteUrl}/releases/${slug}`,
  };

  return (
    <>
      {coverSrc && (
        <link rel="preload" as="image" href={coverSrc} fetchPriority="high" />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RandomBackground>
      <Container className="py-12 md:py-16">
        <div className="mb-8">
          <a
            href="/releases"
            className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150 uppercase tracking-widest"
          >
            ← All Releases
          </a>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

          {/* Left column — cover art (sticky on desktop) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-[calc(var(--nav-height-desktop,_72px)_+_32px)] shrink-0">
            <div className="aspect-square w-full overflow-hidden bg-(--color-surface)">
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt={`${r.title} cover artwork`}
                  width={800}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-(--text-label) text-(--color-text-muted)">
                  No artwork
                </div>
              )}
            </div>
          </div>

          {/* Right column — metadata + content */}
          <div className="mt-8 lg:mt-0 flex flex-col gap-8 lg:w-[60%]">

            <ReleaseMetaHeader
              title={r.title}
              artistName={r.artistName ?? undefined}
              releaseDate={r.releaseDate}
            />

            {r.layloUrl && (
              <LayloButton
                url={r.layloUrl}
                releaseTitle={r.title}
                releaseDate={r.releaseDate}
              />
            )}

            <PlatformIconRow releaseTitle={r.title} urls={urls} />

            {r.soundcloudUrl && (
              <SoundCloudEmbed embedUrl={buildSoundCloudEmbedUrl(r.soundcloudUrl)} />
            )}

            {r.description && (
              <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed whitespace-pre-line">
                {r.description}
              </div>
            )}

            {(r.catalogNumber || r.releaseType) && (
              <div className="flex flex-col gap-4 pt-8 border-t border-(--color-surface)">
                {r.catalogNumber && (
                  <p className="text-(--text-label) text-(--color-text-secondary)">
                    {r.catalogNumber}
                  </p>
                )}
                {r.releaseType && (
                  <p className="text-(--text-label) text-(--color-text-secondary) capitalize">
                    {r.releaseType}
                  </p>
                )}
              </div>
            )}

            <MorePlatforms releaseTitle={r.title} urls={urls} />
          </div>
        </div>

      </Container>
      </RandomBackground>
    </>
  );
}
