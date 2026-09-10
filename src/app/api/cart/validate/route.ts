import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ products: {} });
    }

    const placeholders = productIds.map(() => '?').join(',');
    const stmt = db.prepare(`
      SELECT id, name, department, category, category_slug, price, sale_price, stock_quantity, status, images, fabric, color
      FROM products
      WHERE id IN (${placeholders})
    `);

    const rows = stmt.all(...productIds) as Array<{
      id: string;
      name: string;
      department: string;
      category: string;
      category_slug: string;
      price: number;
      sale_price: number | null;
      stock_quantity: number;
      status: string;
      images: string;
      fabric: string | null;
      color: string | null;
    }>;

    const products: Record<
      string,
      {
        id: string;
        name: string;
        department: string;
        category: string;
        categorySlug: string;
        price: number;
        salePrice: number | null;
        stock: number;
        status: string;
        images: string[];
        fabric?: string;
        color?: string;
      }
    > = {};

    for (const r of rows) {
      let images: string[] = [];
      try {
        images = JSON.parse(r.images);
        if (!Array.isArray(images)) images = [];
      } catch {
        images = r.images ? [r.images] : [];
      }

      products[r.id] = {
        id: r.id,
        name: r.name,
        department: r.department,
        category: r.category,
        categorySlug: r.category_slug,
        price: Number(r.price),
        salePrice: r.sale_price !== null ? Number(r.sale_price) : null,
        stock: Number(r.stock_quantity),
        status: r.status,
        images,
        fabric: r.fabric || undefined,
        color: r.color || undefined,
      };
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('[API CART VALIDATE ERROR]', error);
    return NextResponse.json({ error: 'Failed to validate products.' }, { status: 500 });
  }
}
