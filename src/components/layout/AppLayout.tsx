import { Outlet } from 'react-router-dom';
import { Toolbar } from './Toolbar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { logoutUser } from '@/features/auth/services/authService';
import { LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await logoutUser();
    useAuthStore.getState().logout();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top app bar */}
      <header className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-foreground tracking-tight">
            Vendor Management
          </h1>
          <Badge variant="accent">{user?.role || 'viewer'}</Badge>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-2xs text-muted mr-2">
            {user?.displayName || user?.email}
          </span>

          <Tooltip content="Settings">
            <Link to="/settings">
              <Button variant="ghost" size="sm" icon={<Settings className="w-3.5 h-3.5" />} />
            </Link>
          </Tooltip>

          <Tooltip content="Sign out">
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut className="w-3.5 h-3.5" />}
              onClick={handleLogout}
            />
          </Tooltip>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
