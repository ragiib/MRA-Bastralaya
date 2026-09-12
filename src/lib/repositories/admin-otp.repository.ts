import { db } from '../db';
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
  expires_at: number;
  used: number;
  created_at: string;
}

function mapRow(row: AdminOtpDbRow): AdminOtpRecord {
  return {
    id: row.id,
    adminId: row.admin_id,
    otpHash: row.otp_hash,
    attempts: Number(row.attempts),
    expiresAt: Number(row.expires_at),
    used: Boolean(row.used),
    createdAt: row.created_at,
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
    const invalidateStmt = db.prepare(`
      UPDATE admin_otps 
      SET used = 1 
      WHERE admin_id = ? AND used = 0
    `);
    invalidateStmt.run(adminId);

    // Insert new OTP
    const insertStmt = db.prepare(`
      INSERT INTO admin_otps (id, admin_id, otp_hash, attempts, expires_at, used)
      VALUES (?, ?, ?, 0, ?, 0)
    `);
    insertStmt.run(id, adminId, otpHash, expiresAt);

    const created = this.findById(id);
    if (!created) {
      throw new Error('Failed to retrieve created admin OTP record.');
    }
    return created;
  },

  /**
   * Finds an OTP record by ID.
   */
  findById(id: string): AdminOtpRecord | null {
    const stmt = db.prepare('SELECT * FROM admin_otps WHERE id = ? LIMIT 1');
    const row = stmt.get(id) as AdminOtpDbRow | undefined;
    return row ? mapRow(row) : null;
  },

  /**
   * Finds the latest active (unused) OTP record for a given admin.
   */
  findLatestActive(adminId: string): AdminOtpRecord | null {
    const stmt = db.prepare(`
      SELECT * FROM admin_otps 
      WHERE admin_id = ? AND used = 0 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const row = stmt.get(adminId) as AdminOtpDbRow | undefined;
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
  incrementAttempts(id: string): number {
    const stmt = db.prepare(`
      UPDATE admin_otps 
      SET attempts = attempts + 1 
      WHERE id = ?
    `);
    stmt.run(id);

    const updated = this.findById(id);
    return updated ? updated.attempts : 5;
  },

  /**
   * Marks the OTP as used/consumed.
   */
  markUsed(id: string): void {
    const stmt = db.prepare('UPDATE admin_otps SET used = 1 WHERE id = ?');
    stmt.run(id);
  },
};
