import { Providers } from './Providers';
import { Router } from './Router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

function AuthListener() {
  useAuth();
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AuthListener />
        <Router />
      </Providers>
    </ErrorBoundary>
  );
}
