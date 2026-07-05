import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createVendor,
  updateVendor,
  deleteVendor,
  deleteVendorsBatch,
  toggleFavorite,
} from '@/features/vendors/services/vendorService';
import type { VendorFormData } from '@/types/vendor';
import { useAuthStore } from '@/features/auth/store/authStore';

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (data: VendorFormData) => createVendor(data, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCount'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VendorFormData> }) =>
      updateVendor(id, data, user!.uid),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendor', variables.id] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCount'] });
    },
  });
}

export function useDeleteVendorsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteVendorsBatch(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCount'] });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
