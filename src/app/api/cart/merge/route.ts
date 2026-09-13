import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { CartRepository } from '@/lib/repositories/cart.repository';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User must be authenticated to merge carts.' },
        { status: 401 }
      );
    }

    if (!user.emailVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Please verify your registered email address before syncing your cart.',
          code: 'EMAIL_UNVERIFIED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { guestItems } = body;

    if (!Array.isArray(guestItems)) {
      return NextResponse.json(
        { error: 'guestItems must be an array.' },
        { status: 400 }
      );
    }

    const items = await CartRepository.mergeGuestCart(user.id, guestItems);
    return NextResponse.json({ authenticated: true, items });
  } catch (error) {
    console.error('[API CART MERGE ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to merge guest cart into user account.' },
      { status: 500 }
    );
  }
}
