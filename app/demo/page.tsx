import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { demoPage } from '@/lib/db/schema';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import DemoForm from '@/components/demos/DemoForm';

export const metadata: Metadata = {
  title: 'Demo Submission | Marginalia',
  description: 'Submit your music to Marginalia. Share a private SoundCloud link and we will listen.',
};

export default async function DemoPage() {
  const [page] = await db.select().from(demoPage).limit(1);
  const heading = page?.heading ?? 'Submit a Demo';
  const acceptingDemos = page?.acceptingDemos ?? true;
  const intro = page?.intro ?? null;

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col items-center justify-center py-24">
        <DemoForm heading={heading} intro={intro} acceptingDemos={acceptingDemos} />
      </Container>
    </RandomBackground>
  );
}
