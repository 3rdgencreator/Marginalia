import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ServicesContent from '@/components/services/ServicesContent';

export const metadata: Metadata = {
  title: 'Services — Marginalia',
  description: 'Artist management, mix & mastering, production classes, and mentoring by Marginalia.',
};

export default function ServicesPage() {
  return (
    <RandomBackground>
      <Container className="py-12">
        <ServicesContent />
      </Container>
    </RandomBackground>
  );
}
