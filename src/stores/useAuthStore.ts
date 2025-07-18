import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  setUser: (user: any | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  signOut: () => set({ user: null, isAuthenticated: false }),
}));