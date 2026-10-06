import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import type { UserRole } from '@handycraft/shared';

interface RequireAuthProps {
  children: React.ReactNode;
  /** If provided, user must have one of these roles */
  roles?: UserRole[];
  /** Where to redirect after successful login */
  redirectTo?: string;
}

export function RequireAuth({ children, roles, redirectTo }: RequireAuthProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/login${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`}
        state={{ from: location }}
        replace
      />
    );
  }

  if (roles && user && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
