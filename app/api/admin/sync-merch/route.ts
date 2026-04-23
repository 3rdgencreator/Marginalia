import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

const STORE = 'qkvft1-1y.myshopify.com';

const QUERY = `query {
  products(first: 50) {
    edges {
      node {
        id title handle description
        featuredImage { url altText }
        images(first: 5) { edges { node { url altText } } }
        variants(first: 20) {
          edges {
            node {
              id availableForSale price
              selectedOptions { name value }
            }
          }
        }
        options { name values }
      }
    }
  }
}`;

function buildTs(products: ShopifyAdminProduct[]): string {
  const lines: string[] = [
    "import type { ShopifyProduct } from './shopify';",
    '',
    'export const MERCH_PRODUCTS: ShopifyProduct[] = [',
  ];

  for (const p of products) {
    const images = p.images.edges.map((e) => e.node);
    const variants = p.variants.edges.map((e) => e.node);

    lines.push('  {');
    lines.push(`    id: ${JSON.stringify(p.id)},`);
    lines.push(`    title: ${JSON.stringify(p.title)},`);
    lines.push(`    handle: ${JSON.stringify(p.handle)},`);
    lines.push(`    description: ${JSON.stringify(p.description ?? '')},`);

    lines.push('    images: [');
    for (const img of images) {
      lines.push(
        `      { url: ${JSON.stringify(img.url)}, altText: ${img.altText ? JSON.stringify(img.altText) : 'null'} },`
      );
    }
    lines.push('    ],');

    lines.push('    options: [');
    for (const opt of p.options) {
      lines.push(
        `      { name: ${JSON.stringify(opt.name)}, values: ${JSON.stringify(opt.values)} },`
      );
    }
    lines.push('    ],');

    lines.push('    variants: [');
    for (const v of variants) {
      lines.push(
        `      { id: ${JSON.stringify(v.id)}, availableForSale: ${v.availableForSale}, price: { amount: ${JSON.stringify(v.price)}, currencyCode: 'EUR' }, selectedOptions: ${JSON.stringify(v.selectedOptions)} },`
      );
    }
    lines.push('    ],');

    lines.push('  },');
  }

  lines.push('];');
  return lines.join('\n');
}

interface ShopifyAdminProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  images: { edges: { node: { url: string; altText: string | null } }[] };
  variants: {
    edges: {
      node: {
        id: string;
        availableForSale: boolean;
        price: string;
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
  options: { name: string; values: string[] }[];
}

export async function POST() {
  try {
    const result = execSync(
      `shopify store execute --store ${STORE} --query '${QUERY.replace(/\n/g, ' ').replace(/'/g, '"')}' --json`,
      { encoding: 'utf8', timeout: 30000 }
    );

    const json = JSON.parse(result);
    const products: ShopifyAdminProduct[] = json.products.edges.map(
      (e: { node: ShopifyAdminProduct }) => e.node
    );

    const tsContent = buildTs(products);
    const outPath = path.join(process.cwd(), 'lib', 'merch-data.ts');
    writeFileSync(outPath, tsContent, 'utf8');

    return Response.json({ ok: true, count: products.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
