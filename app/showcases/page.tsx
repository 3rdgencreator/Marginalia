import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ShowcaseCard from '@/components/showcases/ShowcaseCard';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Showcases — Marginalia',
  description: 'Marginalia live performances, showcases, and events.',
};

export default async function ShowcasesPage() {
  const all = await reader.collections.showcases.all();

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = [...all]
    .filter(s => (s.entry.date ?? '') >= today)
    .sort((a, b) => (a.entry.date ?? '').localeCompare(b.entry.date ?? ''));

  const past = [...all]
    .filter(s => (s.entry.date ?? '') < today)
    .sort((a, b) => (b.entry.date ?? '').localeCompare(a.entry.date ?? ''));

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)">
        {upcoming.map(({ slug, entry }) => (
          <li key={slug}>
            <ShowcaseCard entry={entry} variant="upcoming" />
          </li>
        ))}
        {past.map(({ slug, entry }) => (
          <li key={slug}>
            <ShowcaseCard entry={entry} variant="past" />
          </li>
        ))}
      </ul>

      {/* Both arrays empty — no events at all */}
      {upcoming.length === 0 && past.length === 0 && (
        <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
          No showcases yet.
        </p>
      )}
      </Container>
    </RandomBackground>
  );
}
