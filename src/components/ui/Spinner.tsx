import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2 className={cn('animate-spin text-accent', sizeClasses[size], className)} />
      {label && <span className="text-2xs text-muted">{label}</span>}
    </div>
  );
}

export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <Spinner size="lg" label={label || 'Loading...'} />
    </div>
  );
}

export function InlineSpinner() {
  return <Loader2 className="w-3 h-3 animate-spin text-accent inline-block" />;
}
