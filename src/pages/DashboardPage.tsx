import { useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MindMapView } from '@/features/vendors/components/MindMapView';
import { VendorTable } from '@/features/vendors/components/VendorTable';
import { VendorForm } from '@/features/vendors/components/VendorForm';
import { ImportModal } from '@/features/import/components/ImportModal';
import { ExportMenu } from '@/features/export/components/ExportMenu';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useVendors, useVendorCount } from '@/features/vendors/hooks/useVendors';

export function DashboardPage() {
  const { viewMode, filters, searchQuery } = useVendorStore();

  const effectiveFilters = useMemo(
    () => ({ ...filters, searchQuery }),
    [filters, searchQuery]
  );

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVendors(effectiveFilters);

  const { data: totalCount } = useVendorCount();

  // Flatten paginated results
  const vendors = useMemo(
    () => data?.pages.flatMap((page) => page.vendors) ?? [],
    [data]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar filters */}
      <Sidebar />

      {/* Center content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-gray-50 border-b border-border text-2xs text-muted flex-shrink-0">
          <span>
            Showing {vendors.length} of {totalCount ?? '...'} vendors
          </span>
          <span className="capitalize">{viewMode} view</span>
        </div>

        {/* Main view */}
        <ErrorBoundary>
          <div className="flex-1 overflow-hidden">
            {viewMode === 'mindmap' ? (
              <MindMapView
                vendors={vendors}
                isLoading={isLoading}
                hasMore={!!hasNextPage}
                onLoadMore={handleLoadMore}
              />
            ) : (
              <VendorTable
                vendors={vendors}
                isLoading={isLoading}
                hasMore={!!hasNextPage}
                onLoadMore={handleLoadMore}
              />
            )}
          </div>
        </ErrorBoundary>

        {/* Export menu (positioned absolutely, triggered by toolbar event) */}
        <div className="absolute top-0 right-0 z-20">
          <ExportMenu currentVendors={vendors} />
        </div>
      </div>

      {/* Vendor form drawer */}
      <VendorForm />

      {/* Import modal */}
      <ImportModal />
    </div>
  );
}
