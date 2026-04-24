import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import { buildSoundCloudEmbedUrl, buildSoundCloudPlaylistEmbedUrl, resolveArtistNames } from '@/lib/releases';
import Container from '@/components/layout/Container';
import PodcastAccordion from '@/components/podcasts/PodcastAccordion';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Podcasts & Mixes — Marginalia',
  description: 'Exclusive mixes, DJ sets, and podcast episodes from Marginalia.',
};

export default async function PodcastsPage() {
  const [all, siteConfig] = await Promise.all([
    reader.collections.podcasts.all(),
    reader.singletons.siteConfig.read(),
  ]);

  const playlistEmbedUrl = siteConfig?.soundcloudPlaylistUrl
    ? buildSoundCloudPlaylistEmbedUrl(siteConfig.soundcloudPlaylistUrl)
    : null;

  // Sort date descending — newest episodes first (per D-13)
  const sorted = [...all].sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
  );

  // CRITICAL: Build embed URLs here in the server component.
  // lib/releases.ts has `import 'server-only'` — calling buildSoundCloudEmbedUrl
  // inside PodcastAccordion or PodcastRow would cause a build-time error.
  const episodes = await Promise.all(
    sorted.map(async ({ slug, entry }) => {
      const artistName = entry.artistSlug
        ? (await resolveArtistNames([entry.artistSlug]))[0] ?? entry.artistSlug
        : null;
      return {
        slug,
        title: entry.title,
        artistName,
        date: entry.date ?? null,
        description: entry.description ?? null,
        coverImage: entry.coverImage ?? null,
        embedUrl: entry.soundcloudUrl ? buildSoundCloudEmbedUrl(entry.soundcloudUrl) : null,
      };
    })
  );

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col justify-center py-20">
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
