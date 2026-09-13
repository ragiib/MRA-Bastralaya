import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';
import { isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { generateWhatsAppAccountRecoveryUrl } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string' || !isValidIndianPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian phone number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeIndianPhone(phone);
    const user = await UserRepository.findByPhone(normalized);
    const whatsappUrl = generateWhatsAppAccountRecoveryUrl(normalized);

    // Security: Do NOT reveal or email the full email address.
    // Instead, guide the user to store support on WhatsApp for manual identity verification.
    return NextResponse.json({
      success: true,
      found: Boolean(user),
      phone: normalized,
      whatsappUrl,
    });
  } catch (error) {
    console.error('[API RECOVER ACCOUNT ERROR]', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
