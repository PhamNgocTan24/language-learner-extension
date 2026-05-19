import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brand-primary hover:bg-brand-primary-hover text-white',
  accent:  'bg-accent hover:bg-accent-hover text-white',
  ghost:   'border border-gray-200 hover:bg-gray-50 text-gray-700',
  danger:  'border border-error text-error hover:bg-error-light',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
