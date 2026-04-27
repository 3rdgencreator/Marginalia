import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ArtistCard from '@/components/artists/ArtistCard';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Marginalia Management | Artists',
  description: 'Marginalia Management: artist management and representation.',
};

export default async function ArtistsPage() {
  const slugs = await reader.collections.artists.list();
  const artists = (
    await Promise.all(
      slugs.map(async (slug) => {
        const entry = await reader.collections.artists.read(slug);
        return entry ? { slug, entry } : null;
      })
    )
  )
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) =>
      (a.entry.name as string).localeCompare(b.entry.name as string)
    );

  return (
    <RandomBackground>
      <Container className="py-12 md:py-16">
        {artists.length === 0 ? (
          <p className="text-(--text-body) text-(--color-text-secondary)">
            Roster coming soon.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {artists.map(({ slug, entry }) => (
              <li key={slug}>
                <ArtistCard
                  slug={slug}
                  name={entry.name as string}
                  role={entry.role}
                  photo={entry.photo}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </RandomBackground>
  );
}
