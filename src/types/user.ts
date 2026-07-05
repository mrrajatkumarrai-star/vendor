export type UserRole = 'admin' | 'manager' | 'viewer';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  viewer: 1,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
