import { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Download, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { fetchAllVendorsForExport } from '@/features/vendors/services/vendorService';
import { EXPORT_COLUMNS } from '@/config/constants';
import type { Vendor } from '@/types/vendor';
import type { ExportScope } from '@/types/common';
import { cn } from '@/utils/cn';

interface ExportMenuProps {
  currentVendors: Vendor[];
}

export function ExportMenu({ currentVendors }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { filters, selectedIds } = useVendorStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for custom event from toolbar
  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener('openExportMenu', handleOpen);
    return () => window.removeEventListener('openExportMenu', handleOpen);
  }, []);

  const exportVendors = useCallback(async (scope: ExportScope) => {
    setIsExporting(true);
    try {
      let vendors: Vendor[];

      switch (scope) {
        case 'current':
          vendors = currentVendors;
          break;
        case 'selected':
          vendors = currentVendors.filter((v) => selectedIds.has(v.id));
          break;
        case 'filtered':
          vendors = await fetchAllVendorsForExport(filters);
          break;
        case 'all':
          vendors = await fetchAllVendorsForExport({
            vendorType: [],
            country: '',
            state: '',
            city: '',
            location: '',
            areaPerforming: '',
            company: '',
            tags: [],
            isFavorite: null,
            searchQuery: '',
          });
          break;
        default:
          vendors = currentVendors;
      }

      // Build export data
      const exportData = vendors.map((vendor) => {
        const row: Record<string, string> = {};
        EXPORT_COLUMNS.forEach(({ key, label }) => {
          const value = vendor[key as keyof Vendor];
          if (Array.isArray(value)) {
            row[label] = value.join(', ');
          } else {
            row[label] = String(value || '');
          }
        });
        return row;
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');

      // Auto-size columns
      const maxWidths = EXPORT_COLUMNS.map(({ label }) => {
        const dataWidths = exportData.map((row) => String(row[label] || '').length);
        return Math.min(Math.max(label.length, ...dataWidths) + 2, 40);
      });
      ws['!cols'] = maxWidths.map((w) => ({ wch: w }));

      // Download
      const fileName = `vendors_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  }, [currentVendors, selectedIds, filters]);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {isOpen && (
        <div className="absolute right-0 top-0 mt-8 z-30 bg-white border border-border rounded shadow-elevated min-w-[200px]">
          <div className="p-1.5 text-2xs font-semibold text-muted uppercase tracking-wider px-2.5">
            Export Vendors
          </div>
          <div className="border-t border-border">
            <ExportOption
              label="Current View"
              description={`${currentVendors.length} vendors`}
              onClick={() => exportVendors('current')}
              disabled={isExporting}
            />
            <ExportOption
              label="Selected Vendors"
              description={`${selectedIds.size} selected`}
              onClick={() => exportVendors('selected')}
              disabled={isExporting || selectedIds.size === 0}
            />
            <ExportOption
              label="Filtered Vendors"
              description="All matching filters"
              onClick={() => exportVendors('filtered')}
              disabled={isExporting}
            />
            <ExportOption
              label="Entire Database"
              description="All vendors"
              onClick={() => exportVendors('all')}
              disabled={isExporting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ExportOption({
  label,
  description,
  onClick,
  disabled,
}: {
  label: string;
  description: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left hover:bg-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <FileSpreadsheet className="w-3.5 h-3.5 text-muted flex-shrink-0" />
      <div>
        <div className="text-xs text-foreground">{label}</div>
        <div className="text-2xs text-muted">{description}</div>
      </div>
    </button>
  );
}
