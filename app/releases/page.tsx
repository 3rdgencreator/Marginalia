import type { Metadata } from 'next';
import { getAllReleases, resolveImageUrl } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import ReleaseGrid from '@/components/releases/ReleaseGrid';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Releases | Marginalia',
  description:
    'The Marginalia catalog: melodic house, techno, and underground dance music from Barcelona.',
};

export default async function ReleasesPage() {
  const releases = await getAllReleases();

  const sorted = releases.map((r) => ({
    slug: r.slug,
    entry: {
      title: r.title,
      artistName: r.artistName ?? undefined,
      coverArt: resolveImageUrl(r.coverArt, '/images/releases/'),
      artworkUrl: r.artworkUrl ?? undefined,
      presave: r.presave ?? false,
      badgeText: r.badgeText || null,
      releaseDate: r.releaseDate ?? '',
    },
  }));

  return (
    <RandomBackground>
      <Container className="py-12 md:py-16">
        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="mb-4 text-(--text-heading) font-bold text-(--color-text-primary)">
              Catalog is loading.
            </h2>
            <p className="text-(--text-body) text-(--color-text-muted)">
              No releases have been published yet. Check back soon. New music drops monthly.
            </p>
          </div>
        ) : (
          <ReleaseGrid releases={sorted} />
        )}
      </Container>
    </RandomBackground>
  );
}
