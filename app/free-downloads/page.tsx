import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import DownloadGate, { type DownloadItem } from '@/components/downloads/DownloadGate';
import type { SoundcloudDownloadValue } from '@/lib/soundcloud-download-field';

export const metadata: Metadata = {
  title: 'Free Downloads | Marginalia',
  description: 'Free music from Marginalia. Exclusive downloads for the community.',
};

export default async function FreeDownloadsPage() {
  const allDownloads = await reader.collections.freeDownloads.all();

  const items: DownloadItem[] = allDownloads
    .filter(({ entry }) => entry.active !== false)
    .sort((a, b) => {
      if (!a.entry.releaseDate && !b.entry.releaseDate) return 0;
      if (!a.entry.releaseDate) return 1;
      if (!b.entry.releaseDate) return -1;
      return b.entry.releaseDate.localeCompare(a.entry.releaseDate);
    })
    .map(({ slug, entry }) => {
      const sc = entry.soundcloudDownload as SoundcloudDownloadValue;
      return {
        slug,
        title: entry.title,
        artistName: entry.artistName ?? '',
        description: entry.description ?? '',
        coverImage: entry.coverImage
          ? `/images/downloads/${entry.coverImage}`
          : (sc?.artworkUrl ?? null),
        downloadUrl: sc?.url ?? null,
        releaseDate: entry.releaseDate ?? null,
      };
    });

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
        {items.length === 0 ? (
          <div className="mx-auto max-w-[75ch]">
            <p className="text-(--color-text-muted) text-sm">
              No free downloads available yet. Check back soon.
            </p>
          </div>
        ) : (
          <DownloadGate items={items} />
        )}
      </Container>
    </RandomBackground>
  );
}
