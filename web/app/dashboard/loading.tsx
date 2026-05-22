import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface-page">
      <Navbar activeTab="dashboard" />
      <PageWrapper className="py-8">
        <div className="mb-8 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 rounded-xl border border-gray-100 bg-white p-4" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 rounded-xl border border-gray-100 bg-white p-4" />
          ))}
        </div>
      </PageWrapper>
    </div>
  );
}
