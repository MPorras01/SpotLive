import { create } from 'zustand';
import type { UserRole } from '@spotlive/types';

interface AuthUser {
  id: string;
  email: string;
  role?: UserRole | null;
}

interface AuthStore {
  currentUser: AuthUser | null;
  isHydrated: boolean;
  setCurrentUser: (user: AuthUser | null) => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  currentUser: null,
  isHydrated: false,
  setCurrentUser: (currentUser) => set({ currentUser }),
  setHydrated: (isHydrated) => set({ isHydrated }),
}));
