import { query, queryOne } from '../db';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export interface AdminOtpRecord {
  id: string;
  adminId: string;
  otpHash: string;
  attempts: number;
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

interface AdminOtpDbRow {
  id: string;
  admin_id: string;
  otp_hash: string;
  attempts: number;
  expires_at: string | number;
  used: boolean | number;
  created_at: string | Date;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function mapRow(row: AdminOtpDbRow): AdminOtpRecord {
  return {
    id: row.id,
    adminId: row.admin_id,
    otpHash: row.otp_hash,
    attempts: Number(row.attempts),
    expiresAt: Number(row.expires_at),
    used: Boolean(row.used),
    createdAt: formatDate(row.created_at),
  };
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***';
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export const AdminOtpRepository = {
  /**
   * Generates a 6-digit numeric OTP code.
   */
  generateNumericCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  },

  /**
   * Creates and stores a new OTP for an admin, invalidating any previous unused codes.
   * Expires 5 minutes from generation.
   */
  async createOtp(adminId: string, plainOtp: string): Promise<AdminOtpRecord> {
    const id = `otp-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
    const otpHash = await bcrypt.hash(plainOtp, 10);
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

    // Invalidate any previously unused OTPs for this admin
    await query(
      `UPDATE admin_otps 
       SET used = true 
       WHERE admin_id = $1 AND used = false`,
      [adminId]
    );

    // Insert new OTP
    await query(
      `INSERT INTO admin_otps (id, admin_id, otp_hash, attempts, expires_at, used)
       VALUES ($1, $2, $3, 0, $4, false)`,
      [id, adminId, otpHash, expiresAt]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to retrieve created admin OTP record.');
    }
    return created;
  },

  /**
   * Finds an OTP record by ID.
   */
  async findById(id: string): Promise<AdminOtpRecord | null> {
    const row = await queryOne<AdminOtpDbRow>(
      'SELECT * FROM admin_otps WHERE id = $1 LIMIT 1',
      [id]
    );
    return row ? mapRow(row) : null;
  },

  /**
   * Finds the latest active (unused) OTP record for a given admin.
   */
  async findLatestActive(adminId: string): Promise<AdminOtpRecord | null> {
    const row = await queryOne<AdminOtpDbRow>(
      `SELECT * FROM admin_otps 
       WHERE admin_id = $1 AND used = false 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [adminId]
    );
    return row ? mapRow(row) : null;
  },

  /**
   * Verifies the submitted plain OTP against the stored bcrypt hash.
   */
  async verifyCode(plainOtp: string, otpHash: string): Promise<boolean> {
    return bcrypt.compare(plainOtp.trim(), otpHash);
  },

  /**
   * Increments the failure attempt count by 1.
   */
  async incrementAttempts(id: string): Promise<number> {
    await query(
      `UPDATE admin_otps 
       SET attempts = attempts + 1 
       WHERE id = $1`,
      [id]
    );

    const updated = await this.findById(id);
    return updated ? updated.attempts : 5;
  },

  /**
   * Marks the OTP as used/consumed.
   */
  async markUsed(id: string): Promise<void> {
    await query('UPDATE admin_otps SET used = true WHERE id = $1', [id]);
  },
};
