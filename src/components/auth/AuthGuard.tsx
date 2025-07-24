import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/lib/auth';
import { SignInPage } from './SignInPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, setUser } = useAuthStore();

  useEffect(() => {
    // Verificar se já existe usuário logado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, [setUser]);

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  return <>{children}</>;
}