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
    title: 'About — Marginalia',
    description,
  };
}

export default async function AboutPage() {
  // CRITICAL: Use .read() NOT .readOrThrow() — about.yaml may not be populated
  const about = await reader.singletons.about.read();
  // body is stored as a separate .mdoc file — must call as function to get nodes
  const body = about?.body ? await about.body() : null;

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
      <div className="mx-auto max-w-[65ch]">

        {/* Optional photo of Elif — render only if photo field is set */}
        {about?.photo && (
          <div className="w-full mb-(--space-xl) overflow-hidden">
            <Image
              src={`/images/about/${about.photo}`}
              alt="Elif — Marginalia"
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
          className="not-prose mt-(--space-xl) rounded-xl border border-white/70 px-4 py-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 20px 6px rgba(202,201,249,0.25), 0 0 6px 2px rgba(202,201,249,0.35)' }}
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
              borderRadius: '9999px',
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

      </div>
      </Container>
    </RandomBackground>
  );
}
