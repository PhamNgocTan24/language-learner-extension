import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar activeTab="settings" />
      <PageWrapper className="flex max-w-lg flex-col gap-4 py-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-40 rounded-xl border border-gray-100 bg-white p-6" />
        ))}
      </PageWrapper>
    </div>
  );
}
