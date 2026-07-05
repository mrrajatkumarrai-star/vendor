import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  accent: 'bg-blue-50 text-blue-700',
  success: 'bg-green-50 text-green-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
