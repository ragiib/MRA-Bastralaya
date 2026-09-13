import { NextResponse } from 'next/server';
import { ProductRepository } from '@/lib/repositories/product.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await ProductRepository.getCustomerProducts({
      search: query.trim(),
    });

    return NextResponse.json({
      success: true,
      products: products.slice(0, 10), // Limit to top 10 relevant matches
    });
  } catch (error) {
    console.error('[API PRODUCT SEARCH ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to search products.', products: [] },
      { status: 500 }
    );
  }
}
