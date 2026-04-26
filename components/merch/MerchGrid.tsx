'use client';

import Image from 'next/image';
import type { ShopifyProduct } from '@/lib/shopify';
import { getStartingPrice } from '@/lib/shopify';

interface Props {
  products: ShopifyProduct[];
  storeDomain: string;
}

export default function MerchGrid({ products, storeDomain }: Props) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-(--text-body) text-(--color-text-muted)">
        Merch store coming soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {products.map((product) => {
        const href = `https://${storeDomain}/products/${product.handle}`;
        const price = getStartingPrice(product.variants);
        const image = product.images[0];

        return (
          <a
            key={product.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="aspect-square overflow-hidden relative mb-3 border-2 border-white/70 bg-white/10">
              {image ? (
                <Image
                  src={image.url}
                  alt={image.altText ?? product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-3 group-hover:scale-[1.04] transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-(--text-label) text-(--color-text-muted) uppercase tracking-widest text-xs">
                    No image
                  </span>
                </div>
              )}
            </div>
            <p className="text-(--text-body) text-(--color-text-primary) font-medium leading-tight">
              {product.title}
            </p>
            {price && (
              <p className="text-(--text-label) text-(--color-text-muted) mt-1">{price}</p>
            )}
          </a>
        );
      })}
    </div>
  );
}
