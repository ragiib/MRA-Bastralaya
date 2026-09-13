import { query, queryOne } from '../db';
import { User, SafeUser, UserRole } from '@/types/auth';
import crypto from 'node:crypto';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  password_hash: string;
  role: string;
  created_at: string | Date;
  updated_at: string | Date;
}

function formatDate(val: string | Date): string {
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const row = await queryOne<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [normalized]
    );
    return row ? mapRowToUser(row) : null;
  },

  async findById(id: string): Promise<User | null> {
    const row = await queryOne<UserRow>(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return row ? mapRowToUser(row) : null;
  },

  /**
   * Strictly creates a CUSTOMER user.
   * Enforces server-side that public registrations can never be granted ADMIN privileges.
   */
  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
  }): Promise<SafeUser> {
    const id = crypto.randomUUID();
    const normalizedEmail = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone?.trim() || null;

    await query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'CUSTOMER')`,
      [id, name, normalizedEmail, phone, data.passwordHash]
    );

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
   * Server-side only: creates an ADMIN user (for administrative provisioning).
   */
  async createAdmin(data: {
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
  }): Promise<SafeUser> {
    const id = crypto.randomUUID();
    const normalizedEmail = data.email.trim().toLowerCase();
    const name = data.name.trim();
    const phone = data.phone?.trim() || null;

    await query(
      `INSERT INTO users (id, name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'ADMIN')`,
      [id, name, normalizedEmail, phone, data.passwordHash]
    );

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

  async countMetrics(): Promise<{ total: number; customers: number; admins: number }> {
    const totalRow = await queryOne<{ c: string | number }>('SELECT COUNT(*) as c FROM users');
    const custRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM users WHERE role = 'CUSTOMER'"
    );
    const adminRow = await queryOne<{ c: string | number }>(
      "SELECT COUNT(*) as c FROM users WHERE role = 'ADMIN'"
    );

    const total = Number(totalRow?.c || 0);
    const customers = Number(custRow?.c || 0);
    const admins = Number(adminRow?.c || 0);

    return { total, customers, admins };
  },

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string | null; address?: string | null }
  ): Promise<SafeUser | null> {
    const existing = await this.findById(userId);
    if (!existing) return null;

    const newName = data.name !== undefined ? data.name.trim() : existing.name;
    const newPhone = data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone;
    const newAddress = data.address !== undefined ? (data.address ? data.address.trim() : null) : existing.address;

    await query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newName, newPhone, newAddress, userId]
    );

    const updated = await this.findById(userId);
    return updated ? toSafeUser(updated) : null;
  },

  async listCustomers(limit = 50): Promise<SafeUser[]> {
    const rows = await query<UserRow>(
      `SELECT id, name, email, phone, address, role, created_at, updated_at
       FROM users
       WHERE role = 'CUSTOMER'
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      address: r.address,
      role: r.role as UserRole,
      createdAt: formatDate(r.created_at),
      updatedAt: formatDate(r.updated_at),
    }));
  },
};
