import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSaves } from '@/app/actions/saves';
import { getStats } from '@/app/actions/users';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import SavesList from '@/components/saves/SavesList';
import StatsRow from '@/components/saves/StatsRow';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  if (!token) redirect('/');

  const [saves, stats] = await Promise.all([getSaves(), getStats()]);
  const isAtLimit = saves.length >= 20;

  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar activeTab="dashboard" />

      <PageWrapper className="py-8">
        {isAtLimit && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-accent bg-accent-light px-4 py-3">
            <p className="text-sm font-medium text-accent-hover">
              You&apos;ve reached your 20 saves/month limit.
            </p>
            <a
              href="/settings"
              className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Upgrade to Pro
            </a>
          </div>
        )}

        <StatsRow totalSaved={saves.length} stats={stats} />
        <SavesList initialSaves={saves} />
      </PageWrapper>
    </div>
  );
}
