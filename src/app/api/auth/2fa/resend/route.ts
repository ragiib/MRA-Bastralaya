import { NextResponse } from 'next/server';
import { verifyChallengeToken, createChallengeToken } from '@/lib/auth/token';
import { UserRepository } from '@/lib/repositories/user.repository';
import { AdminOtpRepository } from '@/lib/repositories/admin-otp.repository';
import { sendAdminOtpEmail } from '@/lib/email/email';

const RESEND_COOLDOWN_SECONDS = 45;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeToken } = body;

    if (!challengeToken) {
      return NextResponse.json(
        { error: 'Session challenge token is required.' },
        { status: 400 }
      );
    }

    // Verify 2FA challenge token
    const challenge = await verifyChallengeToken(challengeToken);
    if (!challenge) {
      return NextResponse.json(
        { error: 'Your session has expired. Please sign in again with your password.' },
        { status: 401 }
      );
    }

    // Verify admin user
    const user = UserRepository.findById(challenge.adminId);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    // Check rate limit / cooldown from previous OTP
    const latestOtp = AdminOtpRepository.findLatestActive(user.id);
    if (latestOtp) {
      const generatedAt = latestOtp.expiresAt - 5 * 60 * 1000;
      const elapsedSeconds = Math.floor((Date.now() - generatedAt) / 1000);

      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        const remainingWait = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
        return NextResponse.json(
          {
            error: `Please wait ${remainingWait} second${remainingWait === 1 ? '' : 's'} before requesting another code.`,
            retryAfter: remainingWait,
          },
          { status: 429 }
        );
      }
    }

    // Generate fresh 6-digit numeric OTP and invalidate prior codes
    const otpCode = AdminOtpRepository.generateNumericCode();
    await AdminOtpRepository.createOtp(user.id, otpCode);

    // Send email
    const emailResult = await sendAdminOtpEmail({
      to: user.email,
      name: user.name,
      code: otpCode,
    });

    if (!emailResult.success) {
      console.error('[2FA RESEND] Email delivery failed:', emailResult.error);
      return NextResponse.json(
        { error: emailResult.error || 'Failed to deliver fresh verification code. Please check Gmail SMTP settings.' },
        { status: 502 }
      );
    }

    // Refresh challenge token for a new 5-minute window
    const newChallengeToken = await createChallengeToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      challengeToken: newChallengeToken,
    });
  } catch (error) {
    console.error('[API AUTH 2FA RESEND ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    );
  }
}
