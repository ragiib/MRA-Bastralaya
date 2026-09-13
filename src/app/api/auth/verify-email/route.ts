import { NextResponse } from 'next/server';
import {
  getCurrentUser,
  createSession,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { EmailVerificationRepository } from '@/lib/repositories/email-verification.repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, email } = body;

    if (!code || typeof code !== 'string' || code.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit verification code.' },
        { status: 400 }
      );
    }

    // Determine target user: from active session or submitted email
    let user = await getCurrentUser();
    if (!user && email && typeof email === 'string') {
      user = await UserRepository.findByEmail(email.trim().toLowerCase());
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required to verify email address.' },
        { status: 401 }
      );
    }

    if (user.emailVerified) {
      // Re-issue updated session cookie in case browser holds a stale token
      const sessionToken = await createSession({
        ...user,
        emailVerified: true,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Email is already verified.',
        user: {
          ...user,
          emailVerified: true,
        },
      });

      response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_SECONDS,
      });

      return response;
    }

    const verifyResult = await EmailVerificationRepository.verifyCode(user.id, code.trim());
    if (!verifyResult.valid || !verifyResult.record) {
      return NextResponse.json(
        { error: verifyResult.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // Mark email as verified in database
    await UserRepository.setEmailVerified(user.id);
    await EmailVerificationRepository.markUsed(verifyResult.record.id);

    // Refresh active session token with emailVerified: true
    const sessionToken = await createSession({
      ...user,
      emailVerified: true,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email address successfully verified!',
      user: {
        ...user,
        emailVerified: true,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('[API VERIFY EMAIL ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
