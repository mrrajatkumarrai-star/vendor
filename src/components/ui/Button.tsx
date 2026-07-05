import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white border-accent hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-white text-foreground border-border hover:bg-hover-bg active:bg-active-bg',
  danger: 'bg-danger text-white border-danger hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-muted border-transparent hover:bg-hover-bg hover:text-foreground active:bg-active-bg',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-6 px-1.5 text-2xs gap-0.5',
  md: 'h-7 px-2.5 text-xs gap-1',
  lg: 'h-8 px-3 text-sm gap-1.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, disabled, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded border transition-colors duration-100',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
