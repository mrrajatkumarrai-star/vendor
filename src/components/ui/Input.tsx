import React from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label htmlFor={inputId} className="text-2xs font-medium text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              icon && 'pl-7',
              error && 'border-danger focus:ring-danger focus:border-danger',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-2xs text-danger">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label htmlFor={textareaId} className="text-2xs font-medium text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-2 py-1.5 text-xs border border-border rounded bg-white text-foreground',
            'placeholder:text-muted resize-y min-h-[56px]',
            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
            'disabled:bg-gray-50 disabled:text-muted disabled:cursor-not-allowed',
            'transition-colors duration-100',
            error && 'border-danger focus:ring-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && <span className="text-2xs text-danger">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
