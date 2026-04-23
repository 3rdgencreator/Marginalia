import type { Metadata } from 'next';
import Image from 'next/image';
import { reader } from '@/lib/keystatic';
import { plainTextFromDocument } from '@/lib/releases';
import Container from '@/components/layout/Container';
import { DocumentRenderer } from '@keystatic/core/renderer';

export async function generateMetadata(): Promise<Metadata> {
  const about = await reader.singletons.about.read();
  const description = plainTextFromDocument(about?.body, 160) || 'About Marginalia.';
  return {
    title: 'About — Marginalia',
    description,
  };
}

export default async function AboutPage() {
  // CRITICAL: Use .read() NOT .readOrThrow() — about.yaml may not be populated
  const about = await reader.singletons.about.read();

  return (
    <Container className="py-(--space-3xl)">
      <div className="mx-auto max-w-[65ch]">

        {/* Headline — render if present; page still renders if null (graceful empty state per D-24) */}
        {about?.headline && (
          <h1 className="mb-(--space-xl) text-(--text-display) font-bold uppercase text-(--color-text-primary)">
            {about.headline}
          </h1>
        )}

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

        {/* Rich text body via DocumentRenderer — FIRST USE in project */}
        {/* Guard: Array.isArray check prevents Pitfall 8 (DocumentRenderer receiving non-array) */}
        {about?.body && Array.isArray(about.body) && about.body.length > 0 ? (
          <div className="prose prose-invert max-w-none text-(--text-body) text-(--color-text-primary) leading-relaxed">
            <DocumentRenderer document={about.body} />
          </div>
        ) : null}

        {/* When body is empty, page renders headline + photo only — no filler text (per D-24) */}

      </div>
    </Container>
  );
}
