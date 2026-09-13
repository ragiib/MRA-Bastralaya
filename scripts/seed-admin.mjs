import { Pool } from '@neondatabase/serverless';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

// Manually parse .env.local if present
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          // Strip enclosing quotes from .env.local values if present
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;
if (!databaseUrl) {
  console.error('[SECURITY ERROR] DATABASE_URL is not set in environment or .env.local.');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

// 1. Process and sanitize Email argument
const rawEmail = process.argv[2];
const email = (rawEmail || process.env.INITIAL_ADMIN_EMAIL)?.trim().toLowerCase();

// 2. Process and sanitize Password argument
let rawPassword = process.argv[3];
if (typeof rawPassword === 'string') {
  rawPassword = rawPassword.trim();
  if (
    (rawPassword.startsWith('"') && rawPassword.endsWith('"')) ||
    (rawPassword.startsWith("'") && rawPassword.endsWith("'"))
  ) {
    rawPassword = rawPassword.slice(1, -1);
  }
}

const hasCliPassword = Boolean(rawPassword && rawPassword.length > 0);
const password = hasCliPassword ? rawPassword : process.env.INITIAL_ADMIN_PASSWORD;
const passwordSource = hasCliPassword
  ? 'Command-Line Argument (process.argv[3])'
  : '.env.local (INITIAL_ADMIN_PASSWORD fallback)';

// 3. Process Name argument
const name = process.argv[4] || process.env.INITIAL_ADMIN_NAME || 'MRA Store Administrator';

if (!email || !password) {
  console.error('\n[SECURITY ERROR] Admin email and password are required.');
  console.error('Usage: node scripts/seed-admin.mjs <email> <password> [name]');
  console.error('Example: node scripts/seed-admin.mjs mrabastrlaya@gmail.com \'MyNewPassword@2026\'\n');
  process.exit(1);
}

console.log('=====================================================');
console.log('   MRA BASTRALAYA - SERVER ADMIN PROVISIONING TOOL   ');
console.log('=====================================================');
console.log(`Target Admin Email:    ${email}`);
console.log(`Target Admin Name:     ${name}`);
console.log(`Password Source:       ${passwordSource}`);
console.log(`Password Length:       ${password.length} characters`);
if (password.length > 0) {
  console.log(`First Character Code:  ${password.charCodeAt(0)} ('${password[0]}')`);
  console.log(`Last Character Code:   ${password.charCodeAt(password.length - 1)} ('${password[password.length - 1]}')`);
}
console.log('-----------------------------------------------------');

if (!hasCliPassword) {
  console.warn('NOTE: No password argument was passed on the command line.');
  console.warn('Using INITIAL_ADMIN_PASSWORD from .env.local.');
}

async function seedAdmin() {
  const client = await pool.connect();
  try {
    // 4. Look up existing user by normalized email
    const existingRes = await client.query(
      'SELECT id, name, email, role, password_hash FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
      [email]
    );
    const existingUser = existingRes.rows[0];

    // 5. Generate fresh bcrypt hash
    const passwordHash = bcrypt.hashSync(password, 10);
    let targetUserId;

    if (existingUser) {
      targetUserId = existingUser.id;
      const updateRes = await client.query(
        `UPDATE users
         SET role = 'ADMIN', password_hash = $1, name = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [passwordHash, name, existingUser.id]
      );

      if (updateRes.rowCount === 0) {
        console.error('[ERROR] Failed to update existing user record (0 changes).');
        process.exit(1);
      }

      console.log(`[SUCCESS] Existing user record (ID: ${existingUser.id}) updated to role ADMIN with new password hash.`);
    } else {
      targetUserId = crypto.randomUUID();
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, 'ADMIN')`,
        [targetUserId, name, email, passwordHash]
      );
      console.log(`[SUCCESS] New ADMIN account provisioned successfully (ID: ${targetUserId}).`);
    }

    // 6. Direct Database Self-Verification
    const verifyRes = await client.query(
      'SELECT id, email, role, password_hash, updated_at FROM users WHERE id = $1',
      [targetUserId]
    );
    const verifyRow = verifyRes.rows[0];

    if (!verifyRow) {
      console.error('[FATAL ERROR] Admin record could not be retrieved after write!');
      process.exit(1);
    }

    const isHashValid = bcrypt.compareSync(password, verifyRow.password_hash);
    if (!isHashValid) {
      console.error('[FATAL ERROR] Stored password_hash does not match input password!');
      process.exit(1);
    }

    console.log('[VERIFIED] Database confirmation: bcrypt.compareSync(password, stored_hash) === TRUE.');
    console.log(`[VERIFIED] Stored Hash: ${verifyRow.password_hash.slice(0, 15)}...`);
    console.log(`[VERIFIED] Database updated_at timestamp: ${verifyRow.updated_at}`);
    console.log('=====================================================\n');
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
