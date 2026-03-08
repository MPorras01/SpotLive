'use client';

import type { UserRole } from '@spotlive/types';

import { useAuthStore } from '@/stores/authStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No tienes permisos para acceder a este panel. Configura `NEXT_PUBLIC_DEMO_ROLE=admin` para probar esta vista.
      </div>
    );
  }

  return <>{children}</>;
}
