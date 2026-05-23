import type { ButtonHTMLAttributes } from 'react';

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export default function OutlineButton({
  fullWidth = false,
  className = '',
  children,
  ...props
}: OutlineButtonProps) {
  return (
    <button
      className={[
        fullWidth ? 'w-full' : '',
        'rounded-full border border-gray-300 px-6 py-2.5 font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
