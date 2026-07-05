import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Phone, MessageCircle, Mail, Globe, Edit, Trash2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { BulkActions } from './BulkActions';
import { ColumnToggle } from './ColumnToggle';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useToggleFavorite, useDeleteVendor } from '@/features/vendors/hooks/useVendorMutation';
import { getVendorInitials, getVendorTypeColor } from '@/features/vendors/utils/vendorHelpers';
import { formatRelativeTime } from '@/utils/formatters';
import type { Vendor } from '@/types/vendor';
import { cn } from '@/utils/cn';

const columnHelper = createColumnHelper<Vendor>();

interface VendorTableProps {
  vendors: Vendor[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function VendorTable({ vendors, isLoading, hasMore, onLoadMore }: VendorTableProps) {
  const canEdit = useAuthStore((s) => s.canEdit());
  const canDelete = useAuthStore((s) => s.canDelete());
  const openDrawer = useVendorStore((s) => s.openDrawer);
  const toggleFav = useToggleFavorite();
  const deleteVendor = useDeleteVendor();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleDelete = useCallback((vendor: Vendor) => {
    if (window.confirm(`Delete vendor "${vendor.name}"?`)) {
      deleteVendor.mutate(vendor.id);
    }
  }, [deleteVendor]);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="w-3 h-3 rounded border-border text-accent"
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="w-3 h-3 rounded border-border text-accent"
            aria-label={`Select ${row.original.name}`}
          />
        ),
        size: 32,
        enableSorting: false,
        enableResizing: false,
      }),

      columnHelper.accessor('name', {
        header: 'Vendor',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-accent-light text-accent flex items-center justify-center text-2xs font-bold flex-shrink-0">
              {getVendorInitials(row.original)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{row.original.name}</div>
              {row.original.designation && (
                <div className="text-2xs text-muted truncate">{row.original.designation}</div>
              )}
            </div>
          </div>
        ),
        size: 180,
      }),

      columnHelper.accessor('company', {
        header: 'Company',
        cell: (info) => <span className="text-xs truncate">{info.getValue() || '—'}</span>,
        size: 140,
      }),

      columnHelper.accessor('vendorType', {
        header: 'Vendor Type',
        cell: (info) => (
          <div className="flex flex-wrap gap-0.5">
            {info.getValue().map((type) => (
              <Badge key={type} className={cn('text-2xs', getVendorTypeColor(type))}>
                {type}
              </Badge>
            ))}
          </div>
        ),
        size: 160,
        enableSorting: false,
      }),

      columnHelper.accessor('location', {
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-xs truncate">
            {[row.original.location, row.original.city].filter(Boolean).join(', ') || '—'}
          </span>
        ),
        size: 140,
      }),

      columnHelper.accessor('areaPerforming', {
        header: 'Area',
        cell: (info) => <span className="text-xs truncate">{info.getValue() || '—'}</span>,
        size: 120,
      }),

      columnHelper.accessor('country', {
        header: 'Country',
        cell: (info) => <span className="text-xs truncate">{info.getValue() || '—'}</span>,
        size: 100,
      }),

      columnHelper.accessor('mobile', {
        header: 'Phone',
        cell: (info) => {
          const phone = info.getValue();
          return phone ? (
            <a href={`tel:${phone}`} className="text-xs text-accent hover:underline">{phone}</a>
          ) : (
            <span className="text-2xs text-muted">—</span>
          );
        },
        size: 120,
      }),

      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => {
          const email = info.getValue();
          return email ? (
            <a href={`mailto:${email}`} className="text-xs text-accent hover:underline truncate">{email}</a>
          ) : (
            <span className="text-2xs text-muted">—</span>
          );
        },
        size: 180,
      }),

      columnHelper.accessor('whatsappUrl', {
        header: 'WhatsApp',
        cell: (info) => {
          const url = info.getValue();
          return url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-2xs text-muted">—</span>
          );
        },
        size: 70,
      }),

      columnHelper.accessor('website', {
        header: 'Website',
        cell: (info) => {
          const website = info.getValue();
          return website ? (
            <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-xs truncate">
              {website.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            <span className="text-2xs text-muted">—</span>
          );
        },
        size: 140,
      }),

      columnHelper.accessor('updatedAt', {
        header: 'Last Updated',
        cell: (info) => (
          <span className="text-2xs text-muted">{formatRelativeTime(info.getValue())}</span>
        ),
        size: 100,
      }),

      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => toggleFav.mutate({ id: row.original.id, isFavorite: !row.original.isFavorite })}
              className={cn(
                'p-0.5 rounded',
                row.original.isFavorite ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
              )}
              aria-label="Toggle favorite"
            >
              <Star className={cn('w-3 h-3', row.original.isFavorite && 'fill-current')} />
            </button>
            {canEdit && (
              <button onClick={() => openDrawer(row.original.id)} className="p-0.5 rounded text-muted hover:text-accent" aria-label="Edit">
                <Edit className="w-3 h-3" />
              </button>
            )}
            {canDelete && (
              <button onClick={() => handleDelete(row.original)} className="p-0.5 rounded text-muted hover:text-danger" aria-label="Delete">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ),
        size: 80,
        enableSorting: false,
      }),
    ],
    [canEdit, canDelete, openDrawer, toggleFav, handleDelete]
  );

  const table = useReactTable({
    data: vendors,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: {
      pagination: { pageSize: 100 },
    },
  });

  const selectedVendors = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  if (isLoading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Loading vendors..." />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <EmptyState
        title="No vendors found"
        description="Add your first vendor or adjust your filters."
        className="h-full"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Table toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border flex-shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-2xs text-muted">
            {vendors.length} vendors
            {selectedVendors.length > 0 && ` · ${selectedVendors.length} selected`}
          </span>
        </div>
        <ColumnToggle table={table} />
      </div>

      {/* Bulk actions bar */}
      {selectedVendors.length > 0 && (
        <BulkActions
          selectedVendors={selectedVendors}
          onClearSelection={() => table.resetRowSelection()}
        />
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="table-header-cell whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-0.5',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground'
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-gray-300">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="w-2.5 h-2.5 text-accent" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="w-2.5 h-2.5 text-accent" />
                            ) : (
                              <ArrowUpDown className="w-2.5 h-2.5" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'hover:bg-hover-bg transition-colors',
                  row.getIsSelected() && 'bg-accent-light'
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="table-cell"
                    style={{ width: cell.column.getSize(), maxWidth: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border flex-shrink-0 bg-white">
        <span className="text-2xs text-muted">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronLeft className="w-3 h-3" />}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<ChevronRight className="w-3 h-3" />}
            onClick={() => {
              if (table.getCanNextPage()) {
                table.nextPage();
              } else if (hasMore) {
                onLoadMore();
              }
            }}
            disabled={!table.getCanNextPage() && !hasMore}
          >
            {hasMore && !table.getCanNextPage() ? 'Load More' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
