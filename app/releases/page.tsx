import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ReleaseGrid from '@/components/releases/ReleaseGrid';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Releases | Marginalia',
  description:
    'The Marginalia catalog: melodic house, techno, and underground dance music from Barcelona.',
};

export default async function ReleasesPage() {
  const releases = await reader.collections.releases.all();

  const mapped = releases.map(({ slug, entry }) => {
    const pl = (entry.platformLinks ?? {}) as Record<string, string | undefined>;
    return {
      slug,
      entry: {
        title: entry.title,
        artistName: pl.artistName,
        coverArt: entry.coverArt,
        artworkUrl: pl.artworkUrl,
        presave: entry.presave === true,
        badgeText: entry.badgeText || null,
        releaseDate: entry.releaseDate ?? '',
      },
    };
  });

  // Pre-saves first, then by date descending
  const sorted = [...mapped].sort((a, b) => {
    if (a.entry.presave && !b.entry.presave) return -1;
    if (!a.entry.presave && b.entry.presave) return 1;
    return b.entry.releaseDate.localeCompare(a.entry.releaseDate);
  });

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
