interface PageWrapperProps {
  children: React.ReactNode;
  size?: 'app' | 'landing';
  className?: string;
}

export default function PageWrapper({ children, size = 'app', className = '' }: PageWrapperProps) {
  const widthClass = size === 'landing' ? 'max-w-5xl px-6' : 'max-w-3xl px-4 md:px-8';

  return <div className={`${widthClass} mx-auto w-full ${className}`}>{children}</div>;
}
