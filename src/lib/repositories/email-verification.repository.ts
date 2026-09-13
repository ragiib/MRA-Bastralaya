import { query, queryOne } from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export interface EmailVerificationRecord {
  id: string;
  userId: string;
  codeHash: string;
  attempts: number;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

interface EmailVerificationDbRow {
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

function mapRow(row: EmailVerificationDbRow): EmailVerificationRecord {
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

export const EmailVerificationRepository = {
  /**
   * Generates a 6-digit numeric verification code.
   */
  generateNumericCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Creates a new email verification token for a user, invalidating prior unused tokens.
   * Expires in 24 hours.
   */
  async createVerificationToken(userId: string, plainCode: string): Promise<EmailVerificationRecord> {
    const id = `evt-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const codeHash = await bcrypt.hash(plainCode.trim(), 10);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Invalidate any previously unused verification tokens for this user
    await query(
      `UPDATE email_verification_tokens 
       SET used = true 
       WHERE user_id = $1 AND used = false`,
      [userId]
    );

    // Insert new verification token
    await query(
      `INSERT INTO email_verification_tokens (id, user_id, code_hash, attempts, expires_at, used)
       VALUES ($1, $2, $3, 0, $4, false)`,
      [id, userId, codeHash, expiresAt]
    );

    const row = await queryOne<EmailVerificationDbRow>(
      'SELECT * FROM email_verification_tokens WHERE id = $1 LIMIT 1',
      [id]
    );

    if (!row) {
      throw new Error('Failed to retrieve created email verification record.');
    }

    return mapRow(row);
  },

  /**
   * Finds the latest active (unused & unexpired) verification token for a user.
   */
  async findLatestActive(userId: string): Promise<EmailVerificationRecord | null> {
    const row = await queryOne<EmailVerificationDbRow>(
      `SELECT * FROM email_verification_tokens 
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
   * Verifies the submitted 6-digit plain verification code.
   */
  async verifyCode(
    userId: string,
    plainCode: string
  ): Promise<{ valid: boolean; error?: string; record?: EmailVerificationRecord }> {
    const record = await this.findLatestActive(userId);

    if (!record) {
      return {
        valid: false,
        error: 'No active verification code found or it has expired. Please request a new code.',
      };
    }

    if (record.attempts >= 5) {
      await query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [record.id]);
      return {
        valid: false,
        error: 'Too many incorrect attempts. Please request a new verification code.',
      };
    }

    const matches = await bcrypt.compare(plainCode.trim(), record.codeHash);
    if (!matches) {
      await query(
        'UPDATE email_verification_tokens SET attempts = attempts + 1 WHERE id = $1',
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
   * Marks a verification token as used.
   */
  async markUsed(id: string): Promise<void> {
    await query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [id]);
  },
};
