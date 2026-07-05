import { useEffect } from 'react';
import { onAuthChange, getAppUser } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Hook that listens to Firebase auth state changes and syncs with Zustand store.
 * Should be called once at the app root level.
 */
export function useAuth(): void {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await getAppUser(firebaseUser);
          setUser(appUser);
        } catch (error) {
          console.error('Error resolving user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
}
