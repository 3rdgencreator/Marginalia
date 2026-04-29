'use client';

import { useCart } from '@/lib/cart-context';

interface Props {
  className?: string;
}

export default function CartButton({ className }: Props) {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} items` : 'Open cart'}
      className={`relative inline-flex items-center justify-center p-2 text-[#444] hover:text-(--color-accent-lime) transition-colors duration-150 ${className ?? ''}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 8H6" />
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
      </svg>
      {count > 0 && (
        <span
          className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 flex items-center justify-center bg-[#9EFF0A] text-black text-[9px] font-bold rounded-full tabular-nums leading-none"
          aria-hidden="true"
        >
          {count}
        </span>
      )}
    </button>
  );
}
