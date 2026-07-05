import React, { useMemo } from 'react';
import { Star, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { VENDOR_TYPE_OPTIONS } from '@/types/vendor';
import { COUNTRIES, INDIAN_STATES } from '@/config/countries';
import { cn } from '@/utils/cn';

export function Sidebar() {
  const { filters, setFilters, resetFilters, sidebarOpen, activeFilterCount } = useVendorStore();

  const vendorTypeOptions = useMemo(() =>
    VENDOR_TYPE_OPTIONS.map((v) => ({ label: v, value: v })),
    []
  );

  const countryOptions = useMemo(() => COUNTRIES, []);
  const stateOptions = useMemo(() => INDIAN_STATES, []);

  const filterCount = activeFilterCount();

  if (!sidebarOpen) return null;

  return (
    <aside className="w-[220px] border-r border-border bg-white flex-shrink-0 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold text-foreground">Filters</span>
        {filterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear ({filterCount})
          </Button>
        )}
      </div>

      {/* Filter sections */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2 space-y-3">
        {/* Vendor Type */}
        <FilterSection title="Vendor Type">
          <div className="space-y-0.5">
            {vendorTypeOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 py-0.5 text-xs cursor-pointer hover:text-accent"
              >
                <input
                  type="checkbox"
                  checked={filters.vendorType.includes(opt.value as typeof VENDOR_TYPE_OPTIONS[number])}
                  onChange={() => {
                    const current = filters.vendorType;
                    const newTypes = current.includes(opt.value as typeof VENDOR_TYPE_OPTIONS[number])
                      ? current.filter((t) => t !== opt.value)
                      : [...current, opt.value as typeof VENDOR_TYPE_OPTIONS[number]];
                    setFilters({ vendorType: newTypes });
                  }}
                  className="w-3 h-3 rounded border-border text-accent focus:ring-accent"
                />
                <span className={cn(
                  filters.vendorType.includes(opt.value as typeof VENDOR_TYPE_OPTIONS[number])
                    ? 'text-foreground font-medium'
                    : 'text-muted'
                )}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Country */}
        <FilterSection title="Country">
          <Select
            options={countryOptions}
            placeholder="All countries"
            value={filters.country}
            onChange={(e) => setFilters({ country: e.target.value, state: '', city: '' })}
          />
        </FilterSection>

        {/* State */}
        <FilterSection title="State">
          <Select
            options={stateOptions}
            placeholder="All states"
            value={filters.state}
            onChange={(e) => setFilters({ state: e.target.value, city: '' })}
          />
        </FilterSection>

        {/* City */}
        <FilterSection title="City">
          <input
            type="text"
            placeholder="Filter by city"
            className="input-base"
            value={filters.city}
            onChange={(e) => setFilters({ city: e.target.value })}
          />
        </FilterSection>

        {/* Location */}
        <FilterSection title="Location">
          <input
            type="text"
            placeholder="Filter by location"
            className="input-base"
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
          />
        </FilterSection>

        {/* Area Performing */}
        <FilterSection title="Area Performing">
          <input
            type="text"
            placeholder="Filter by area"
            className="input-base"
            value={filters.areaPerforming}
            onChange={(e) => setFilters({ areaPerforming: e.target.value })}
          />
        </FilterSection>

        {/* Company */}
        <FilterSection title="Company">
          <input
            type="text"
            placeholder="Filter by company"
            className="input-base"
            value={filters.company}
            onChange={(e) => setFilters({ company: e.target.value })}
          />
        </FilterSection>

        {/* Tags */}
        <FilterSection title="Tags">
          <TagInput
            value={filters.tags}
            onChange={(tags) => setFilters({ tags })}
          />
        </FilterSection>

        {/* Favorites */}
        <FilterSection title="Favorites">
          <button
            onClick={() =>
              setFilters({
                isFavorite: filters.isFavorite === true ? null : true,
              })
            }
            className={cn(
              'flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors',
              filters.isFavorite === true
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-border text-muted hover:bg-hover-bg'
            )}
          >
            <Star className={cn('w-3 h-3', filters.isFavorite === true && 'fill-current')} />
            Favorites Only
          </button>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-2xs font-semibold text-muted uppercase tracking-wider mb-1">{title}</div>
      {children}
    </div>
  );
}

function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = React.useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex gap-1 mb-1">
        <input
          type="text"
          placeholder="Add tag"
          className="input-base flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
        />
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-2xs bg-accent-light text-accent rounded"
            >
              {tag}
              <button
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="hover:text-blue-900"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
