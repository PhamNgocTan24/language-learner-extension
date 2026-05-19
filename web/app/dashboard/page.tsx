import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSaves } from '@/app/actions/saves';
import { getStats } from '@/app/actions/users';
import Navbar from '@/components/layout/Navbar';
import SavesList from '@/components/saves/SavesList';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  if (!token) redirect('/');

  const [saves, stats] = await Promise.all([getSaves(), getStats()]);

  const isAtLimit = stats && saves.length >= 20;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="dashboard" />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Free tier limit banner */}
        {isAtLimit && (
          <div className="bg-accent-light border border-accent rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-accent-hover font-medium">
              You&apos;ve reached your 20 saves/month limit.
            </p>
            <a
              href="/settings"
              className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shrink-0"
            >
              Upgrade to Pro
            </a>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-semibold text-brand-primary">{saves.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total saves</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-semibold text-success">{stats.correct}</div>
              <div className="text-xs text-gray-500 mt-1">Correct answers</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-semibold text-brand-primary">
                {stats.total > 0 ? `${stats.accuracy}%` : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Accuracy</div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-medium text-gray-700 mb-4">Your saved highlights</h2>

        {/* Client component handles delete interactions */}
        <SavesList initialSaves={saves} />
      </main>
    </div>
  );
}
