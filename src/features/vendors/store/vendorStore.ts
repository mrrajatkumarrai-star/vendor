import { create } from 'zustand';
import type { ViewMode } from '@/types/common';
import type { VendorFilters } from '@/types/vendor';
import { DEFAULT_VENDOR_FILTERS } from '@/types/vendor';

interface VendorStore {
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Filters
  filters: VendorFilters;
  setFilters: (filters: Partial<VendorFilters>) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selection
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // Drawer
  drawerOpen: boolean;
  editingVendorId: string | null;
  openDrawer: (vendorId?: string) => void;
  closeDrawer: () => void;

  // Import modal
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
}

export const useVendorStore = create<VendorStore>()((set, get) => ({
  // View state
  viewMode: 'mindmap',
  setViewMode: (viewMode) => set({ viewMode }),

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  // Filters
  filters: { ...DEFAULT_VENDOR_FILTERS },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: { ...DEFAULT_VENDOR_FILTERS } }),
  activeFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.vendorType.length > 0) count++;
    if (filters.country) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.location) count++;
    if (filters.areaPerforming) count++;
    if (filters.company) count++;
    if (filters.tags.length > 0) count++;
    if (filters.isFavorite !== null) count++;
    return count;
  },

  // Search
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Selection
  selectedIds: new Set<string>(),
  toggleSelection: (id) =>
    set((state) => {
      const newSet = new Set(state.selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedIds: newSet };
    }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set() }),
  isSelected: (id) => get().selectedIds.has(id),

  // Drawer
  drawerOpen: false,
  editingVendorId: null,
  openDrawer: (vendorId) =>
    set({
      drawerOpen: true,
      editingVendorId: vendorId ?? null,
    }),
  closeDrawer: () =>
    set({
      drawerOpen: false,
      editingVendorId: null,
    }),

  // Import modal
  importModalOpen: false,
  setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
}));
