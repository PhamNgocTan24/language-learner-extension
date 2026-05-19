import Link from 'next/link';

interface NavbarProps {
  activeTab?: 'dashboard' | 'settings';
}

export default function Navbar({ activeTab }: NavbarProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="text-lg font-semibold text-brand-primary">
        📌 LearnClip
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/dashboard"
          className={activeTab === 'dashboard'
            ? 'font-medium text-brand-primary'
            : 'text-gray-500 hover:text-gray-900 transition-colors'}
        >
          Saves
        </Link>
        <Link
          href="/settings"
          className={activeTab === 'settings'
            ? 'font-medium text-brand-primary'
            : 'text-gray-500 hover:text-gray-900 transition-colors'}
        >
          Settings
        </Link>
      </nav>
    </header>
  );
}
