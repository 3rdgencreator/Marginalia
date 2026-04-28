import type { Metadata } from 'next';
import { getAllShowcases, resolveImageUrl } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Showcases | Marginalia',
  description: 'Marginalia live performances, showcases, and events.',
};

export default async function ShowcasesPage() {
  const all = await getAllShowcases();
  const withFlyer = all.filter((s) => s.flyer);

  return (
    <RandomBackground>
      <Container className="min-h-screen flex flex-col justify-center py-(--space-3xl)">
        {withFlyer.length === 0 ? (
          <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
            No showcases yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-(--space-md)">
            {withFlyer.map((s) => {
              const src = resolveImageUrl(s.flyer, '/images/showcases/');
              return (
                <Link key={s.slug} href={`/showcases/${s.slug}`} className="block group aspect-[3/4] overflow-hidden">
                  <Image
                    src={src!}
                    alt={s.title}
                    width={800}
                    height={800}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </RandomBackground>
  );
}
