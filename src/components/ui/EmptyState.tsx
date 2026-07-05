import { FileQuestion } from 'lucide-react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="text-gray-300 mb-3">
        {icon || <FileQuestion className="w-10 h-10" />}
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-2xs text-muted max-w-[300px]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
