import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth/token';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = Boolean(session && session.sub);
  const isAdmin = session?.role === 'ADMIN';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Helper to sanitize callbackUrl and prevent self-referential or external redirect loops
  function getSafeCallbackUrl(rawUrl: string | null): string {
    if (!rawUrl) return '/account';
    let decoded = rawUrl;
    try {
      decoded = decodeURIComponent(rawUrl);
    } catch {
      // ignore decoding error
    }
    // Prevent external open redirects and self-redirect loops to auth endpoints
    if (
      !decoded.startsWith('/') ||
      decoded.startsWith('//') ||
      decoded.startsWith('/login') ||
      decoded.startsWith('/register') ||
      decoded.startsWith('/forgot-password') ||
      decoded.startsWith('/account/verify-email') ||
      decoded.startsWith('/account/recover')
    ) {
      return '/account';
    }
    return decoded;
  }

  // 1. Admin Login Page Special Case (/admin/login)
  if (pathname === '/admin/login') {
    if (isAuthenticated && isAdmin) {
      // Already logged in as Admin -> redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // Allow unauthenticated users (or non-admins looking at the admin login page)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. All Protected Admin Routes (/admin, /admin/products, /admin/orders, etc.)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      // Not logged in -> redirect to admin login with safe callback
      const safeCallback = getSafeCallbackUrl(pathname + search);
      return NextResponse.redirect(new URL(`/admin/login?callbackUrl=${encodeURIComponent(safeCallback)}`, request.url));
    }

    if (!isAdmin) {
      // Authenticated but role is CUSTOMER -> strictly deny access server-side
      // Redirect to admin login with explicit unauthorized error notice
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }

    // Role is verified as ADMIN
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 3. Protected Customer Account Routes (/account, /account/orders, etc.)
  // Exclude public account recovery and email verification routes
  const isPublicAccountRoute = pathname === '/account/recover' || pathname === '/account/verify-email';
  if (pathname.startsWith('/account') && !isPublicAccountRoute) {
    if (!isAuthenticated) {
      const safeCallback = getSafeCallbackUrl(pathname + search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(safeCallback)}`, request.url));
    }

    // Stricter Email Verification Gate:
    // If logged-in as customer but unverified, redirect to verify-email
    if (!isAdmin && session?.emailVerified === false) {
      const safeCallback = getSafeCallbackUrl(pathname + search);
      return NextResponse.redirect(new URL(`/account/verify-email?callbackUrl=${encodeURIComponent(safeCallback)}`, request.url));
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 4. Customer Login, Register, and Forgot Password Pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    // If request indicates expired session or token is invalid, ensure cookie is purged
    const isSessionExpired = request.nextUrl.searchParams.get('session_expired') === 'true';
    if (isSessionExpired || (!isAuthenticated && token)) {
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Allow the login/register/forgot-password page to load cleanly.
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
