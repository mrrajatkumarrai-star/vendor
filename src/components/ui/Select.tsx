import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label htmlFor={selectId} className="text-2xs font-medium text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input-base appearance-none pr-7 cursor-pointer',
              error && 'border-danger focus:ring-danger focus:border-danger',
              !props.value && 'text-muted',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-muted">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
        </div>
        {error && <span className="text-2xs text-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface MultiSelectProps {
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, error, options, value, onChange, placeholder }: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optValue: string) => {
    const newValue = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue];
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-0.5" ref={containerRef}>
      {label && (
        <label className="text-2xs font-medium text-muted">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'input-base text-left flex items-center justify-between',
            error && 'border-danger',
            value.length === 0 && 'text-muted'
          )}
        >
          <span className="truncate">
            {value.length === 0
              ? placeholder || 'Select...'
              : value.length === 1
                ? options.find((o) => o.value === value[0])?.label
                : `${value.length} selected`}
          </span>
          <ChevronDown className={cn('w-3 h-3 text-muted flex-shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-border rounded shadow-elevated max-h-[180px] overflow-y-auto scrollbar-thin">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 px-2 py-1 text-xs cursor-pointer hover:bg-hover-bg"
              >
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                  className="w-3 h-3 rounded border-border text-accent focus:ring-accent"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {error && <span className="text-2xs text-danger">{error}</span>}
    </div>
  );
}
