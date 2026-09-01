import { requireAuth } from '@/lib/auth/session';
import AccountView from '@/components/account/AccountView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | MRA Bastralaya',
  description: 'Manage your MRA Bastralaya customer profile, orders, and preferences.',
};

export default async function CustomerAccountPage() {
  const user = await requireAuth();

  return <AccountView user={user} />;
}
