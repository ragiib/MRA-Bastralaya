import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { hashPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Full name must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address is already registered.' },
        { status: 409 }
      );
    }

    // Securely hash password
    const passwordHash = await hashPassword(password);

    // Enforce server-side CUSTOMER role only.
    // Client-provided 'role' is never accepted or checked.
    const newUser = UserRepository.createCustomer({
      name: name.trim(),
      email: normalizedEmail,
      phone: typeof phone === 'string' ? phone.trim() : null,
      passwordHash,
    });

    // Auto-login customer upon registration
    await createSession(newUser);

    return NextResponse.json(
      {
        success: true,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API AUTH REGISTER ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create customer account. Please try again.' },
      { status: 500 }
    );
  }
}
