import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { freeDownloads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import DownloadGate, { type DownloadItem } from '@/components/downloads/DownloadGate';

export const metadata: Metadata = {
  title: 'Free Downloads | Marginalia',
  description: 'Free music from Marginalia. Exclusive downloads for the community.',
};

export default async function FreeDownloadsPage() {
  const all = await db.select().from(freeDownloads)
    .where(eq(freeDownloads.active, true));

  const items: DownloadItem[] = all
    .sort((a, b) => {
      if (!a.releaseDate && !b.releaseDate) return 0;
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return b.releaseDate.localeCompare(a.releaseDate);
    })
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      artistName: d.artistName ?? '',
      description: d.description ?? '',
      coverImage: d.coverImage ?? null,
      downloadUrl: d.soundcloudDownloadUrl ?? null,
      releaseDate: d.releaseDate ?? null,
    }));

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
