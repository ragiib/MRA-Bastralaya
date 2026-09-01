import { jwtVerify } from 'jose';
import { SessionPayload } from '@/types/auth';

export const SESSION_COOKIE_NAME = 'mra_session';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'mra_bastralaya_default_jwt_secret_fallback_key_2026';
  return new TextEncoder().encode(secret);
}

/**
 * Verifies a JWT token signature using the Web Crypto API.
 * 100% compatible with Next.js Middleware (Edge Runtime) & Node.js Server Runtime.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return {
      sub: payload.sub as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'CUSTOMER' | 'ADMIN',
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
