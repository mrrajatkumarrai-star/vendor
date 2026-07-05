import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types/user';
import { hasPermission } from '@/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole = 'viewer' }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageSpinner label="Authenticating..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(user.role, requiredRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">Access Denied</h2>
          <p className="text-xs text-muted">
            You don't have permission to access this page. Required role: {requiredRole}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
