import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { EmailVerificationRepository } from '@/lib/repositories/email-verification.repository';
import { sendCustomerEmailVerificationEmail } from '@/lib/email/email';

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

    // Enforce password strength (min 8 chars, 1 letter, 1 number)
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.error || 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    // Validate phone number format if provided
    let normalizedPhone: string | null = null;
    if (phone && typeof phone === 'string' && phone.trim()) {
      if (!isValidIndianPhone(phone)) {
        return NextResponse.json(
          { error: 'Please enter a valid 10-digit Indian phone number.' },
          { status: 400 }
        );
      }
      normalizedPhone = normalizeIndianPhone(phone);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await UserRepository.findByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address is already registered.' },
        { status: 409 }
      );
    }

    // Securely hash password
    const passwordHash = await hashPassword(password);

    // Enforce server-side CUSTOMER role only.
    const newUser = await UserRepository.createCustomer({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
    });

    // Auto-login customer upon registration
    await createSession(newUser);

    // Generate and dispatch 6-digit email verification code via Gmail SMTP
    try {
      const verificationCode = EmailVerificationRepository.generateNumericCode();
      await EmailVerificationRepository.createVerificationToken(newUser.id, verificationCode);
      await sendCustomerEmailVerificationEmail({
        to: newUser.email,
        name: newUser.name,
        code: verificationCode,
      });
    } catch (emailErr) {
      console.error('[API AUTH REGISTER] Failed to send verification email:', emailErr);
      // Non-blocking for registration completion; user can re-send later
    }

    return NextResponse.json(
      {
        success: true,
        user: newUser,
        requiresEmailVerification: true,
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
