import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import DemoForm from '@/components/demos/DemoForm';

export const metadata: Metadata = {
  title: 'Demo Submission | Marginalia',
  description: 'Submit your music to Marginalia. Share a private SoundCloud link and we will listen.',
};

export default async function DemoPage() {
  const demoPage = await reader.singletons.demoPage.read();
  const introNodes = demoPage?.intro ? await demoPage.intro() : null;
  const heading = demoPage?.heading ?? 'Submit a Demo';
  const acceptingDemos = demoPage?.acceptingDemos ?? true;

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col items-center justify-center py-24">
        <DemoForm heading={heading} introNodes={introNodes} acceptingDemos={acceptingDemos} />
      </Container>
    </RandomBackground>
  );
}
