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
          const val = trimmed.slice(idx + 1).trim();
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

// Ensure table exists
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

const email = (process.argv[2] || process.env.INITIAL_ADMIN_EMAIL || 'admin@mrabastralaya.com').trim().toLowerCase();
const password = process.argv[3] || process.env.INITIAL_ADMIN_PASSWORD || 'Admin@MRABastralaya2026!';
const name = process.argv[4] || process.env.INITIAL_ADMIN_NAME || 'MRA Store Administrator';

console.log('=====================================================');
console.log('   MRA BASTRALAYA - SERVER ADMIN PROVISIONING TOOL   ');
console.log('=====================================================');
console.log(`Target Admin Email: ${email}`);
console.log(`Target Admin Name:  ${name}`);

const existingUser = db.prepare('SELECT id, role FROM users WHERE LOWER(email) = LOWER(?)').get(email);

const passwordHash = bcrypt.hashSync(password, 10);

if (existingUser) {
  // Update existing user to ADMIN and reset password
  const updateStmt = db.prepare(`
    UPDATE users
    SET role = 'ADMIN', password_hash = ?, name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  updateStmt.run(passwordHash, name, existingUser.id);
  console.log(`[SUCCESS] Existing account updated to role ADMIN with new credentials.`);
} else {
  // Insert new admin
  const id = crypto.randomUUID();
  const insertStmt = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'ADMIN')
  `);
  insertStmt.run(id, name, email, passwordHash);
  console.log(`[SUCCESS] New ADMIN account provisioned successfully.`);
}

console.log('Role: ADMIN (Server-Side Enforced)');
console.log('=====================================================');
