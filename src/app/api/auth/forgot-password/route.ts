import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { PasswordResetRepository } from '@/lib/repositories/password-reset.repository';
import { sendCustomerPasswordResetEmail } from '@/lib/email/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(normalizedEmail);

    // If user exists and is a customer, dispatch 6-digit reset code
    if (user && user.role === 'CUSTOMER') {
      const resetCode = PasswordResetRepository.generateNumericCode();
      await PasswordResetRepository.createResetToken(user.id, resetCode);

      // Send reset email via Gmail SMTP (or simulated fallback)
      await sendCustomerPasswordResetEmail({
        to: user.email,
        name: user.name,
        code: resetCode,
      });
    }

    // Always return generic success message to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email address, a 6-digit reset code has been sent.',
    });
  } catch (error) {
    console.error('[API FORGOT PASSWORD ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
