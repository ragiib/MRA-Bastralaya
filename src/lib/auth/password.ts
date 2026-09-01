import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Safely hashes a plaintext password using bcrypt.
 * Never logs or exposes the password.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * Compares a candidate plaintext password with a stored bcrypt hash.
 */
export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
