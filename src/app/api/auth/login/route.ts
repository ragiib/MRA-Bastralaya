import { NextResponse } from 'next/server';
import { UserRepository, toSafeUser } from '@/lib/repositories/user.repository';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, createChallengeToken } from '@/lib/auth/session';
import { AdminOtpRepository, maskEmail } from '@/lib/repositories/admin-otp.repository';
import { sendAdminOtpEmail } from '@/lib/email/email';

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

    // 1. ADMIN USER PATH: Strictly enforce 2FA via Email OTP.
    // Under NO circumstances may a session cookie be issued here for an ADMIN.
    if (user.role === 'ADMIN') {
      // Prevent admin from logging in via customer portal (/login)
      if (requiredRole !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Administrator accounts must sign in via the Admin Portal at /admin/login.' },
          { status: 403 }
        );
      }

      console.log(`[AUTH LOGIN] Admin credentials verified for ${user.email}. Initiating 2FA OTP flow...`);

      // Generate 6-digit numeric OTP and save to database
      const otpCode = AdminOtpRepository.generateNumericCode();
      await AdminOtpRepository.createOtp(user.id, otpCode);
      console.log(`[AUTH LOGIN] 6-digit OTP generated and saved to DB for admin ${user.id}.`);

      // Send OTP via Gmail SMTP (or console simulation fallback in dev)
      console.log(`[AUTH LOGIN] Attempting to dispatch OTP email to ${user.email}...`);
      const emailResult = await sendAdminOtpEmail({
        to: user.email,
        name: user.name,
        code: otpCode,
      });

      if (!emailResult.success) {
        console.error('[AUTH LOGIN] Email delivery failed:', emailResult.error);
        return NextResponse.json(
          {
            error:
              emailResult.error ||
              'Failed to deliver verification email. Please check Gmail SMTP configuration.',
          },
          { status: 502 }
        );
      }

      console.log(`[AUTH LOGIN] OTP email dispatched. Issuing 5-minute challenge token.`);

      // Issue short-lived challenge token (5 min expiry)
      const challengeToken = await createChallengeToken(user.id, user.email);

      return NextResponse.json({
        success: true,
        requires2FA: true,
        challengeToken,
        maskedEmail: maskEmail(user.email),
      });
    }

    // 2. NON-ADMIN ATTEMPTING ADMIN LOGIN
    if (requiredRole === 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. This account does not possess administrator credentials.' },
        { status: 403 }
      );
    }

    // 3. CUSTOMER LOGIN PATH: Only accounts with CUSTOMER role reach this point
    console.log(`[AUTH LOGIN] Customer credentials verified for ${user.email}. Creating session.`);
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
