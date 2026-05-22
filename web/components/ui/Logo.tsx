import Link from 'next/link';

interface LogoProps {
  href?: string;
  markOnly?: boolean;
  size?: 'sm' | 'lg';
}

function LogoMark({ size = 'sm' }: Pick<LogoProps, 'size'>) {
  const boxClass = size === 'lg' ? 'h-16 w-16 rounded-xl pb-2' : 'h-8 w-8 rounded-lg pb-1';
  const notchClass = size === 'lg' ? 'h-3 w-6 rounded' : 'h-1.5 w-3 rounded-sm';

  return (
    <div className={`${boxClass} flex items-end justify-center bg-brand-primary`}>
      <div className={`${notchClass} bg-accent`} />
    </div>
  );
}

export default function Logo({ href = '/', markOnly = false, size = 'sm' }: LogoProps) {
  const content = (
    <div className="flex items-center gap-2">
      <LogoMark size={size} />
      {!markOnly && (
        <span className="text-lg font-bold">
          <span className="text-gray-900">Learn</span>
          <span className="text-accent">Clip</span>
        </span>
      )}
    </div>
  );

  if (markOnly) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
