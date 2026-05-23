import type { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function PrimaryButton({
  fullWidth = true,
  className = '',
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={[
        fullWidth ? 'w-full' : '',
        'rounded-full bg-brand-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:bg-brand-primary-light',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
