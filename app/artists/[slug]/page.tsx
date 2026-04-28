import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllArtists, getArtistBySlug, resolveImageUrl } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ArtistSocialRow from '@/components/artists/ArtistSocialRow';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const artists = await getAllArtists();
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArtistBySlug(slug);
  if (!a) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';
  const description = a.bio ? a.bio.slice(0, 160) : `${a.name} on Marginalia.`;
  const photoUrl = a.photo
    ? (a.photo.startsWith('http') ? a.photo : `${siteUrl}/images/artists/${a.photo}`)
    : null;

  return {
    title: `${a.name} | Marginalia`,
    description,
    openGraph: {
      title: `${a.name} | Marginalia`,
      description,
      url: `/artists/${slug}`,
      ...(photoUrl ? { images: [{ url: photoUrl, width: 1200, height: 1200, alt: `${a.name} photo` }] } : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const a = await getArtistBySlug(slug);
  if (!a) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';
  const photoSrc = resolveImageUrl(a.photo, '/images/artists/');
  const photoUrl = a.photo
    ? (a.photo.startsWith('http') ? a.photo : `${siteUrl}/images/artists/${a.photo}`)
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: a.name,
    url: `${siteUrl}/artists/${slug}`,
    ...(a.role ? { jobTitle: a.role } : {}),
    ...(photoUrl ? { image: photoUrl } : {}),
    ...(a.bio ? { description: a.bio.slice(0, 500) } : {}),
    ...(a.instagramUrl ? { sameAs: [a.instagramUrl] } : {}),
  };

  return (
    <RandomBackground>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-12 md:py-16">
        <div className="mb-8">
          <a
            href="/artists"
            className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150 uppercase tracking-widest"
          >
            ← All Artists
          </a>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

          {/* Left — photo (sticky on desktop) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-[calc(var(--nav-height-desktop,_72px)_+_32px)] shrink-0">
            <div className="aspect-square w-full overflow-hidden bg-(--color-surface)">
              {photoSrc ? (
                <Image
                  src={photoSrc}
                  alt={`${a.name} photo`}
                  width={800}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-(--color-text-muted)">
                  {a.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Right — info */}
          <div className="mt-8 lg:mt-0 flex flex-col gap-6 lg:w-[60%]">
            <div className="flex flex-col gap-2">
              <h1 className="text-(--text-hero) text-(--color-text-primary)">
                {a.name}
              </h1>
            </div>

            <ArtistSocialRow
              soundcloudUrl={a.soundcloudUrl}
              spotifyUrl={a.spotifyUrl}
              beatportUrl={a.beatportUrl}
              instagramUrl={a.instagramUrl}
              residentAdvisorUrl={a.residentAdvisorUrl}
              youtubeUrl={a.youtubeUrl}
              layloUrl={a.layloUrl}
            />

            {a.bio && (
              <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed whitespace-pre-line">
                {a.bio}
              </div>
            )}

            {a.pressKitUrl && (
              <div>
                <a
                  href={a.pressKitUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2 border border-(--color-button) text-(--text-label) font-bold uppercase tracking-widest text-(--color-button) hover:opacity-80 transition-opacity duration-150"
                >
                  Press Kit ↓
                </a>
              </div>
            )}

            {(a.managementEmail || a.bookingEmail || a.bookingNaEmail || a.bookingRowEmail) && (
              <div className="pt-4 border-t border-(--color-surface) flex flex-col gap-2">
                {a.managementEmail && (
                  <p className="text-(--text-label) text-(--color-text-secondary)">
                    Management:{' '}
                    <a href={`mailto:${a.managementEmail}`} className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150">
                      {a.managementEmail}
                    </a>
                  </p>
                )}
                {a.bookingEmail && (
                  <p className="text-(--text-label) text-(--color-text-secondary)">
                    Booking:{' '}
                    <a href={`mailto:${a.bookingEmail}`} className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150">
                      {a.bookingEmail}
                    </a>
                  </p>
                )}
                {(a.bookingNaEmail || a.bookingRowEmail) && (
                  <p className="text-(--text-label) text-(--color-text-secondary)">
                    Booking:{' '}
                    {a.bookingNaEmail && (
                      <>NA: <a href={`mailto:${a.bookingNaEmail}`} className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150">{a.bookingNaEmail}</a></>
                    )}
                    {a.bookingNaEmail && a.bookingRowEmail && <span className="mx-2 opacity-30">·</span>}
                    {a.bookingRowEmail && (
                      <>ROW: <a href={`mailto:${a.bookingRowEmail}`} className="text-(--color-text-primary) hover:text-(--color-accent-lime) transition-colors duration-150">{a.bookingRowEmail}</a></>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

      </Container>
    </RandomBackground>
  );
}
