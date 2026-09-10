import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { CartRepository } from '@/lib/repositories/cart.repository';
import { ProductRepository } from '@/lib/repositories/product.repository';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, items: [] });
    }

    const items = CartRepository.getItems(user.id);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('[API CART GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to retrieve cart items.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, priceAtAdd } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json({ error: 'Valid productId is required.' }, { status: 400 });
    }

    const product = ProductRepository.getCustomerProductById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product is not available or is in Draft status.' },
        { status: 404 }
      );
    }

    if (product.status === 'Sold Out' || product.stock <= 0) {
      return NextResponse.json(
        { error: 'This product is currently Sold Out and cannot be added.' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const unitPrice =
      typeof priceAtAdd === 'number' && priceAtAdd > 0
        ? priceAtAdd
        : product.salePrice && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    if (user) {
      const items = CartRepository.addItem(user.id, productId, quantity, unitPrice);
      return NextResponse.json({ authenticated: true, items });
    }

    // Guest response with full product info for localStorage persistence
    return NextResponse.json({
      authenticated: false,
      item: {
        id: `guest-${Date.now()}-${productId}`,
        productId,
        quantity: Math.min(Math.max(1, quantity), product.stock),
        priceAtAdd: unitPrice,
        product,
      },
    });
  } catch (error: unknown) {
    console.error('[API CART POST ERROR]', error);
    const message = error instanceof Error ? error.message : 'Failed to add item to cart.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || typeof productId !== 'string' || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'productId and quantity are required.' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, success: true });
    }

    const items = CartRepository.updateQuantity(user.id, productId, quantity);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('[API CART PUT ERROR]', error);
    return NextResponse.json({ error: 'Failed to update cart quantity.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId parameter is required.' }, { status: 400 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, success: true });
    }

    const items = CartRepository.removeItem(user.id, productId);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('[API CART DELETE ERROR]', error);
    return NextResponse.json({ error: 'Failed to remove item from cart.' }, { status: 500 });
  }
}
