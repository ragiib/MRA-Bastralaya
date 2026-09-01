import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { ProductRepository } from '@/lib/repositories/product.repository';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/products/[id]
 * Server-side protected: Retrieves a single product by ID.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const product = ProductRepository.getById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[API ADMIN PRODUCT GET BY ID ERROR]', error);
    return NextResponse.json({ error: 'Failed to retrieve product.' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id]
 * Server-side protected: Updates an existing product in the SQLite database.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existing = ProductRepository.getById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    const updated = ProductRepository.update(id, body);

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('[API ADMIN PRODUCT UPDATE ERROR]', error);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Server-side protected: Deletes a product from the SQLite database.
 */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const deleted = ProductRepository.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Product could not be deleted or does not exist.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('[API ADMIN PRODUCT DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to delete product.' }, { status: 500 });
  }
}
