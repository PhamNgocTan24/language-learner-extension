import Navbar from '@/components/layout/Navbar';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="dashboard" />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-100 p-4 h-20 animate-pulse" />
          ))}
        </div>
        {/* List skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-100 p-4 h-20 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
