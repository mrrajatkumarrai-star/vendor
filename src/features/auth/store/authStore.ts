import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser, UserRole } from '@/types/user';
import { hasPermission } from '@/types/user';

interface AuthStore {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Derived permission checks
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canManageUsers: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      canCreate: () => {
        const { user } = get();
        return user ? hasPermission(user.role, 'manager') : false;
      },

      canEdit: () => {
        const { user } = get();
        return user ? hasPermission(user.role, 'manager') : false;
      },

      canDelete: () => {
        const { user } = get();
        return user ? hasPermission(user.role, 'admin') : false;
      },

      canManageUsers: () => {
        const { user } = get();
        return user ? hasPermission(user.role, 'admin') : false;
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user ? hasPermission(user.role, role) : false;
      },
    }),
    {
      name: 'vms-auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
