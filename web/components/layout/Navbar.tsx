import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface NavbarProps {
  activeTab?: 'dashboard' | 'settings';
  variant?: 'landing' | 'app';
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? 'rounded-full bg-brand-primary-light px-4 py-1.5 text-sm font-medium text-brand-primary'
          : 'px-4 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900'
      }
    >
      {children}
    </Link>
  );
}

export default function Navbar({ activeTab, variant = 'app' }: NavbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
      <Logo href={variant === 'landing' ? '/' : '/dashboard'} />

      {variant === 'landing' ? (
        <a
          href={`${API_URL}/auth/google`}
          className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
        >
          Get Started Free
        </a>
      ) : (
        <nav className="flex items-center gap-1">
          <NavLink href="/dashboard" active={activeTab === 'dashboard'}>
            Saves
          </NavLink>
          <NavLink href="/settings" active={activeTab === 'settings'}>
            Settings
          </NavLink>
        </nav>
      )}
    </header>
  );
}
