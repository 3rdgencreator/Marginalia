import type { Metadata } from 'next';
import { reader } from '@/lib/keystatic';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Merch — Marginalia',
  description: 'Official Marginalia merchandise store.',
};

export default async function MerchPage() {
  // CRITICAL: Use .read() NOT .readOrThrow() — siteConfig may not be populated
  const siteConfig = await reader.singletons.siteConfig.read();
  const merchUrl = siteConfig?.merchUrl ?? null;

  // Security guard: only use as iframe src if value is a valid https:// URL
  // (D-25 / RESEARCH.md Security section — prevents arbitrary URL injection if CMS is ever tampered with)
  const safeUrl = merchUrl && merchUrl.startsWith('https://') ? merchUrl : null;

  return (
    <div className="min-h-[80vh] flex flex-col">
      {safeUrl ? (
        <>
          <iframe
            src={safeUrl}
            title="Marginalia Merch Store"
            className="w-full border-0 flex-1 min-h-[80vh]"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
          {/* Fallback "Visit Store" button — always shown alongside iframe */}
          {/* This handles Shopify X-Frame-Options: DENY blocking the iframe (D-26) */}
          {/* NOTE FOR ELIF: If the iframe shows a blank page, your Shopify store's theme */}
          {/* may be blocking framing via X-Frame-Options. Check Shopify Admin > Online Store > */}
          {/* Themes > Edit code to allow iframe embedding, or use this button as the primary link. */}
          <div className="py-(--space-lg) text-center">
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150"
            >
              Visit our store →
            </a>
          </div>
        </>
      ) : (
        <Container className="py-(--space-3xl)">
          <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
            Merch store coming soon.
          </p>
        </Container>
      )}
    </div>
  );
}
