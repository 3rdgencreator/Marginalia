'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/shopify';

export default function CartDrawer() {
  const { cart, isOpen, isPending, closeCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-[10000] bg-[#1F1F21]/40 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-[10001] h-full w-full sm:w-[420px] bg-white text-[#1F1F21] shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        style={{
          '--color-text-primary': '#1F1F21',
          '--color-text-secondary': '#3A3A3C',
          '--color-text-muted': '#5A5A6A',
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#1F1F21]/10">
          <h2 className="text-(--text-label) uppercase tracking-widest text-[#1F1F21]">
            Cart {cart?.totalQuantity ? `(${cart.totalQuantity})` : ''}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-[#1F1F21]/60 hover:text-[#580AFF] transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!cart || cart.lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-4">
              <p className="text-(--text-body) text-[#1F1F21]/60">Your cart is empty.</p>
              <Link
                href="/merch"
                onClick={closeCart}
                className="text-(--text-label) uppercase tracking-widest text-[#580AFF] hover:text-[#1F1F21] transition-colors"
              >
                Browse merch →
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col">
              {cart.lines.map((line) => {
                const variantText = line.merchandise.selectedOptions
                  .filter((o) => o.value !== 'Default Title')
                  .map((o) => o.value)
                  .join(' / ');

                return (
                  <li
                    key={line.id}
                    className="flex gap-4 px-6 py-5 border-b border-[#1F1F21]/8"
                  >
                    {line.merchandise.image && (
                      <div className="shrink-0 w-20 h-20 bg-[#1F1F21]/[0.04] border-2 border-[#1F1F21]/10 relative overflow-hidden">
                        <Image
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-(--text-body) text-[#1F1F21] font-medium truncate">
                            {line.merchandise.product.title}
                          </p>
                          {variantText && (
                            <p className="text-(--text-label) text-[#1F1F21]/50 mt-0.5">
                              {variantText}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(line.id)}
                          disabled={isPending}
                          aria-label="Remove item"
                          className="text-[#1F1F21]/40 hover:text-[#580AFF] transition-colors disabled:opacity-50"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border-2 border-[#1F1F21]/15">
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isPending}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#1F1F21]/70 hover:text-[#1F1F21] hover:bg-[#1F1F21]/5 transition-colors disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-(--text-label) text-[#1F1F21] tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isPending}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#1F1F21]/70 hover:text-[#1F1F21] hover:bg-[#1F1F21]/5 transition-colors disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-(--text-body) text-[#1F1F21] font-medium tabular-nums">
                          {formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.lines.length > 0 && (
          <div className="px-6 py-5 border-t-2 border-[#1F1F21]/10 flex flex-col gap-4 bg-[#1F1F21]/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-(--text-label) uppercase tracking-widest text-[#1F1F21]/60">
                Subtotal
              </span>
              <span className="text-(--text-body) text-[#1F1F21] font-bold tabular-nums">
                {formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)}
              </span>
            </div>
            <a
              href={cart.checkoutUrl}
              className="block w-full bg-[#580AFF] hover:bg-[#9EFF0A] hover:text-[#1F1F21] text-white text-center py-3 text-(--text-label) uppercase tracking-widest transition-colors"
            >
              Continue to Checkout →
            </a>
            <p className="text-[11px] text-[#1F1F21]/40 text-center uppercase tracking-widest">
              Secure checkout on Shopify
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
