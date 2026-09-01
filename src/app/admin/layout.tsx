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
  // Server-Side Authorization Enforcement:
  // Redirects to /admin/login?error=unauthorized if the user is not authenticated with ADMIN role.
  const user = await requireAdmin();

  return <AdminShell user={user}>{children}</AdminShell>;
}
