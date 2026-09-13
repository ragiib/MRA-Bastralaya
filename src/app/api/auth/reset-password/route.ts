import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { PasswordResetRepository } from '@/lib/repositories/password-reset.repository';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required.' },
        { status: 400 }
      );
    }

    // 1. Validate password strength
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json(
        { error: strength.error || 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserRepository.findByEmail(normalizedEmail);

    if (!user || user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // 2. Verify 6-digit code
    const verifyResult = await PasswordResetRepository.verifyCode(user.id, code);
    if (!verifyResult.valid || !verifyResult.record) {
      return NextResponse.json(
        { error: verifyResult.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // 3. Hash new password and update user record
    const newPasswordHash = await hashPassword(newPassword);
    await UserRepository.updatePassword(user.id, newPasswordHash);

    // 4. Mark token as consumed
    await PasswordResetRepository.markUsed(verifyResult.record.id);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully updated. You may now sign in with your new credentials.',
    });
  } catch (error) {
    console.error('[API RESET PASSWORD ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating your password. Please try again.' },
      { status: 500 }
    );
  }
}
