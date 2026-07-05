import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { loginFormSchema, type LoginFormSchema } from '@/features/vendors/schemas/vendorSchema';
import { loginWithEmail } from '@/features/auth/services/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormSchema) => {
    setError(null);
    try {
      const appUser = await loginWithEmail(data.email, data.password);
      setUser(appUser);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password')) {
        setError('Invalid email or password');
      } else if (message.includes('auth/user-not-found')) {
        setError('No account found with this email');
      } else if (message.includes('auth/too-many-requests')) {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full max-w-[320px]">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-foreground">Vendor Management</h1>
        <p className="text-2xs text-muted mt-0.5">Sign in to your account</p>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 border border-red-200 rounded text-2xs text-danger">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        Sign In
      </Button>
    </form>
  );
}
