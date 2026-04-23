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
