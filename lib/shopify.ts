const STOREFRONT_API_VERSION = '2025-01';

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyOption {
  name: string;
  values: string[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  options?: ShopifyOption[];
}

const PRODUCTS_QUERY = `
  query GetProducts {
    products(first: 20, sortKey: TITLE) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(): Promise<ShopifyProduct[]> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !token) {
    return [];
  }

  try {
    const res = await fetch(
      `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query: PRODUCTS_QUERY }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      console.error(`Shopify Storefront API error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const edges: { node: {
      id: string;
      title: string;
      handle: string;
      description: string;
      images: { edges: { node: ShopifyImage }[] };
      variants: { edges: { node: ShopifyVariant }[] };
    } }[] = json?.data?.products?.edges ?? [];

    return edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      images: node.images.edges.map((e) => e.node),
      variants: node.variants.edges.map((e) => e.node),
    }));
  } catch {
    return [];
  }
}

export function getStartingPrice(variants: ShopifyVariant[]): string {
  const available = variants.filter((v) => v.availableForSale);
  const source = available.length > 0 ? available : variants;
  if (!source[0]) return '';

  const prices = source.map((v) => parseFloat(v.price.amount));
  const min = Math.min(...prices);

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: source[0].price.currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(min);
}

export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(amount));
}

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      images(first: 10) {
        edges { node { url altText } }
      }
      options { name values }
      variants(first: 50) {
        edges {
          node {
            id
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProduct | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;

  try {
    const res = await fetch(
      `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query: PRODUCT_BY_HANDLE_QUERY, variables: { handle } }),
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const node = json?.data?.product;
    if (!node) return null;
    return {
      id: node.id,
      title: node.title,
      handle: node.handle,
      description: node.description,
      images: node.images.edges.map((e: { node: ShopifyImage }) => e.node),
      variants: node.variants.edges.map((e: { node: ShopifyVariant }) => e.node),
      options: node.options ?? [],
    };
  } catch {
    return null;
  }
}

// ----- Cart -----

export interface CartLine {
  id: string;
  quantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    image: { url: string; altText: string | null } | null;
    product: { handle: string; title: string };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: CartLine[];
}

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost { totalAmount { amount currencyCode } }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions { name value }
              image { url altText }
              product { handle title }
            }
          }
        }
      }
    }
  }
`;

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: Cart['cost'];
  lines: { edges: { node: CartLine }[] };
};

function normalizeCart(raw: RawCart | null | undefined): Cart | null {
  if (!raw) return null;
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    cost: raw.cost,
    lines: raw.lines.edges.map((e) => e.node),
  };
}

async function shopifyCartCall<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return null;

  try {
    const res = await fetch(
      `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': token,
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function cartCreate(variantId: string, quantity: number): Promise<Cart | null> {
  const data = await shopifyCartCall<{ cartCreate: { cart: RawCart } }>(
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) { cart { ...CartFields } }
    } ${CART_FRAGMENT}`,
    { lines: [{ merchandiseId: variantId, quantity }] }
  );
  return normalizeCart(data?.cartCreate?.cart);
}

export async function cartLinesAdd(cartId: string, variantId: string, quantity: number): Promise<Cart | null> {
  const data = await shopifyCartCall<{ cartLinesAdd: { cart: RawCart } }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    } ${CART_FRAGMENT}`,
    { cartId, lines: [{ merchandiseId: variantId, quantity }] }
  );
  return normalizeCart(data?.cartLinesAdd?.cart);
}

export async function cartLinesUpdate(cartId: string, lineId: string, quantity: number): Promise<Cart | null> {
  const data = await shopifyCartCall<{ cartLinesUpdate: { cart: RawCart } }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } }
    } ${CART_FRAGMENT}`,
    { cartId, lines: [{ id: lineId, quantity }] }
  );
  return normalizeCart(data?.cartLinesUpdate?.cart);
}

export async function cartLinesRemove(cartId: string, lineId: string): Promise<Cart | null> {
  const data = await shopifyCartCall<{ cartLinesRemove: { cart: RawCart } }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } }
    } ${CART_FRAGMENT}`,
    { cartId, lineIds: [lineId] }
  );
  return normalizeCart(data?.cartLinesRemove?.cart);
}

export async function cartGet(cartId: string): Promise<Cart | null> {
  const data = await shopifyCartCall<{ cart: RawCart | null }>(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ...CartFields }
    } ${CART_FRAGMENT}`,
    { cartId }
  );
  return normalizeCart(data?.cart);
}
