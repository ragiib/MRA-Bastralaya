export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null; // legacy unstructured address
  address_line1?: string | null;
  address_line2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  address_type?: string | null; // 'Home' | 'Work'
  passwordHash: string;
  role: UserRole;
  emailVerified?: boolean;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SafeUser = Omit<User, 'passwordHash'>;

export interface SessionPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  iat?: number;
  exp?: number;
}
