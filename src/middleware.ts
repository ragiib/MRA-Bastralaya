import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/token';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(session && session.sub);
  const isAdmin = session?.role === 'ADMIN';

  // 1. Admin Login Page Special Case (/admin/login)
  if (pathname === '/admin/login') {
    if (isAuthenticated && isAdmin) {
      // Already logged in as Admin -> redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Allow unauthenticated users (or non-admins looking at the admin login page)
    return NextResponse.next();
  }

  // 2. All Protected Admin Routes (/admin, /admin/products, /admin/orders, etc.)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // Not logged in -> redirect to admin login with callback
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${callbackUrl}`, request.url));
    }

    if (!isAdmin) {
      // Authenticated but role is CUSTOMER -> strictly deny access server-side
      // Redirect to admin login with explicit unauthorized error notice
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }

    // Role is verified as ADMIN
    return NextResponse.next();
  }

  // 3. Protected Customer Account Routes (/account, /account/orders, etc.)
  if (pathname.startsWith('/account')) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
    }
    return NextResponse.next();
  }

  // 4. Customer Login & Register Pages (/login, /register)
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      // If customer is already logged in, redirect to their account
      const destination = isAdmin ? '/admin' : '/account';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
  ],
};
