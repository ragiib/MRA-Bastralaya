import { query, queryOne } from '../db';
import crypto from 'node:crypto';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const MAX_FAILED_ATTEMPTS = 5; // Lock after 5 consecutive failures

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterMinutes?: number;
  remainingAttempts?: number;
}

/**
 * Checks whether the given email identifier (and optional IP) is currently rate-limited.
 */
export async function checkLoginRateLimit(
  email: string,
  ipAddress?: string | null
): Promise<RateLimitCheckResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const windowStart = Date.now() - WINDOW_MS;

  // 1. Check account-level failed attempts in the window
  const accountRes = await queryOne<{ fail_count: string | number; oldest_in_window: string | number }>(
    `SELECT COUNT(*) as fail_count, MIN(attempted_at) as oldest_in_window
     FROM login_attempts
     WHERE identifier = $1
       AND attempted_at >= $2
       AND success = false`,
    [normalizedEmail, windowStart]
  );

  const failCount = Number(accountRes?.fail_count || 0);

  if (failCount >= MAX_FAILED_ATTEMPTS) {
    const oldest = Number(accountRes?.oldest_in_window || windowStart);
    const expiresAt = oldest + WINDOW_MS;
    const remainingMs = Math.max(0, expiresAt - Date.now());
    const retryAfterMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

    return {
      allowed: false,
      retryAfterMinutes,
      remainingAttempts: 0,
    };
  }

  // 2. IP-level safety check (blocks mass credential stuffing: 20 failures across accounts from same IP)
  if (ipAddress && ipAddress !== 'unknown') {
    const ipRes = await queryOne<{ ip_fail_count: string | number }>(
      `SELECT COUNT(*) as ip_fail_count
       FROM login_attempts
       WHERE ip_address = $1
         AND attempted_at >= $2
         AND success = false`,
      [ipAddress, windowStart]
    );

    const ipFailCount = Number(ipRes?.ip_fail_count || 0);
    if (ipFailCount >= 20) {
      return {
        allowed: false,
        retryAfterMinutes: 15,
        remainingAttempts: 0,
      };
    }
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failCount),
  };
}

/**
 * Records a login attempt (success or failure).
 */
export async function recordLoginAttempt(
  email: string,
  ipAddress: string | null | undefined,
  success: boolean
): Promise<void> {
  const id = `att-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`;
  const normalizedEmail = email.trim().toLowerCase();
  const now = Date.now();
  const ip = ipAddress || null;

  try {
    await query(
      `INSERT INTO login_attempts (id, identifier, ip_address, attempted_at, success)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, normalizedEmail, ip, now, success]
    );

    if (success) {
      // On successful login, clear failure records for this email to reset counter
      await query(
        `DELETE FROM login_attempts WHERE identifier = $1 AND success = false`,
        [normalizedEmail]
      );
    } else {
      // Opportunistically prune records older than 24 hours (1 in 10 chance to keep queries fast)
      if (Math.random() < 0.1) {
        const pruneBefore = now - 24 * 60 * 60 * 1000;
        await query(`DELETE FROM login_attempts WHERE attempted_at < $1`, [pruneBefore]);
      }
    }
  } catch (err) {
    console.error('[RATE LIMIT ERROR] Failed to record login attempt:', err);
  }
}
