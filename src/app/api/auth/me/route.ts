import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('[API AUTH ME ERROR]', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
