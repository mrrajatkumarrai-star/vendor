import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  Map,
  Table2,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { VENDOR_TYPE_OPTIONS } from '@/types/vendor';
import { COUNTRIES } from '@/config/countries';
import { cn } from '@/utils/cn';

export function Toolbar() {
  const {
    viewMode, setViewMode,
    searchQuery, setSearchQuery,
    filters, setFilters,
    toggleSidebar, sidebarOpen,
    openDrawer,
    setImportModalOpen,
    activeFilterCount,
  } = useVendorStore();
  const canCreate = useAuthStore((s) => s.canCreate());
  const [showToolbarFilters, setShowToolbarFilters] = useState(false);

  const vendorTypeOptions = useMemo(() =>
    VENDOR_TYPE_OPTIONS.map((v) => ({ label: v, value: v })),
    []
  );

  const countryOptions = useMemo(() => COUNTRIES, []);

  const filterCount = activeFilterCount();

  return (
    <div className="border-b border-border bg-white flex-shrink-0">
      {/* Main toolbar row */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Sidebar toggle */}
        <Tooltip content={sidebarOpen ? 'Hide filters' : 'Show filters'}>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            icon={<Filter className="w-3.5 h-3.5" />}
            className={cn(filterCount > 0 && 'text-accent')}
          >
            {filterCount > 0 ? `Filters (${filterCount})` : 'Filters'}
          </Button>
        </Tooltip>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search vendors, companies, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-7 pr-7"
            aria-label="Search vendors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Quick filters toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowToolbarFilters(!showToolbarFilters)}
          className={cn(showToolbarFilters && 'bg-active-bg')}
        >
          Quick Filters
        </Button>

        <div className="w-px h-5 bg-border" />

        {/* View toggle */}
        <div className="flex items-center border border-border rounded overflow-hidden">
          <Tooltip content="Mind Map">
            <button
              onClick={() => setViewMode('mindmap')}
              className={cn(
                'px-2 py-1 text-xs transition-colors',
                viewMode === 'mindmap' ? 'bg-accent text-white' : 'bg-white text-muted hover:bg-hover-bg'
              )}
              aria-label="Mind map view"
            >
              <Map className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Table View">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-2 py-1 text-xs transition-colors',
                viewMode === 'table' ? 'bg-accent text-white' : 'bg-white text-muted hover:bg-hover-bg'
              )}
              aria-label="Table view"
            >
              <Table2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Actions */}
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => openDrawer()}
          >
            Add Vendor
          </Button>
        )}

        {canCreate && (
          <Tooltip content="Import from Excel">
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => setImportModalOpen(true)}
            >
              Import
            </Button>
          </Tooltip>
        )}

        <Tooltip content="Export vendors">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => {
              // Export handled by ExportMenu
              const event = new CustomEvent('openExportMenu');
              window.dispatchEvent(event);
            }}
          >
            Export
          </Button>
        </Tooltip>
      </div>

      {/* Quick filters row */}
      {showToolbarFilters && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border bg-gray-50/50">
          <div className="w-[140px]">
            <Select
              options={vendorTypeOptions}
              placeholder="Vendor Type"
              value={filters.vendorType[0] || ''}
              onChange={(e) =>
                setFilters({
                  vendorType: e.target.value ? [e.target.value as typeof VENDOR_TYPE_OPTIONS[number]] : [],
                })
              }
            />
          </div>
          <div className="w-[140px]">
            <Select
              options={countryOptions}
              placeholder="Country"
              value={filters.country}
              onChange={(e) => setFilters({ country: e.target.value })}
            />
          </div>
          <div className="w-[140px]">
            <input
              type="text"
              placeholder="Location"
              className="input-base"
              value={filters.location}
              onChange={(e) => setFilters({ location: e.target.value })}
            />
          </div>
          <div className="w-[140px]">
            <input
              type="text"
              placeholder="Area"
              className="input-base"
              value={filters.areaPerforming}
              onChange={(e) => setFilters({ areaPerforming: e.target.value })}
            />
          </div>
          <div className="w-[140px]">
            <input
              type="text"
              placeholder="Company"
              className="input-base"
              value={filters.company}
              onChange={(e) => setFilters({ company: e.target.value })}
            />
          </div>

          {filterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                useVendorStore.getState().resetFilters();
              }}
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
