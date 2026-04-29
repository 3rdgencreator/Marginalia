'use server';

import { cookies } from 'next/headers';
import {
  cartCreate,
  cartLinesAdd,
  cartLinesUpdate,
  cartLinesRemove,
  cartGet,
  type Cart,
} from './shopify';

const COOKIE_NAME = 'mrgnl_cart_id';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (Shopify cart lifetime)

async function setCartCookie(cartId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

async function clearCartCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

async function readCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  const cart = await cartGet(cartId);
  if (!cart) {
    await clearCartCookie();
    return null;
  }
  return cart;
}

export async function addToCart(variantId: string, quantity = 1): Promise<Cart | null> {
  const cartId = await readCartId();
  let cart: Cart | null = null;

  if (cartId) {
    cart = await cartLinesAdd(cartId, variantId, quantity);
    if (!cart) {
      await clearCartCookie();
    }
  }

  if (!cart) {
    cart = await cartCreate(variantId, quantity);
    if (cart) await setCartCookie(cart.id);
  }

  return cart;
}

export async function updateCartLine(lineId: string, quantity: number): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  if (quantity <= 0) {
    return cartLinesRemove(cartId, lineId);
  }
  return cartLinesUpdate(cartId, lineId, quantity);
}

export async function removeCartLine(lineId: string): Promise<Cart | null> {
  const cartId = await readCartId();
  if (!cartId) return null;
  return cartLinesRemove(cartId, lineId);
}
