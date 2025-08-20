
import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ 
    session, 
    user: session?.user ?? null, 
    isAuthenticated: !!session?.user 
  }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null, session: null, isAuthenticated: false }),
}));
