import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import { plainTextFromDocument } from '@/lib/releases';
import Container from '@/components/layout/Container';
import ArtistSocialRow from '@/components/artists/ArtistSocialRow';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const artists = await reader.collections.artists.list();
  return artists.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) return {};

  const name = entry.name as string;
  const bioPlain = plainTextFromDocument(entry.bio, 160);
  const description = bioPlain || `${name} on Marginalia.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';

  return {
    title: `${name} | Marginalia`,
    description,
    openGraph: {
      title: `${name} | Marginalia`,
      description,
      url: `/artists/${slug}`,
      ...(entry.photo
        ? {
            images: [
              {
                url: `${siteUrl}/images/artists/${entry.photo}`,
                width: 1200,
                height: 1200,
                alt: `${name} photo`,
              },
            ],
          }
        : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = await reader.collections.artists.read(slug);
  if (!entry) notFound();

  const name = entry.name as string;
  const bioPlain = plainTextFromDocument(entry.bio, 800);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${siteUrl}/artists/${slug}`,
    ...(entry.role ? { jobTitle: entry.role } : {}),
    ...(entry.photo
      ? { image: `${siteUrl}/images/artists/${entry.photo}` }
      : {}),
    ...(bioPlain ? { description: bioPlain } : {}),
    ...(entry.instagramUrl ? { sameAs: [entry.instagramUrl] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-12 md:py-16">
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

          {/* Left — photo (sticky on desktop) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-[calc(var(--nav-height-desktop,_72px)_+_32px)] shrink-0">
            <div className="aspect-square w-full overflow-hidden bg-(--color-surface)">
              {entry.photo ? (
                <Image
                  src={`/images/artists/${entry.photo}`}
                  alt={`${name} photo`}
                  width={800}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-(--color-text-muted)">
                  {name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Right — info */}
          <div className="mt-8 lg:mt-0 flex flex-col gap-6 lg:w-[60%]">
            <div className="flex flex-col gap-2">
              <h1 className="text-(--text-hero) text-(--color-text-primary)">
                {name}
              </h1>
              {entry.role && (
                <p className="text-(--text-label) text-(--color-text-secondary) uppercase tracking-widest">
                  {entry.role}
                </p>
              )}
            </div>

            <ArtistSocialRow
              soundcloudUrl={entry.soundcloudUrl}
              spotifyUrl={entry.spotifyUrl}
              beatportUrl={entry.beatportUrl}
              instagramUrl={entry.instagramUrl}
              residentAdvisorUrl={entry.residentAdvisorUrl}
              youtubeUrl={entry.youtubeUrl}
              layloUrl={entry.layloUrl}
            />

            {bioPlain && (
              <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed whitespace-pre-line">
                {bioPlain}
              </div>
            )}

            {entry.bookingEmail && (
              <div className="pt-4 border-t border-(--color-surface)">
                <p className="text-(--text-label) text-(--color-text-secondary)">
                  Booking:{' '}
                  <a
                    href={`mailto:${entry.bookingEmail}`}
                    className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150"
                  >
                    {entry.bookingEmail}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
