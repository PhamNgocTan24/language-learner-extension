import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMe } from '@/app/actions/users';
import Navbar from '@/components/layout/Navbar';
import SettingsForm from '@/components/settings/SettingsForm';

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  if (!token) redirect('/');

  const user = await getMe();
  if (!user) {
    // API unreachable or token invalid — clear cookie and re-login
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="settings" />
      <main className="max-w-lg mx-auto px-4 md:px-8 py-8">
        {/* Client component owns all interactive state */}
        <SettingsForm user={user} />
      </main>
    </div>
  );
}
