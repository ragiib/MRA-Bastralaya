import { NextResponse } from 'next/server';
import { UserRepository, toSafeUser } from '@/lib/repositories/user.repository';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, requiredRole } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = UserRepository.findByEmail(normalizedEmail);

    if (!user) {
      // Security: Generic message to prevent email enumeration
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Security: Identical message for invalid password
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // If logging in via admin portal, enforce that the user has the ADMIN role
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. This account does not possess administrator credentials.' },
        { status: 403 }
      );
    }

    // Set secure HttpOnly session cookie
    const safeUser = toSafeUser(user);
    await createSession(safeUser);

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('[API AUTH LOGIN ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
