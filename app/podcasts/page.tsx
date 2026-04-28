import type { Metadata } from 'next';
import { getAllPodcasts, getAllArtists, getSiteConfig } from '@/lib/db/queries';
import { buildSoundCloudEmbedUrl, buildSoundCloudPlaylistEmbedUrl } from '@/lib/releases';
import Container from '@/components/layout/Container';
import PodcastAccordion from '@/components/podcasts/PodcastAccordion';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Podcasts & Mixes | Marginalia',
  description: 'Exclusive mixes, DJ sets, and podcast episodes from Marginalia.',
};

export default async function PodcastsPage() {
  const [all, allArtists, siteConfig] = await Promise.all([
    getAllPodcasts(),
    getAllArtists(),
    getSiteConfig(),
  ]);

  const artistMap = Object.fromEntries(allArtists.map((a) => [a.slug, a.name]));

  const playlistEmbedUrl = siteConfig?.soundcloudPlaylistUrl
    ? buildSoundCloudPlaylistEmbedUrl(siteConfig.soundcloudPlaylistUrl)
    : null;

  // CRITICAL: Build embed URLs here in the server component.
  // lib/releases.ts has `import 'server-only'` — calling buildSoundCloudEmbedUrl
  // inside PodcastAccordion or PodcastRow would cause a build-time error.
  const episodes = all.map((p) => ({
    slug: p.slug,
    title: p.title,
    artistName: p.artistSlug ? (artistMap[p.artistSlug] ?? p.artistSlug) : null,
    date: p.date ?? null,
    description: p.description ?? null,
    coverImage: p.coverImage ?? null,
    embedUrl: p.soundcloudUrl ? buildSoundCloudEmbedUrl(p.soundcloudUrl) : null,
  }));

  return (
    <RandomBackground>
      <Container className="podcast-light-borders min-h-screen flex flex-col justify-center py-20">
        {episodes.length === 0 && !playlistEmbedUrl ? (
          <p className="py-16 text-(--text-body) text-(--color-text-muted)">
            No episodes yet.
          </p>
        ) : (
          <PodcastAccordion
            episodes={episodes}
            playlistEmbedUrl={playlistEmbedUrl}
            playlistUrl={siteConfig?.soundcloudPlaylistUrl ?? null}
          />
        )}
      </Container>
    </RandomBackground>
  );
}
