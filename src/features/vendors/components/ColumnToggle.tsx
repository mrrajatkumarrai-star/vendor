import { useState } from 'react';
import { Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Table } from '@tanstack/react-table';
import type { Vendor } from '@/types/vendor';

interface ColumnToggleProps {
  table: Table<Vendor>;
}

export function ColumnToggle({ table }: ColumnToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        icon={<Columns3 className="w-3 h-3" />}
        onClick={() => setIsOpen(!isOpen)}
      >
        Columns
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-0.5 z-30 bg-white border border-border rounded shadow-elevated p-2 min-w-[180px]">
            <div className="text-2xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Visible Columns
            </div>
            {table.getAllLeafColumns().map((column) => {
              if (column.id === 'select' || column.id === 'actions') return null;
              return (
                <label
                  key={column.id}
                  className="flex items-center gap-1.5 py-0.5 text-xs cursor-pointer hover:text-accent"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="w-3 h-3 rounded border-border text-accent focus:ring-accent"
                  />
                  <span>{typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
