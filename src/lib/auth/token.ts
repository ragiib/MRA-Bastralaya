import { jwtVerify, SignJWT } from 'jose';
import { SessionPayload } from '@/types/auth';

export const SESSION_COOKIE_NAME = 'mra_session';
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface ChallengePayload {
  adminId: string;
  email: string;
  purpose: 'admin_2fa';
  iat?: number;
  exp?: number;
}

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      '[CRITICAL SECURITY ERROR] AUTH_SECRET environment variable is missing. ' +
      'Please configure AUTH_SECRET in your .env.local file.'
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates a short-lived signed JWT challenge token for Step 2 of Admin 2FA.
 * Valid for 5 minutes.
 */
export async function createChallengeToken(adminId: string, email: string): Promise<string> {
  const secretKey = getJwtSecret();
  return new SignJWT({
    adminId,
    email,
    purpose: 'admin_2fa',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secretKey);
}

/**
 * Verifies a 2FA challenge token.
 */
export async function verifyChallengeToken(token: string): Promise<ChallengePayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    if (payload.purpose !== 'admin_2fa' || !payload.adminId || !payload.email) {
      return null;
    }
    return {
      adminId: payload.adminId as string,
      email: payload.email as string,
      purpose: 'admin_2fa',
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
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

