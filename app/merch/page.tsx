import type { Metadata } from 'next';
import { fetchShopifyProducts } from '@/lib/shopify';
import { MERCH_PRODUCTS } from '@/lib/merch-data';
import Container from '@/components/layout/Container';
import MerchGrid from '@/components/merch/MerchGrid';
import RandomBackground from '@/components/ui/RandomBackground';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Merch | Marginalia',
  description: 'Official Marginalia merchandise store.',
};

export default async function MerchPage() {
  const liveProducts = await fetchShopifyProducts();
  const products = liveProducts.length > 0 ? liveProducts : MERCH_PRODUCTS;

  return (
    <RandomBackground>
      <Container className="py-(--space-3xl)">
        <MerchGrid products={products} />
      </Container>
    </RandomBackground>
  );
}
