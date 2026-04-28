import type { Metadata } from 'next';
import { getAllArtists, resolveImageUrl } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ArtistCard from '@/components/artists/ArtistCard';

export const metadata: Metadata = {
  title: 'Roster | Marginalia',
  description: 'The Marginalia artist roster.',
};

export default async function ArtistsPage() {
  const all = await getAllArtists();
  const artists = all.filter((a) => a.featured !== false);

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col justify-center py-12 md:py-16">
        {artists.length === 0 ? (
          <p className="text-(--text-body) text-(--color-text-secondary)">
            Roster coming soon.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-(--space-sm) max-w-4xl mx-auto">
            {artists.map((a) => (
              <li key={a.slug}>
                <ArtistCard
                  slug={a.slug}
                  name={a.name}
                  role={a.role ?? null}
                  photo={resolveImageUrl(a.photo, '/images/artists/')}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </RandomBackground>
  );
}
