import { LoginForm } from '@/features/auth/components/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-sm px-6">
        <LoginForm />
      </div>
    </div>
  );
}
