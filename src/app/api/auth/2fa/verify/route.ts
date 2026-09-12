import { NextResponse } from 'next/server';
import { verifyChallengeToken } from '@/lib/auth/token';
import { createSession } from '@/lib/auth/session';
import { UserRepository, toSafeUser } from '@/lib/repositories/user.repository';
import { AdminOtpRepository } from '@/lib/repositories/admin-otp.repository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeToken, code } = body;

    if (!challengeToken || !code) {
      return NextResponse.json(
        { error: 'Verification code and session challenge are required.' },
        { status: 400 }
      );
    }

    // Verify 2FA challenge token signature & expiration
    const challenge = await verifyChallengeToken(challengeToken);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Your login session has expired. Please sign in again with your password.' },
        { status: 401 }
      );
    }

    const cleanCode = String(code).trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(cleanCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 6-digit numeric verification code.' },
        { status: 400 }
      );
    }

    // Verify admin user still exists and retains ADMIN role
    const user = UserRepository.findById(challenge.adminId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    // Fetch latest active OTP for this admin
    const latestOtp = AdminOtpRepository.findLatestActive(user.id);
    if (!latestOtp) {
      return NextResponse.json(
        { error: 'No active verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check expiration (5 minutes)
    if (Date.now() > latestOtp.expiresAt) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check maximum attempts limit (lock out after 5 failures)
    if (latestOtp.attempts >= 5) {
      return NextResponse.json(
        {
          error: 'Too many failed attempts. For your security, this code has been locked. Please request a new code.',
          attemptsRemaining: 0,
        },
        { status: 429 }
      );
    }

    // Verify submitted code against bcrypt hash
    const isValid = await AdminOtpRepository.verifyCode(cleanCode, latestOtp.otpHash);

    if (!isValid) {
      const attemptsUsed = AdminOtpRepository.incrementAttempts(latestOtp.id);
      const attemptsRemaining = Math.max(0, 5 - attemptsUsed);

      if (attemptsRemaining === 0) {
        return NextResponse.json(
          {
            error: 'Too many incorrect attempts. For security, this code is now locked. Please click "Resend Code".',
            attemptsRemaining: 0,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `Incorrect verification code. You have ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`,
          attemptsRemaining,
        },
        { status: 400 }
      );
    }

    // Code is valid! Consume OTP so it cannot be re-used
    AdminOtpRepository.markUsed(latestOtp.id);

    // Issue secure HttpOnly session cookie
    const safeUser = toSafeUser(user);
    await createSession(safeUser);

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('[API AUTH 2FA VERIFY ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected verification error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
