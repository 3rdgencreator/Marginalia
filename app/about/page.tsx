import type { Metadata } from 'next';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import { plainTextFromDocument } from '@/lib/releases';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import AboutBody from '@/components/about/AboutBody';

export async function generateMetadata(): Promise<Metadata> {
  const about = await reader.singletons.about.read();
  const body = about?.body ? await about.body() : null;
  const description = plainTextFromDocument(body, 160) || 'About Marginalia.';
  return {
    title: 'About | Marginalia',
    description,
  };
}

export default async function AboutPage() {
  // CRITICAL: Use .read() NOT .readOrThrow() — about.yaml may not be populated
  const about = await reader.singletons.about.read();
  // body is stored as a separate .mdoc file — must call as function to get nodes
  const body = about?.body ? await about.body() : null;
  const siteConfig = await reader.singletons.siteConfig.read();
  const layloUrl = siteConfig?.layloUrl ?? null;

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
      <div className="mx-auto max-w-[65ch]">

        {/* Optional photo of Elif — render only if photo field is set */}
        {about?.photo && (
          <div className="w-full mb-(--space-xl) overflow-hidden">
            <Image
              src={`/images/about/${about.photo}`}
              alt="Elif, Marginalia"
              width={1200}
              height={675}
              sizes="(max-width: 65ch) 100vw, 65ch"
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        {Array.isArray(body) && body.length > 0 ? (
          <AboutBody nodes={body} />
        ) : null}

        {/* When body is empty, page renders headline + photo only — no filler text (per D-24) */}

        {/* Press card — Mixmag feature */}
        <div
          className="not-prose mt-(--space-xl) border border-white/70 px-4 py-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#E3000B' }}>
            Featured in Mixmag
          </p>
          <p className="text-sm text-(--color-text-secondary) mb-3">
            &ldquo;ELIF is on a meteoric rise and you can&apos;t lose sight of her&rdquo;
          </p>
          <a
            href="https://mixmag.com.br/feature/turkish-artist-elif-is-on-a-meteoric-rise-and-you-cant-lose-sight-of-her"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#E3000B',
              padding: '6px 18px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Read the feature →
          </a>
        </div>

        {/* Stay in the loop — Laylo CTA */}
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
              <span className="text-sm font-semibold tracking-tight">Stay in the loop</span>
            </a>
          </div>
        )}

      </div>
      </Container>
    </RandomBackground>
  );
}
