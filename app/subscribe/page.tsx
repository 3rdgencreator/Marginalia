import type { Metadata } from 'next';
import { getSiteConfig } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import SubscribePanel from '@/components/subscribe/SubscribePanel';

export const metadata: Metadata = {
  title: 'Subscribe | Marginalia',
  description: 'Stay in the loop. Subscribe to our newsletter or join on Laylo.',
};

export default async function SubscribePage() {
  const config = await getSiteConfig();
  const layloUrl = config?.layloUrl ?? null;
  const newsletterListId = config?.newsletterProvider ?? null;

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col items-center justify-center py-20">
        <SubscribePanel layloUrl={layloUrl} newsletterListId={newsletterListId} />
      </Container>
    </RandomBackground>
  );
}
