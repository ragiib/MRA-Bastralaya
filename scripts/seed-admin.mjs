import { DatabaseSync } from 'node:sqlite';
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

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'mra_bastralaya.db');
const db = new DatabaseSync(dbPath);

// Ensure users table exists with proper indexes
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK(role IN ('CUSTOMER', 'ADMIN')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
`);

// 1. Process and sanitize Email argument
const rawEmail = process.argv[2];
const email = (rawEmail || process.env.INITIAL_ADMIN_EMAIL)?.trim().toLowerCase();

// 2. Process and sanitize Password argument
let rawPassword = process.argv[3];
if (typeof rawPassword === 'string') {
  // Strip enclosing quotes if user typed '"password"' or "'password'"
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
  console.error('Example: node scripts/seed-admin.mjs admin@mrabastralaya.com \'MyNewPassword@2026\'\n');
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
  console.warn(`Using INITIAL_ADMIN_PASSWORD from .env.local.`);
}

// 4. Look up existing user by normalized email
const existingUser = db.prepare('SELECT id, name, email, role, password_hash FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))').get(email);

// 5. Generate fresh bcrypt hash
const passwordHash = bcrypt.hashSync(password, 10);

let targetUserId;

if (existingUser) {
  targetUserId = existingUser.id;
  const updateStmt = db.prepare(`
    UPDATE users
    SET role = 'ADMIN', password_hash = ?, name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const result = updateStmt.run(passwordHash, name, existingUser.id);

  if (result.changes === 0) {
    console.error('[ERROR] Failed to update existing user record (0 changes).');
    process.exit(1);
  }

  console.log(`[SUCCESS] Existing user record (ID: ${existingUser.id}) updated to role ADMIN with new password hash.`);
} else {
  targetUserId = crypto.randomUUID();
  const insertStmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'ADMIN')
  `);
  insertStmt.run(targetUserId, name, email, passwordHash);
  console.log(`[SUCCESS] New ADMIN account provisioned successfully (ID: ${targetUserId}).`);
}

// 6. Direct Database Self-Verification
const verifyRow = db.prepare('SELECT id, email, role, password_hash, updated_at FROM users WHERE id = ?').get(targetUserId);

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
