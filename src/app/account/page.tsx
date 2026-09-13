import { requireAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import AccountView from '@/components/account/AccountView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account | MRA Bastralaya',
  description: 'Manage your MRA Bastralaya customer profile, orders, and preferences.',
};

export const dynamic = 'force-dynamic';

export default async function CustomerAccountPage() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN' && !user.emailVerified) {
    redirect('/account/verify-email?callbackUrl=/account');
  }

  return <AccountView user={user} />;
}
