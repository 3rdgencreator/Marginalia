import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import PressEntry from '@/components/press/PressEntry';

export const metadata: Metadata = {
  title: 'Press — Marginalia',
  description: 'Press coverage, reviews, and interviews featuring Marginalia.',
};

export default async function PressPage() {
  const entries = await reader.collections.press.all();

  const sorted = [...entries].sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
  );

  return (
    <Container className="py-(--space-3xl)">
      <h1 className="mb-8 text-(--text-heading) md:text-[2rem] font-bold tracking-[-0.02em] text-(--color-text-primary) uppercase">
        Press
      </h1>

      {sorted.length === 0 ? (
        <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
          No press coverage yet.
        </p>
      ) : (
        <ul role="list" className="divide-y divide-(--color-surface)">
          {sorted.map(({ slug, entry }) => (
            <li key={slug}>
              <PressEntry entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
