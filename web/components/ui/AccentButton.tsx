import type { ButtonHTMLAttributes } from 'react';

interface AccentButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function AccentButton({
  fullWidth = true,
  className = '',
  children,
  ...props
}: AccentButtonProps) {
  return (
    <button
      className={[
        fullWidth ? 'w-full' : '',
        'flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
