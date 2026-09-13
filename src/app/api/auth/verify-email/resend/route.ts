import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { EmailVerificationRepository } from '@/lib/repositories/email-verification.repository';
import { sendCustomerEmailVerificationEmail } from '@/lib/email/email';

export async function POST(request: Request) {
  try {
    let user = await getCurrentUser();

    // Fallback: accept email if not logged in
    if (!user) {
      const body = await request.json().catch(() => ({}));
      if (body.email && typeof body.email === 'string') {
        user = await UserRepository.findByEmail(body.email.trim().toLowerCase());
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to resend verification code.' },
        { status: 401 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email address is already verified.',
      });
    }

    // Generate fresh 6-digit verification code
    const verificationCode = EmailVerificationRepository.generateNumericCode();
    await EmailVerificationRepository.createVerificationToken(user.id, verificationCode);

    // Send email via Gmail SMTP
    const emailResult = await sendCustomerEmailVerificationEmail({
      to: user.email,
      name: user.name,
      code: verificationCode,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Failed to dispatch verification email.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email address.',
    });
  } catch (error) {
    console.error('[API RESEND VERIFY EMAIL ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email. Please try again later.' },
      { status: 500 }
    );
  }
}
