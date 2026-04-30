import MerchGrid from '@/components/merch/MerchGrid';
import type { ShopifyProduct } from '@/lib/shopify';

interface Props {
  products: ShopifyProduct[];
}

export default function ShowcaseMerchSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <div className="mb-(--space-2xl)">
      <h2 className="text-(--text-heading) text-(--color-text-primary) mb-(--space-md) uppercase tracking-widest">
        Merch
      </h2>
      <MerchGrid products={products} />
    </div>
  );
}
