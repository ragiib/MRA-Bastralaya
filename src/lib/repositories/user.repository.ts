import { db } from '../db';
import { User, SafeUser, UserRole } from '@/types/auth';
import crypto from 'node:crypto';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: string;
  created_at: string;
  updated_at: string;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

export const UserRepository = {
  findByEmail(email: string): User | null {
    const normalized = email.trim().toLowerCase();
    const stmt = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1');
    const row = stmt.get(normalized) as UserRow | undefined;
    return row ? mapRowToUser(row) : null;
  },

  findById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    const row = stmt.get(id) as UserRow | undefined;
    return row ? mapRowToUser(row) : null;
  },

  /**
   * Strictly creates a CUSTOMER user.
   * Enforces server-side that public registrations can never be granted ADMIN privileges.
   */
  createCustomer(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
  }): SafeUser {
    const id = crypto.randomUUID();
    const normalizedEmail = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone?.trim() || null;

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'CUSTOMER')
    `);

    stmt.run(id, name, normalizedEmail, phone, data.passwordHash);

    return {
      id,
      name,
      email: normalizedEmail,
      phone,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Server-side only: creates an ADMIN user (for seeding / administrative provisioning).
   */
  createAdmin(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
  }): SafeUser {
    const id = crypto.randomUUID();
    const normalizedEmail = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone?.trim() || null;

    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'ADMIN')
    `);

    stmt.run(id, name, normalizedEmail, phone, data.passwordHash);

    return {
      id,
      name,
      email: normalizedEmail,
      phone,
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  countMetrics(): { total: number; customers: number; admins: number } {
    const totalStmt = db.prepare('SELECT COUNT(*) as c FROM users');
    const custStmt = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'CUSTOMER'");
    const adminStmt = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'ADMIN'");

    const total = Number((totalStmt.get() as { c: number | bigint })?.c || 0);
    const customers = Number((custStmt.get() as { c: number | bigint })?.c || 0);
    const admins = Number((adminStmt.get() as { c: number | bigint })?.c || 0);

    return { total, customers, admins };
  },

  listCustomers(limit = 20): SafeUser[] {
    const stmt = db.prepare(`
      SELECT id, name, email, phone, role, created_at, updated_at
      FROM users
      WHERE role = 'CUSTOMER'
      ORDER BY created_at DESC
      LIMIT ?
    `);
    const rows = stmt.all(limit) as Omit<UserRow, 'password_hash'>[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      role: r.role as UserRole,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },
};
