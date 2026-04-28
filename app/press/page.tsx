import type { Metadata } from 'next';
import { getAllPress } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import PressEntry from '@/components/press/PressEntry';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Press | Marginalia',
  description: 'Press coverage, reviews, and interviews featuring Marginalia.',
};

export default async function PressPage() {
  const entries = await getAllPress();

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
        {entries.length === 0 ? (
          <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
            No press coverage yet.
          </p>
        ) : (
          <ul role="list" className="divide-y divide-(--color-surface)">
            {entries.map((p) => (
              <li key={p.id}>
                <PressEntry entry={{
                  headline: p.headline,
                  publication: p.publication ?? '',
                  date: p.date ?? null,
                  url: p.url ?? null,
                  excerpt: p.excerpt ?? null,
                  type: (p.type ?? 'feature') as 'review' | 'interview' | 'feature' | 'mention' | 'chart',
                }} />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </RandomBackground>
  );
}
