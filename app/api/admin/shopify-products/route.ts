import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchShopifyProducts } from '@/lib/shopify';

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await fetchShopifyProducts();
    const simplified = products.map(p => ({
      handle: p.handle,
      title: p.title,
    }));
    return NextResponse.json(simplified);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch Shopify products' }, { status: 500 });
  }
}
