import { useAuthStore } from '@/features/auth/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { User, Shield, Mail, Calendar } from 'lucide-react';

export function SettingsPanel() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const roleBadgeVariant = user.role === 'admin' ? 'danger' : user.role === 'manager' ? 'accent' : 'default';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-0.5">Settings</h2>
        <p className="text-xs text-muted">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <section className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted" />
          Profile
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Display Name" value={user.displayName} />
          <InfoField label="Email" value={user.email} icon={<Mail className="w-3 h-3" />} />
          <InfoField
            label="Role"
            value={
              <Badge variant={roleBadgeVariant}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            }
            icon={<Shield className="w-3 h-3" />}
          />
          <InfoField
            label="Member Since"
            value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            icon={<Calendar className="w-3 h-3" />}
          />
        </div>
      </section>

      {/* Permissions */}
      <section className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-muted" />
          Permissions
        </h3>

        <div className="space-y-1">
          <PermissionRow label="View vendors" allowed={true} />
          <PermissionRow label="Create vendors" allowed={user.role !== 'viewer'} />
          <PermissionRow label="Edit vendors" allowed={user.role !== 'viewer'} />
          <PermissionRow label="Delete vendors" allowed={user.role === 'admin'} />
          <PermissionRow label="Import vendors" allowed={user.role !== 'viewer'} />
          <PermissionRow label="Export vendors" allowed={true} />
          <PermissionRow label="Manage users" allowed={user.role === 'admin'} />
        </div>
      </section>

      {/* Role descriptions */}
      <section className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Role Reference</h3>
        <div className="space-y-2">
          <RoleDescription
            role="Admin"
            description="Full access to all features including vendor deletion and user management."
          />
          <RoleDescription
            role="Manager"
            description="Can create, edit, and import vendors. Cannot delete vendors or manage users."
          />
          <RoleDescription
            role="Viewer"
            description="Read-only access. Can view and export vendor data."
          />
        </div>
      </section>
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-2xs font-medium text-muted mb-0.5 flex items-center gap-1">
        {icon}
        {label}
      </div>
      <div className="text-xs text-foreground">{value}</div>
    </div>
  );
}

function PermissionRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-foreground">{label}</span>
      <span className={`text-2xs font-medium ${allowed ? 'text-success' : 'text-muted'}`}>
        {allowed ? 'Allowed' : 'Denied'}
      </span>
    </div>
  );
}

function RoleDescription({ role, description }: { role: string; description: string }) {
  return (
    <div className="flex gap-2">
      <Badge variant="default" className="flex-shrink-0">{role}</Badge>
      <span className="text-2xs text-muted">{description}</span>
    </div>
  );
}
