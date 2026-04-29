import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchShopifyProduct } from '@/lib/shopify';
import { MERCH_PRODUCTS } from '@/lib/merch-data';
import Container from '@/components/layout/Container';
import RandomBackground from '@/components/ui/RandomBackground';
import ProductDetail from '@/components/merch/ProductDetail';

type Props = { params: Promise<{ handle: string }> };

export const revalidate = 3600;

async function resolveProduct(handle: string) {
  const live = await fetchShopifyProduct(handle);
  if (live) return live;
  return MERCH_PRODUCTS.find((p) => p.handle === handle) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = await resolveProduct(handle);
  if (!product) return {};
  return {
    title: `${product.title} | Marginalia Merch`,
    description: product.description.slice(0, 160) || `${product.title} — official Marginalia merchandise.`,
    openGraph: {
      title: `${product.title} | Marginalia Merch`,
      description: product.description.slice(0, 160),
      ...(product.images[0]
        ? { images: [{ url: product.images[0].url, alt: product.images[0].altText ?? product.title }] }
        : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params;
  const product = await resolveProduct(handle);
  if (!product) notFound();

  return (
    <RandomBackground>
      <Container className="py-12 md:py-16">
        <div className="mb-8">
          <a
            href="/merch"
            className="text-(--text-label) text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors duration-150 uppercase tracking-widest"
          >
            ← All Merch
          </a>
        </div>
        <ProductDetail product={product} />
      </Container>
    </RandomBackground>
  );
}
