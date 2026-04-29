'use client';

import { createContext, useContext, useState, useTransition, useCallback } from 'react';
import type { Cart } from './shopify';
import { addToCart as addToCartAction, updateCartLine, removeCartLine, getCart } from './cart-actions';

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: Cart | null;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const next = await addToCartAction(variantId, quantity);
        if (next) {
          setCart(next);
          setIsOpen(true);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const next = await updateCartLine(lineId, quantity);
        if (next) setCart(next);
        resolve();
      });
    });
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const next = await removeCartLine(lineId);
        if (next) setCart(next);
        resolve();
      });
    });
  }, []);

  const refresh = useCallback(async () => {
    const next = await getCart();
    setCart(next);
  }, []);

  return (
    <CartContext.Provider
      value={{ cart, isOpen, isPending, openCart, closeCart, addItem, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
