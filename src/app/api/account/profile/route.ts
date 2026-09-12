import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';

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

    const body = await request.json();
    const { name, phone, address } = body;

    // Validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Full name must be at least 2 characters.' },
          { status: 400 }
        );
      }
    }

    if (phone !== undefined && phone !== null && phone !== '') {
      if (typeof phone !== 'string' || phone.trim().length < 7) {
        return NextResponse.json(
          { error: 'Please provide a valid phone number (minimum 7 digits).' },
          { status: 400 }
        );
      }
    }

    if (address !== undefined && address !== null && address !== '') {
      if (typeof address !== 'string' || address.trim().length < 5) {
        return NextResponse.json(
          { error: 'Please provide a complete delivery address (minimum 5 characters).' },
          { status: 400 }
        );
      }
    }

    const updatedUser = UserRepository.updateProfile(user.id, {
      name,
      phone,
      address,
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
