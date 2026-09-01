import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth/session';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[API AUTH LOGOUT ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to complete logout.' },
      { status: 500 }
    );
  }
}
