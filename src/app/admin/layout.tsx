import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth/session';
import AdminShell from '@/components/admin/AdminShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Console | MRA Bastralaya',
  description: 'MRA Bastralaya Administration and Management Console',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';

  // Do not enforce admin session or render AdminShell for the admin login page
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  // Server-Side Authorization Enforcement for protected admin dashboard pages:
  const user = await requireAdmin();

  return <AdminShell user={user}>{children}</AdminShell>;
}
