import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT } from 'jose';
import { SafeUser, User, SessionPayload } from '@/types/auth';
import { UserRepository, toSafeUser } from '../repositories/user.repository';
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  getJwtSecret,
  verifySessionToken,
} from './token';

export { SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS, getJwtSecret, verifySessionToken };

/**
 * Creates an encrypted/signed JWT session and sets a secure HttpOnly cookie.
 */
export async function createSession(user: SafeUser | User): Promise<string> {
  const secretKey = getJwtSecret();
  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return token;
}

/**
 * Reads and verifies the current session from the HttpOnly cookie.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Retrieves the full user record from the database using the validated session id.
 * This guarantees the user still exists in the database and their role is up-to-date.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session || !session.sub) return null;

  const user = UserRepository.findById(session.sub);
  if (!user) return null;

  return toSafeUser(user);
}

/**
 * Server-side guard: Requires an authenticated user (Customer or Admin).
 * Redirects to /login if unauthenticated.
 */
export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

/**
 * Server-side guard: Requires an authenticated ADMIN user.
 * Redirects to /admin/login if not authenticated as Admin.
 */
export async function requireAdmin(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    redirect('/admin/login?error=unauthorized');
  }
  return user;
}

/**
 * Securely destroys the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
