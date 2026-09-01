import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { ProductRepository } from '@/lib/repositories/product.repository';
import { DepartmentType, DEPARTMENTS } from '@/data/adminProductOptions';

/**
 * GET /api/admin/products
 * Server-side protected: Requires authenticated ADMIN role.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department') || undefined;
    const status = searchParams.get('status') || undefined;
    const categorySlug = searchParams.get('categorySlug') || undefined;
    const search = searchParams.get('search') || undefined;

    const products = ProductRepository.getAll({
      department,
      status,
      categorySlug,
      search,
    });

    return NextResponse.json({
      success: true,
      products,
      metrics: ProductRepository.countMetrics(),
    });
  } catch (error) {
    console.error('[API ADMIN PRODUCTS GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve products from database.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Server-side protected: Creates a new product in the SQLite database.
 * Strictly verifies ADMIN role on the server.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Administrator credentials required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      department,
      category,
      categorySlug,
      price,
      salePrice,
      stock,
      status,
      description,
      images,
      fabric,
      color,
      blousePieceIncluded,
      workTechnique,
      occasion,
      suitType,
      size,
      bedSize,
      pillowCoversIncluded,
    } = body;

    // Strict Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Valid product title is required.' }, { status: 400 });
    }

    if (!department || !DEPARTMENTS.includes(department as DepartmentType)) {
      return NextResponse.json({ error: 'Valid department must be selected.' }, { status: 400 });
    }

    if (!category || !categorySlug) {
      return NextResponse.json({ error: 'Category selection is required.' }, { status: 400 });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json({ error: 'Valid regular price is required.' }, { status: 400 });
    }

    const numSalePrice = salePrice !== null && salePrice !== undefined && salePrice !== ''
      ? Number(salePrice)
      : null;
    if (numSalePrice !== null && numSalePrice >= numPrice) {
      return NextResponse.json(
        { error: 'Sale price must be strictly less than the regular price.' },
        { status: 400 }
      );
    }

    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      return NextResponse.json({ error: 'Valid stock quantity is required.' }, { status: 400 });
    }

    const createdProduct = ProductRepository.create({
      name: name.trim(),
      department: department as DepartmentType,
      category: category.trim(),
      categorySlug: categorySlug.trim(),
      price: numPrice,
      salePrice: numSalePrice,
      stock: numStock,
      status: status || 'Active',
      description: (description || '').trim(),
      images: Array.isArray(images) && images.length > 0 ? images : ['/images/sarees/01_printed_cotton.jpg'],
      fabric: fabric ? String(fabric).trim() : undefined,
      color: color ? String(color).trim() : undefined,
      blousePieceIncluded: blousePieceIncluded !== undefined ? Boolean(blousePieceIncluded) : undefined,
      workTechnique: workTechnique ? String(workTechnique).trim() : undefined,
      occasion: occasion ? String(occasion).trim() : undefined,
      suitType: suitType || undefined,
      size: size || undefined,
      bedSize: bedSize || undefined,
      pillowCoversIncluded: pillowCoversIncluded !== undefined ? Boolean(pillowCoversIncluded) : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        product: createdProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API ADMIN PRODUCTS POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create product in database.' },
      { status: 500 }
    );
  }
}
