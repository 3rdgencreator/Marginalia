import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getAllShowcases, getShowcaseBySlug, getShowcasePhotos, resolveImageUrl } from '@/lib/db/queries';
import { buildSoundCloudEmbedUrl } from '@/lib/releases';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import SoundCloudEmbed from '@/components/releases/SoundCloudEmbed';
import ShowcaseAfterMovie from '@/components/showcases/ShowcaseAfterMovie';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const showcases = await getAllShowcases();
  return showcases.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getShowcaseBySlug(slug);
  if (!s) return {};

  const title = s.title;
  const location = [s.venue, s.city, s.country].filter(Boolean).join(', ');
  const description = `${title}${location ? ` — ${location}` : ''}${s.date ? ` · ${s.date}` : ''}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marginalialabel.com';
  const flyerSrc = resolveImageUrl(s.flyer, '/images/showcases/');
  const flyerAbsolute = flyerSrc
    ? (flyerSrc.startsWith('http') ? flyerSrc : `${siteUrl}${flyerSrc}`)
    : null;

  return {
    title: `${title} | Marginalia Showcases`,
    description,
    openGraph: {
      title: `${title} | Marginalia`,
      description,
      url: `/showcases/${slug}`,
      ...(flyerAbsolute ? { images: [{ url: flyerAbsolute, width: 1200, height: 630, alt: `${title} flyer` }] } : {}),
    },
    twitter: { card: 'summary_large_image' },
  };
}

function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.startsWith('https://') || url.startsWith('http://') ? url : null;
}

export default async function ShowcaseDetailPage({ params }: Props) {
  const { slug } = await params;
  const s = await getShowcaseBySlug(slug);
  if (!s) notFound();

  const photos = await getShowcasePhotos(s.id);

  const today = new Date().toISOString().slice(0, 10);
  const isPast = (s.date ?? '') < today;
  const location = [s.venue, s.city, s.country].filter(Boolean).join(', ');
  const flyerSrc = resolveImageUrl(s.flyer, '/images/showcases/');
  const scUrl = safeHref(s.soundcloudSetUrl);
  const aftermovieUrl = safeHref(s.aftermovieUrl);

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">

        <div className="mb-(--space-xl)">
          <a
            href="/showcases"
            className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150 uppercase tracking-widest"
          >
            ← All Showcases
          </a>
        </div>

        {/* Header */}
        <div className="mb-(--space-xl)">
          <p className="text-(--text-label) text-(--color-accent-lime) uppercase tracking-widest mb-(--space-sm)">
            {isPast ? 'Past Showcase' : 'Upcoming Showcase'}
          </p>
          <h1 className="text-(--text-hero) text-(--color-text-primary) mb-(--space-sm)">{s.title}</h1>
          <p className="text-(--text-body) text-(--color-text-secondary)">
            {location}{s.date ? ` · ${s.date}` : ''}
          </p>
        </div>

        {/* Flyer */}
        {flyerSrc && (
          <div className="w-full max-w-2xl mb-(--space-2xl) overflow-hidden">
            <Image
              src={flyerSrc}
              alt={`${s.title} flyer`}
              width={1200}
              height={1200}
              sizes="(max-width: 768px) 100vw, 672px"
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Upcoming CTAs */}
        {!isPast && (
          <div className="flex flex-wrap gap-(--space-md) mb-(--space-2xl)">
            {safeHref(s.ticketUrl) && (
              <a
                href={safeHref(s.ticketUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-(--space-lg) py-(--space-sm) bg-(--color-accent-violet) text-white text-(--text-label) font-bold uppercase hover:bg-(--color-accent-lime) hover:text-black transition-colors duration-150"
              >
                GET TICKETS
              </a>
            )}
            {safeHref(s.layloSignupUrl) && (
              <a
                href={safeHref(s.layloSignupUrl)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-(--space-lg) py-(--space-sm) border border-(--color-text-muted) text-(--color-text-secondary) text-(--text-label) font-bold uppercase hover:border-(--color-text-primary) hover:text-(--color-text-primary) transition-colors duration-150"
              >
                SAVE THE DATE
              </a>
            )}
          </div>
        )}

        {/* SoundCloud set */}
        {isPast && scUrl && (
          <div className="mb-(--space-2xl)">
            <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-md) uppercase tracking-widest">
              Listen
            </h2>
            <SoundCloudEmbed embedUrl={buildSoundCloudEmbedUrl(scUrl)} height={166} />
          </div>
        )}

        {/* Aftermovie */}
        {isPast && aftermovieUrl && (
          <div className="mb-(--space-2xl)">
            <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-md) uppercase tracking-widest">
              Aftermovie
            </h2>
            <ShowcaseAfterMovie url={aftermovieUrl} title={s.title} />
          </div>
        )}

        {/* Photo gallery */}
        {isPast && photos.length > 0 && (
          <div className="mb-(--space-2xl)">
            <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-lg) uppercase tracking-widest">
              Gallery
            </h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-(--space-md) space-y-(--space-md)">
              {photos.map((photo, i) =>
                photo.image ? (
                  <div key={photo.id} className="break-inside-avoid overflow-hidden">
                    <Image
                      src={photo.image}
                      alt={photo.caption || `${s.title} photo ${i + 1}`}
                      width={800}
                      height={600}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-auto object-cover"
                    />
                    {photo.caption && (
                      <p className="mt-(--space-xs) text-(--text-small) text-(--color-text-muted)">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

      </Container>
    </RandomBackground>
  );
}
