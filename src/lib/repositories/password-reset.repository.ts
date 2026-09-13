import { query, queryOne } from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export interface PasswordResetRecord {
  id: string;
  userId: string;
  codeHash: string;
  attempts: number;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

interface PasswordResetDbRow {
  id: string;
  user_id: string;
  code_hash: string;
  attempts: number;
  expires_at: string | number;
  used: boolean | number;
  created_at: string | Date;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function mapRow(row: PasswordResetDbRow): PasswordResetRecord {
  return {
    id: row.id,
    userId: row.user_id,
    codeHash: row.code_hash,
    attempts: Number(row.attempts),
    expiresAt: Number(row.expires_at),
    used: Boolean(row.used),
    createdAt: formatDate(row.created_at),
  };
}

export const PasswordResetRepository = {
  /**
   * Generates a secure 6-digit numeric reset code.
   */
  generateNumericCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Creates a new password reset record for a user, invalidating prior unused tokens.
   * Expires in 15 minutes.
   */
  async createResetToken(userId: string, plainCode: string): Promise<PasswordResetRecord> {
    const id = `prt-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const codeHash = await bcrypt.hash(plainCode.trim(), 10);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Invalidate any previously unused reset tokens for this user
    await query(
      `UPDATE password_reset_tokens 
       SET used = true 
       WHERE user_id = $1 AND used = false`,
      [userId]
    );

    // Insert new reset token
    await query(
      `INSERT INTO password_reset_tokens (id, user_id, code_hash, attempts, expires_at, used)
       VALUES ($1, $2, $3, 0, $4, false)`,
      [id, userId, codeHash, expiresAt]
    );

    const row = await queryOne<PasswordResetDbRow>(
      'SELECT * FROM password_reset_tokens WHERE id = $1 LIMIT 1',
      [id]
    );

    if (!row) {
      throw new Error('Failed to retrieve created password reset record.');
    }

    return mapRow(row);
  },

  /**
   * Finds the latest active (unused & unexpired) reset token for a user.
   */
  async findLatestActive(userId: string): Promise<PasswordResetRecord | null> {
    const row = await queryOne<PasswordResetDbRow>(
      `SELECT * FROM password_reset_tokens 
       WHERE user_id = $1 
         AND used = false 
         AND expires_at > $2
       ORDER BY created_at DESC 
       LIMIT 1`,
      [userId, Date.now()]
    );

    return row ? mapRow(row) : null;
  },

  /**
   * Verifies the submitted plain 6-digit code.
   */
  async verifyCode(
    userId: string,
    plainCode: string
  ): Promise<{ valid: boolean; error?: string; record?: PasswordResetRecord }> {
    const record = await this.findLatestActive(userId);

    if (!record) {
      return {
        valid: false,
        error: 'No active password reset code found. It may have expired. Please request a new code.',
      };
    }

    if (record.attempts >= 5) {
      // Invalidate token after 5 failed attempts
      await query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [record.id]);
      return {
        valid: false,
        error: 'Too many incorrect attempts. For security, this reset code has been invalidated. Please request a new one.',
      };
    }

    const matches = await bcrypt.compare(plainCode.trim(), record.codeHash);
    if (!matches) {
      // Increment attempt counter
      await query(
        'UPDATE password_reset_tokens SET attempts = attempts + 1 WHERE id = $1',
        [record.id]
      );
      const remaining = 5 - (record.attempts + 1);
      return {
        valid: false,
        error: `Invalid verification code. ${remaining} attempt(s) remaining.`,
      };
    }

    return { valid: true, record };
  },

  /**
   * Marks a reset token as used.
   */
  async markUsed(id: string): Promise<void> {
    await query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [id]);
  },
};
