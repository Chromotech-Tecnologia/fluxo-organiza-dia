
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import LandingPage from '@/pages/LandingPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, isAuthenticated, loading, setSession, setLoading } = useAuthStore();
  const location = useLocation();

  // Routes that don't require authentication
  const publicRoutes = ['/landing', '/auth', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    return <LandingPage />;
  }

  return <>{children}</>;
}
