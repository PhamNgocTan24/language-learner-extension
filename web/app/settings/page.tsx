import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getMe } from '@/app/actions/users';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  if (!token) redirect('/');

  const user = await getMe();
  if (!user) redirect('/');

  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar activeTab="settings" />
      <PageWrapper className="max-w-lg py-8">
        <SettingsForm user={user} />
      </PageWrapper>
    </div>
  );
}
