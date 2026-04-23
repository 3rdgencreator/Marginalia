import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ReleaseGrid from '@/components/releases/ReleaseGrid';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Releases — Marginalia',
  description:
    'The Marginalia catalog — melodic house, techno, and underground dance music from Barcelona.',
};

export default async function ReleasesPage() {
  const releases = await reader.collections.releases.all();

  const sorted = [...releases].sort((a, b) => {
    const aDate = a.entry.releaseDate ?? '';
    const bDate = b.entry.releaseDate ?? '';
    return bDate.localeCompare(aDate);
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
                No releases have been published yet. Check back soon — new music
                drops monthly.
              </p>
            </div>
          ) : (
            <ReleaseGrid
              releases={sorted.map(({ slug, entry }) => ({
                slug,
                entry: {
                  title: entry.title,
                  artistName: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artistName,
                  coverArt: entry.coverArt,
                  artworkUrl: ((entry.platformLinks ?? {}) as Record<string, string | undefined>).artworkUrl,
                },
              }))}
            />
          )}
        </Container>
    </RandomBackground>
  );
}
