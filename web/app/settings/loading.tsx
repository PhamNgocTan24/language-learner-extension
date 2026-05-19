import Navbar from '@/components/layout/Navbar';

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab="settings" />
      <main className="max-w-lg mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-xl border border-gray-100 p-6 h-40 animate-pulse" />
        ))}
      </main>
    </div>
  );
}
