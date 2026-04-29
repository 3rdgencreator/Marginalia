'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { ShopifyProduct, ShopifyVariant } from '@/lib/shopify';
import { formatPrice } from '@/lib/shopify';
import { useCart } from '@/lib/cart-context';

interface Props {
  product: ShopifyProduct;
}

function findVariant(
  variants: ShopifyVariant[],
  selected: Record<string, string>
): ShopifyVariant | null {
  return (
    variants.find((v) =>
      v.selectedOptions.every((opt) => selected[opt.name] === opt.value)
    ) ?? null
  );
}

export default function ProductDetail({ product }: Props) {
  const { addItem, isPending } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const initialSelection = useMemo<Record<string, string>>(() => {
    const firstAvailable = product.variants.find((v) => v.availableForSale) ?? product.variants[0];
    if (!firstAvailable) return {};
    return Object.fromEntries(firstAvailable.selectedOptions.map((o) => [o.name, o.value]));
  }, [product.variants]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const variant = useMemo(() => findVariant(product.variants, selection), [product.variants, selection]);

  const hasRealOptions = (product.options ?? []).some(
    (o) => !(o.values.length === 1 && o.values[0] === 'Default Title')
  );

  async function handleAdd() {
    if (!variant) return;
    if (!variant.availableForSale) {
      toast.error('This variant is sold out.');
      return;
    }
    const ok = await addItem(variant.id, quantity);
    if (ok) {
      toast.success('Added to cart');
    } else {
      toast.error('Could not add to cart. Shopify checkout unavailable.');
    }
  }

  return (
    <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">
      {/* Left — gallery */}
      <div className="w-full lg:w-[55%] shrink-0 flex flex-col gap-3">
        <div className="aspect-square w-full bg-white/40 border-2 border-white/70 relative overflow-hidden">
          {product.images[activeImage] ? (
            <Image
              src={product.images[activeImage].url}
              alt={product.images[activeImage].altText ?? product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain p-6"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-(--color-text-muted) uppercase text-xs tracking-widest">
              No image
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`shrink-0 w-16 h-16 bg-white/40 border-2 relative overflow-hidden transition-colors ${
                  i === activeImage ? 'border-(--color-text-primary)' : 'border-white/60 hover:border-(--color-text-primary)'
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? `${product.title} ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right — info + add to cart */}
      <div className="mt-8 lg:mt-0 flex flex-col gap-6 lg:w-[45%]">
        <div>
          <h1 className="text-(--text-heading) font-bold text-(--color-text-primary) leading-tight">
            {product.title}
          </h1>
          <p className="text-(--text-body) text-(--color-text-secondary) mt-2 tabular-nums">
            {variant ? formatPrice(variant.price.amount, variant.price.currencyCode) : '—'}
          </p>
        </div>

        {hasRealOptions && product.options?.map((option) => (
          <div key={option.name} className="flex flex-col gap-2">
            <p className="text-(--text-label) uppercase tracking-widest text-(--color-text-muted)">
              {option.name}
              <span className="ml-2 text-(--color-text-secondary) normal-case tracking-normal">
                {selection[option.name]}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const trial = { ...selection, [option.name]: value };
                const trialVariant = findVariant(product.variants, trial);
                const available = trialVariant?.availableForSale ?? false;
                const selected = selection[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => setSelection(trial)}
                    disabled={!trialVariant}
                    className={`px-4 py-2 text-(--text-label) uppercase tracking-widest border-2 transition-colors ${
                      selected
                        ? 'border-(--color-text-primary) bg-(--color-text-primary) text-white'
                        : available
                        ? 'border-(--color-text-primary)/30 text-(--color-text-primary) hover:border-(--color-text-primary)'
                        : 'border-(--color-text-muted)/30 text-(--color-text-muted) line-through cursor-not-allowed'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-2">
          <p className="text-(--text-label) uppercase tracking-widest text-(--color-text-muted)">Quantity</p>
          <div className="flex items-center border-2 border-(--color-text-primary)/30 w-fit">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-10 h-10 flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-text-primary)/5 transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center text-(--text-body) text-(--color-text-primary) tabular-nums">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-10 h-10 flex items-center justify-center text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-text-primary)/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!variant || !variant.availableForSale || isPending}
          className="w-full bg-[#580AFF] hover:bg-[#9EFF0A] hover:text-black disabled:bg-(--color-text-muted)/20 disabled:text-(--color-text-muted) disabled:cursor-not-allowed text-white py-4 text-(--text-label) uppercase tracking-widest transition-colors"
        >
          {!variant
            ? 'Unavailable'
            : !variant.availableForSale
            ? 'Sold Out'
            : isPending
            ? 'Adding…'
            : 'Add to Cart'}
        </button>

        {product.description && (
          <div className="text-(--text-body) text-(--color-text-secondary) leading-relaxed whitespace-pre-line pt-6 border-t border-(--color-text-primary)/15">
            {product.description}
          </div>
        )}
      </div>
    </div>
  );
}
