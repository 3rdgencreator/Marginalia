import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import ShowcaseCard from '@/components/showcases/ShowcaseCard';

export const metadata: Metadata = {
  title: 'Showcases — Marginalia',
  description: 'Marginalia live performances, showcases, and events.',
};

export default async function ShowcasesPage() {
  const all = await reader.collections.showcases.all();

  const sorted = [...all].sort((a, b) =>
    (b.entry.date ?? '').localeCompare(a.entry.date ?? '')
  );

  // status field is manually set in Keystatic — Elif must update status to 'past' after an event passes
  const upcoming = sorted.filter(s => s.entry.status === 'upcoming');
  const past = sorted.filter(s => s.entry.status === 'past');

  return (
    <Container className="py-(--space-3xl)">
      <h1 className="mb-8 text-(--text-heading) md:text-[2rem] font-bold tracking-[-0.02em] text-(--color-text-primary) uppercase">
        Showcases
      </h1>

      {/* UPCOMING section — omit entirely if no upcoming events (D-18, per UI-SPEC) */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="mb-(--space-3xl)">
          <h2
            id="upcoming-heading"
            className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-accent-lime)"
          >
            UPCOMING
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)">
            {upcoming.map(({ slug, entry }) => (
              <li key={slug}>
                <ShowcaseCard entry={entry} variant="upcoming" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PAST section */}
      {past.length > 0 && (
        <section aria-labelledby="past-heading">
          <h2
            id="past-heading"
            className="mb-(--space-xl) text-(--text-heading) font-bold uppercase text-(--color-text-secondary)"
          >
            PAST
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-lg)">
            {past.map(({ slug, entry }) => (
              <li key={slug}>
                <ShowcaseCard entry={entry} variant="past" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Both arrays empty — no events at all */}
      {upcoming.length === 0 && past.length === 0 && (
        <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
          No showcases yet.
        </p>
      )}
    </Container>
  );
}
