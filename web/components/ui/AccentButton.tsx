import type { ButtonHTMLAttributes } from 'react';

interface AccentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  size?: 'sm' | 'md';
}

export default function AccentButton({
  fullWidth = true,
  size = 'md',
  className = '',
  children,
  ...props
}: AccentButtonProps) {
  const sizeClass = size === 'sm' ? 'px-5 py-2.5 text-sm' : 'px-8 py-3.5';

  return (
    <button
      className={[
        fullWidth ? 'w-full' : '',
        'flex items-center justify-center gap-2 rounded-full bg-accent font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60',
        sizeClass,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
