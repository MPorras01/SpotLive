import { create } from 'zustand';
import type { UserRole } from '@spotlive/types';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
}

function getDemoRole(): UserRole {
  const candidate = process.env.NEXT_PUBLIC_DEMO_ROLE;
  const validRoles: UserRole[] = ['visitor', 'user', 'verified_organizer', 'admin', 'advertiser'];
  return validRoles.includes(candidate as UserRole) ? (candidate as UserRole) : 'user';
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: {
    id: 'demo-user-web',
    email: 'demo@spotlive.app',
    role: getDemoRole(),
  },
  setCurrentUser: (currentUser) => set({ currentUser }),
}));
