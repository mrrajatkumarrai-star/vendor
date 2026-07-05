import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchVendors, fetchVendorById, fetchVendorCount, type VendorQueryResult } from '@/features/vendors/services/vendorService';
import type { VendorFilters } from '@/types/vendor';
import { useDebounce } from '@/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS, PAGE_SIZE } from '@/config/constants';
import type { DocumentSnapshot } from 'firebase/firestore';

export function useVendors(filters: VendorFilters) {
  const debouncedSearch = useDebounce(filters.searchQuery, SEARCH_DEBOUNCE_MS);

  const effectiveFilters: VendorFilters = {
    ...filters,
    searchQuery: debouncedSearch,
  };

  return useInfiniteQuery<VendorQueryResult, Error>({
    queryKey: ['vendors', effectiveFilters],
    queryFn: async ({ pageParam }) => {
      return fetchVendors(
        effectiveFilters,
        PAGE_SIZE,
        pageParam as DocumentSnapshot | null | undefined
      );
    },
    initialPageParam: null as DocumentSnapshot | null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.lastDoc : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorById(id: string | null) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () => fetchVendorById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorCount(filters?: VendorFilters) {
  const debouncedFilters = filters ? {
    ...filters,
    searchQuery: useDebounce(filters.searchQuery, SEARCH_DEBOUNCE_MS),
  } : undefined;

  return useQuery({
    queryKey: ['vendorCount', debouncedFilters],
    queryFn: () => fetchVendorCount(debouncedFilters),
    staleTime: 30 * 1000,
  });
}
