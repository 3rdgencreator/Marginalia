'use client';

import { useState, useEffect } from 'react';

interface ShopifyProductSimple {
  handle: string;
  title: string;
}

interface Props {
  currentHandles: string[];
}

export default function ShowcaseMerchPicker({ currentHandles }: Props) {
  const [products, setProducts] = useState<ShopifyProductSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/admin/shopify-products')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then((data: ShopifyProductSimple[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="text-xs text-gray-500 animate-pulse">Loading products…</p>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-red-400">Could not load Shopify products. Check SHOPIFY_* env vars.</p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-xs text-gray-500">No products found in Shopify store.</p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto flex flex-col gap-2 pr-2">
      {products.map(product => (
        <label
          key={product.handle}
          className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors duration-150"
        >
          <input
            type="checkbox"
            name="merch_handles"
            value={product.handle}
            defaultChecked={currentHandles.includes(product.handle)}
            className="accent-[#9EFF0A] w-4 h-4 shrink-0"
          />
          <span className="text-sm text-(--color-text-secondary)">{product.title}</span>
          <span className="text-xs text-(--color-text-muted) ml-auto">{product.handle}</span>
        </label>
      ))}
    </div>
  );
}
