import { NextResponse } from 'next/server';
import { getCurrentUser, destroySession } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE_NAME } from '@/lib/auth/token';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to delete an account.' },
        { status: 401 }
      );
    }

    // Safety guard: Protect admin accounts from customer self-deletion
    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Administrative accounts cannot be deleted through the customer portal.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: 'Your current password is required to confirm account deletion.' },
        { status: 400 }
      );
    }

    // Retrieve user with password hash
    const fullUser = await UserRepository.findById(user.id);
    if (!fullUser) {
      return NextResponse.json(
        { error: 'Account record not found.' },
        { status: 404 }
      );
    }

    // Confirm password matches before destructive operation
    const isPasswordValid = await verifyPassword(password, fullUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password. Account deletion canceled.' },
        { status: 400 }
      );
    }

    // Genuine hard-delete of the user row.
    // FK Cascades: cart_items, wishlist_items, password_reset_tokens, email_verification_tokens are cascade-deleted.
    // FK SET NULL: orders table retains historical records with user_id = NULL for store analytics/tax records.
    await UserRepository.deleteUser(user.id);

    // Prune login attempts for this email so future registration starts clean
    try {
      await query('DELETE FROM login_attempts WHERE identifier = $1', [user.email.toLowerCase()]);
    } catch (pruneErr) {
      console.warn('[API ACCOUNT DELETE] Non-blocking prune error:', pruneErr);
    }

    // Clear session cookie immediately
    const response = NextResponse.json({
      success: true,
      message: 'Your account has been permanently deleted.',
    });

    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('[API ACCOUNT DELETE ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting your account. Please try again.' },
      { status: 500 }
    );
  }
}
