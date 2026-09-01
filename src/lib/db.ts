import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Singleton instance across hot reloads in Next.js
declare global {
  // eslint-disable-next-line no-var
  var __mra_db__: DatabaseSync | undefined;
}

function initDatabase(): DatabaseSync {
  if (globalThis.__mra_db__) {
    return globalThis.__mra_db__;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'mra_bastralaya.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for high concurrency & reliability
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Schema creation
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

  // Auto-provision initial administrator if none exists
  try {
    const adminCheck = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'").get() as { count: number | bigint };
    const adminCount = Number(adminCheck?.count || 0);

    if (adminCount === 0) {
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
      const initialAdminName = process.env.INITIAL_ADMIN_NAME || 'MRA Store Administrator';

      if (initialAdminEmail && initialAdminPassword) {
        const adminId = crypto.randomUUID();
        const passwordHash = bcrypt.hashSync(initialAdminPassword, 10);

        const insertAdmin = db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role)
          VALUES (?, ?, ?, ?, 'ADMIN')
        `);
        insertAdmin.run(adminId, initialAdminName, initialAdminEmail, passwordHash);
        console.log(`[AUTH SYSTEM] Initial administrator provisioned securely: ${initialAdminEmail}`);
      }
    }
  } catch (error) {
    console.error('[AUTH SYSTEM] Error checking/provisioning initial admin:', error);
  }

  globalThis.__mra_db__ = db;
  return db;
}

export const db = initDatabase();
export default db;
