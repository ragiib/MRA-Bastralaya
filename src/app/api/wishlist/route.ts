import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { WishlistRepository } from '@/lib/repositories/wishlist.repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        wishlistIds: [],
        products: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    const wishlistIds = await WishlistRepository.getWishlistProductIds(user.id);
    let products = undefined;
    if (includeDetails) {
      products = await WishlistRepository.getWishlistProducts(user.id);
    }

    return NextResponse.json({
      authenticated: true,
      wishlistIds,
      products,
    });
  } catch (error) {
    console.error('[API WISHLIST GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve wishlist.', wishlistIds: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Please sign in to save items to your wishlist.', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    if (!user.emailVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Please verify your registered email address before saving items to your wishlist.',
          code: 'EMAIL_UNVERIFIED',
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { productId } = body;

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing productId.' },
        { status: 400 }
      );
    }

    const { added } = await WishlistRepository.toggleItem(user.id, productId);
    const updatedIds = await WishlistRepository.getWishlistProductIds(user.id);

    return NextResponse.json({
      success: true,
      added,
      wishlistIds: updatedIds,
    });
  } catch (error) {
    console.error('[API WISHLIST POST ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }

    if (!user.emailVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Please verify your registered email address before modifying your wishlist.',
          code: 'EMAIL_UNVERIFIED',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId parameter.' },
        { status: 400 }
      );
    }

    await WishlistRepository.removeItem(user.id, productId);
    const updatedIds = await WishlistRepository.getWishlistProductIds(user.id);

    return NextResponse.json({
      success: true,
      wishlistIds: updatedIds,
    });
  } catch (error) {
    console.error('[API WISHLIST DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist.' },
      { status: 500 }
    );
  }
}
