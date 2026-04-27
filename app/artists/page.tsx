import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ArtistCard from '@/components/artists/ArtistCard';

export const metadata: Metadata = {
  title: 'Roster | Marginalia',
  description: 'The Marginalia artist roster.',
};

export default async function ArtistsPage() {
  const slugs = await reader.collections.artists.list();
  const artists = (
    await Promise.all(
      slugs.map(async (slug) => {
        const entry = await reader.collections.artists.read(slug);
        if (!entry) return null;
        return { slug, entry };
      })
    )
  )
    .filter((a): a is NonNullable<typeof a> => a !== null && a.entry.featured !== false)
    .sort((a, b) =>
      (a.entry.name as string).localeCompare(b.entry.name as string)
    );

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col justify-center py-12 md:py-16">
        {artists.length === 0 ? (
          <p className="text-(--text-body) text-(--color-text-secondary)">
            Roster coming soon.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-(--space-sm) max-w-4xl mx-auto">
            {artists.map(({ slug, entry }) => (
              <li key={slug}>
                <ArtistCard
                  slug={slug}
                  name={entry.name as string}
                  role={entry.role ?? null}
                  photo={entry.photo ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </RandomBackground>
  );
}
