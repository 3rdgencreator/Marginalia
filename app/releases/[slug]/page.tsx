import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import {
  plainTextFromDocument,
  buildSoundCloudEmbedUrl,
} from '@/lib/releases';
import Container from '@/components/layout/Container';
import ReleaseMetaHeader from '@/components/releases/ReleaseMetaHeader';
import LayloButton from '@/components/releases/LayloButton';
import PlatformIconRow from '@/components/releases/PlatformIconRow';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
import MorePlatforms from '@/components/releases/MorePlatforms';
import type { ReleasePlatform } from '@/components/releases/platform-icons';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const releases = await reader.collections.releases.list();
  return releases.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await reader.collections.releases.read(slug);
  if (!entry) return {};

  const plMeta = (entry.platformLinks ?? {}) as Record<string, string | undefined>;
  const artistStr = plMeta.artistName ?? '';
  const title = artistStr ? `${entry.title} by ${artistStr} | Marginalia` : `${entry.title} | Marginalia`;
  const descFromDoc = plainTextFromDocument(entry.description, 160);
  const description = descFromDoc
    || (artistStr
      ? `${entry.title} by ${artistStr}, out ${entry.releaseDate ?? 'soon'} on Marginalia.`
      : `${entry.title}, out ${entry.releaseDate ?? 'soon'} on Marginalia.`);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.album',
      url: `/releases/${slug}`,
      ...(entry.coverArt
        ? {
            images: [
              {
                url: `/images/releases/${entry.coverArt}`,
                width: 1200,
                height: 1200,
                alt: `${entry.title} cover artwork`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function ReleaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = await reader.collections.releases.read(slug);
  if (!entry) notFound();

  // platformLinks is the compound custom field (all URLs + UPC + artistName live there)
  const pl = (entry.platformLinks ?? {}) as Record<string, string | undefined>;

  const artistStr = pl.artistName ?? '';
  const descPlain = plainTextFromDocument(entry.description, 500);

  // Build the full platform URL map for PlatformIconRow and MorePlatforms
  const urls: Partial<Record<ReleasePlatform, string | null | undefined>> = {
    beatport: pl.beatportUrl,
    spotify: pl.spotifyUrl,
    soundcloud: pl.soundcloudUrl,
    appleMusic: pl.appleMusicUrl,
    deezer: pl.deezerUrl,
    bandcamp: pl.bandcampUrl,
    tidal: pl.tidalUrl,
    traxsource: pl.traxsourceUrl,
    juno: pl.junoUrl,
    boomkat: pl.boomkatUrl,
    amazon: pl.amazonUrl,
    youtube: pl.youtubeUrl,
    anghami: pl.anghamiUrl,
    mixcloud: pl.mixcloudUrl,
    netEase: pl.netEaseUrl,
    pandora: pl.pandoraUrl,
    saavn: pl.saavnUrl,
    facebook: pl.facebookUrl,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';
  // Use uploaded file first, fall back to iTunes CDN URL stored in platformLinks
  const coverSrc = entry.coverArt
    ? `/images/releases/${entry.coverArt}`
    : (pl.artworkUrl ? pl.artworkUrl.replace('3000x3000bb', '600x600bb') : null);
  const coverArtAbsolute = entry.coverArt
    ? `${siteUrl}/images/releases/${entry.coverArt}`
    : (pl.artworkUrl ?? null);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: entry.title,
    ...(artistStr ? { byArtist: { '@type': 'MusicGroup', name: artistStr } } : {}),
    ...(entry.releaseDate ? { datePublished: entry.releaseDate } : {}),
    ...(coverArtAbsolute ? { image: coverArtAbsolute } : {}),
    ...(descPlain ? { description: descPlain } : {}),
    url: `${siteUrl}/releases/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-12 md:py-16">
        {/* Mobile: stacked. Desktop (lg+): two-column sticky */}
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

          {/* Left column — cover art (sticky on desktop) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-[calc(var(--nav-height-desktop,_72px)_+_32px)] shrink-0">
            <div className="aspect-square w-full overflow-hidden bg-(--color-surface)">
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt={`${entry.title} cover artwork`}
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
              title={entry.title}
              artistName={pl.artistName}
              releaseDate={entry.releaseDate}
            />

            {pl.layloUrl && (
              <LayloButton
                url={pl.layloUrl}
                releaseTitle={entry.title}
                releaseDate={entry.releaseDate}
              />
            )}

            <PlatformIconRow releaseTitle={entry.title} urls={urls} />

            {pl.soundcloudUrl && (
              <SoundCloudEmbed embedUrl={buildSoundCloudEmbedUrl(pl.soundcloudUrl)} />
            )}

            {entry.description && Array.isArray(entry.description) && entry.description.length > 0 && (
              <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed">
                {descPlain}
              </div>
            )}

            {/* Secondary metadata */}
            {(entry.catalogNumber || entry.releaseType) && (
              <div className="flex flex-col gap-4 pt-8 border-t border-(--color-surface)">
                {entry.catalogNumber && (
                  <p className="text-(--text-label) text-(--color-text-secondary)">
                    {entry.catalogNumber}
                  </p>
                )}
                {entry.releaseType && (
                  <p className="text-(--text-label) text-(--color-text-secondary) capitalize">
                    {entry.releaseType}
                  </p>
                )}
              </div>
            )}

            <MorePlatforms releaseTitle={entry.title} urls={urls} />
          </div>
        </div>
      </Container>
    </>
  );
}
