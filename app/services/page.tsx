import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';

export const metadata: Metadata = {
  title: 'Services — Marginalia',
  description: 'Artist management, mix & mastering, production classes, and mentoring by Marginalia.',
};

const SERVICES = [
  {
    title: 'Management',
    description:
      'Full artist management — bookings, strategy, brand development, and career guidance tailored for emerging and established acts in the underground dance music scene.',
  },
  {
    title: 'Mix & Mastering',
    description:
      'Professional mixing and mastering services with a deep understanding of melodic house and techno. Optimized for club systems, streaming platforms, and vinyl.',
  },
  {
    title: 'Production Classes',
    description:
      'One-on-one and group production sessions covering sound design, arrangement, workflow, and the creative process — from beginner to advanced levels.',
  },
  {
    title: 'Mentoring',
    description:
      'Direct mentoring from industry professionals inside the Marginalia network. Navigate the music industry, build your identity, and accelerate your growth as an artist.',
  },
];

export default function ServicesPage() {
  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
          <p className="mb-(--space-3xl) text-(--text-body) text-(--color-text-muted) max-w-[55ch]">
            Beyond the label — Marginalia offers a suite of professional services for artists ready to grow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="bg-(--color-bg) p-(--space-2xl) flex flex-col gap-(--space-md)"
              >
                <h2 className="text-(--text-heading) font-bold uppercase tracking-[-0.02em] text-(--color-text-primary)">
                  {service.title}
                </h2>
                <p className="text-(--text-body) text-(--color-text-muted) leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-(--space-3xl) border-l-4 border-(--color-accent-violet) pl-(--space-lg)">
            <p className="text-(--text-body) text-(--color-text-secondary)">
              Interested in working with us?
            </p>
            <a
              href="mailto:info@marginalialabel.com"
              className="inline-block mt-(--space-sm) text-(--text-label) font-bold uppercase tracking-widest text-(--color-accent-lime) hover:text-(--color-text-primary) transition-colors duration-150"
            >
              Get in touch →
            </a>
          </div>
      </Container>
    </RandomBackground>
  );
}
