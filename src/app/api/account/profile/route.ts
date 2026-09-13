import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { formatIndianPhoneNumber, isValidIndianPhone, normalizeIndianPhone } from '@/lib/utils/phone';
import { formatStructuredAddress, isValidPincode } from '@/lib/utils/address';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', user: null },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );
    }

    return NextResponse.json(
      { user },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error) {
    console.error('[API ACCOUNT PROFILE GET ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile information.', user: null },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && !user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Please verify your registered email address before updating your profile.',
          code: 'EMAIL_UNVERIFIED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      phone,
      address,
      address_line1,
      address_line2,
      landmark,
      city,
      state,
      pincode,
      address_type,
    } = body;

    // Validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Full name must be at least 2 characters.' },
          { status: 400 }
        );
      }
    }

    let normalizedPhone: string | undefined = undefined;
    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string' || !isValidIndianPhone(phone)) {
        return NextResponse.json(
          { error: 'Please provide a valid 10-digit Indian phone number.' },
          { status: 400 }
        );
      }
      normalizedPhone = normalizeIndianPhone(phone);
    } else if (phone === '') {
      normalizedPhone = '';
    }

    // Check if structured address fields are being updated
    const isUpdatingStructured =
      address_line1 !== undefined ||
      address_line2 !== undefined ||
      landmark !== undefined ||
      city !== undefined ||
      state !== undefined ||
      pincode !== undefined;

    let computedAddress: string | undefined = undefined;

    if (isUpdatingStructured) {
      if (!address_line1 || typeof address_line1 !== 'string' || !address_line1.trim()) {
        return NextResponse.json(
          { error: 'House / Flat / Building / Company (Address Line 1) is required.' },
          { status: 400 }
        );
      }
      if (!address_line2 || typeof address_line2 !== 'string' || !address_line2.trim()) {
        return NextResponse.json(
          { error: 'Area / Street / Locality (Address Line 2) is required.' },
          { status: 400 }
        );
      }
      if (!landmark || typeof landmark !== 'string' || !landmark.trim()) {
        return NextResponse.json(
          { error: 'Landmark is required.' },
          { status: 400 }
        );
      }
      if (!city || typeof city !== 'string' || !city.trim()) {
        return NextResponse.json(
          { error: 'City / Town is required.' },
          { status: 400 }
        );
      }
      if (!state || typeof state !== 'string' || !state.trim()) {
        return NextResponse.json(
          { error: 'Please select a State or Union Territory.' },
          { status: 400 }
        );
      }
      if (!pincode || typeof pincode !== 'string' || !isValidPincode(pincode)) {
        return NextResponse.json(
          { error: 'Please enter a valid 6-digit numeric PIN Code.' },
          { status: 400 }
        );
      }

      // Format full address for backward compatibility
      computedAddress = formatStructuredAddress({
        address_line1,
        address_line2,
        landmark,
        city,
        state,
        pincode,
        address_type,
      });
    } else if (address !== undefined && address !== null && address !== '') {
      if (typeof address !== 'string' || address.trim().length < 5) {
        return NextResponse.json(
          { error: 'Please provide a complete delivery address (minimum 5 characters).' },
          { status: 400 }
        );
      }
      computedAddress = address.trim();
    }

    const updatedUser = await UserRepository.updateProfile(user.id, {
      name,
      phone: normalizedPhone !== undefined ? normalizedPhone : undefined,
      address: computedAddress !== undefined ? computedAddress : address,
      address_line1,
      address_line2,
      landmark,
      city,
      state,
      pincode,
      address_type: address_type || 'Home',
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('[API ACCOUNT PROFILE PUT ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
