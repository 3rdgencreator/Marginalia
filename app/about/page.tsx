import type { Metadata } from 'next';
import Image from 'next/image';
import { getAboutPage, getSiteConfig, resolveImageUrl } from '@/lib/db/queries';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutPage();
  const description = about?.body ? about.body.slice(0, 160) : 'About Marginalia.';
  return {
    title: 'About | Marginalia',
    description,
  };
}

export default async function AboutPage() {
  const [about, siteConfig] = await Promise.all([
    getAboutPage(),
    getSiteConfig(),
  ]);

  const layloUrl = siteConfig?.layloUrl ?? null;
  const photoSrc = resolveImageUrl(about?.photo, '/images/about/');

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
      <div className="mx-auto max-w-[65ch]">

        {photoSrc && (
          <div className="w-full mb-(--space-xl) overflow-hidden">
            <Image
              src={photoSrc}
              alt="Elif, Marginalia"
              width={1200}
              height={675}
              sizes="(max-width: 65ch) 100vw, 65ch"
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        {about?.body && (
          <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed whitespace-pre-line">
            {about.body}
          </div>
        )}

        {layloUrl && (
          <div className="mt-(--space-xl) flex justify-center">
            <a
              href={layloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#580AFF] to-[#9B30FF] text-white hover:from-[#4A08D6] hover:to-[#8B25EE] transition-all duration-150"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span className="text-sm font-semibold tracking-tight">Join the community</span>
            </a>
          </div>
        )}

      </div>
      </Container>
    </RandomBackground>
  );
}
