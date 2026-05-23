import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  markOnly?: boolean;
  size?: 'sm' | 'lg';
}

function LogoMark({ size = 'sm' }: Pick<LogoProps, 'size'>) {
  const wrapperClass =
    size === 'lg'
      ? 'h-16 w-16 rounded-xl border border-gray-200 p-1.5'
      : 'h-8 w-8 rounded-lg border border-gray-200 p-0.5';

  const imageSize = size === 'lg' ? 52 : 28;

  return (
    <span className={`${wrapperClass} inline-flex items-center justify-center bg-white`}>
      <Image
        src="/just_logo.svg"
        alt=""
        width={imageSize}
        height={imageSize}
        className="h-full w-full object-contain"
        priority={size === 'lg'}
      />
    </span>
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
