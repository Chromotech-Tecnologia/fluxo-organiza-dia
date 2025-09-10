import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useImpersonation } from './useImpersonation';

/**
 * Hook que retorna o ID do usuário atual considerando impersonação
 * Se estiver impersonando, retorna o ID do usuário impersonado
 * Caso contrário, retorna o ID do usuário logado
 */
export function useCurrentUserId() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { isImpersonating, impersonatedUser } = useImpersonation();

  useEffect(() => {
    const getCurrentUserId = async () => {
      if (isImpersonating && impersonatedUser) {
        setCurrentUserId(impersonatedUser.id);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUserId(session?.user?.id || null);
      }
    };

    getCurrentUserId();

    // Escutar mudanças na autenticação apenas se não estiver impersonando
    if (!isImpersonating) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isImpersonating) {
          setCurrentUserId(session?.user?.id || null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isImpersonating, impersonatedUser]);

  return currentUserId;
}