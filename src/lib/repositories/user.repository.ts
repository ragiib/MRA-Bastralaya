import { query, queryOne } from '../db';
import { User, SafeUser, UserRole } from '@/types/auth';
import crypto from 'node:crypto';

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  address_line1: string | null;
  address_line2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address_type: string | null;
  password_hash: string;
  role: string;
  email_verified: boolean | number | null;
  email_verified_at: string | Date | null;
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
    address_line1: row.address_line1 || null,
    address_line2: row.address_line2 || null,
    landmark: row.landmark || null,
    city: row.city || null,
    state: row.state || null,
    pincode: row.pincode || null,
    address_type: row.address_type || 'Home',
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    emailVerified: Boolean(row.email_verified),
    emailVerifiedAt: row.email_verified_at ? formatDate(row.email_verified_at) : null,
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
    data: {
      name?: string;
      phone?: string | null;
      address?: string | null;
      address_line1?: string | null;
      address_line2?: string | null;
      landmark?: string | null;
      city?: string | null;
      state?: string | null;
      pincode?: string | null;
      address_type?: string | null;
    }
  ): Promise<SafeUser | null> {
    const existing = await this.findById(userId);
    if (!existing) return null;

    const newName = data.name !== undefined ? data.name.trim() : existing.name;
    const newPhone = data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : existing.phone;
    const newAddress = data.address !== undefined ? (data.address ? data.address.trim() : null) : existing.address;

    const newLine1 = data.address_line1 !== undefined ? (data.address_line1 ? data.address_line1.trim() : null) : (existing.address_line1 || null);
    const newLine2 = data.address_line2 !== undefined ? (data.address_line2 ? data.address_line2.trim() : null) : (existing.address_line2 || null);
    const newLandmark = data.landmark !== undefined ? (data.landmark ? data.landmark.trim() : null) : (existing.landmark || null);
    const newCity = data.city !== undefined ? (data.city ? data.city.trim() : null) : (existing.city || null);
    const newState = data.state !== undefined ? (data.state ? data.state.trim() : null) : (existing.state || null);
    const newPincode = data.pincode !== undefined ? (data.pincode ? data.pincode.trim() : null) : (existing.pincode || null);
    const newType = data.address_type !== undefined ? (data.address_type ? data.address_type.trim() : 'Home') : (existing.address_type || 'Home');

    await query(
      `UPDATE users 
       SET name = $1, phone = $2, address = $3,
           address_line1 = $4, address_line2 = $5, landmark = $6,
           city = $7, state = $8, pincode = $9, address_type = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11`,
      [newName, newPhone, newAddress, newLine1, newLine2, newLandmark, newCity, newState, newPincode, newType, userId]
    );

    const updated = await this.findById(userId);
    return updated ? toSafeUser(updated) : null;
  },

  async listCustomers(limit = 50): Promise<SafeUser[]> {
    const rows = await query<UserRow>(
      `SELECT id, name, email, phone, address, address_line1, address_line2, landmark, city, state, pincode, address_type, role, created_at, updated_at
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
      address_line1: r.address_line1 || null,
      address_line2: r.address_line2 || null,
      landmark: r.landmark || null,
      city: r.city || null,
      state: r.state || null,
      pincode: r.pincode || null,
      address_type: r.address_type || 'Home',
      role: r.role as UserRole,
      createdAt: formatDate(r.created_at),
      updatedAt: formatDate(r.updated_at),
    }));
  },

  /**
   * Finds a user by phone number (matching against sanitized 10-digit suffix).
   */
  async findByPhone(phone: string): Promise<User | null> {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return null;
    const last10 = digits.slice(-10);

    // Look for matching phone number whose last 10 digits match
    const row = await queryOne<UserRow>(
      `SELECT * FROM users 
       WHERE phone IS NOT NULL 
         AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 10) = $1
       LIMIT 1`,
      [last10]
    );

    return row ? mapRowToUser(row) : null;
  },

  /**
   * Updates a user's password hash (for password resets).
   */
  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newPasswordHash, userId]
    );
  },

  /**
   * Marks a user's email address as verified.
   */
  async setEmailVerified(userId: string): Promise<void> {
    await query(
      `UPDATE users 
       SET email_verified = true, email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [userId]
    );
  },

  /**
   * Permanently hard-deletes a user from the database.
   * Dependent records (cart_items, wishlist_items, tokens) cascade delete automatically.
   * Orders are preserved with user_id set to NULL for business/accounting records.
   */
  async deleteUser(userId: string): Promise<boolean> {
    await query(`DELETE FROM users WHERE id = $1`, [userId]);
    return true;
  },
};
