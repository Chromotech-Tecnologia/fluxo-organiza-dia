import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';

export function useUserStatus() {
  const [isUserDisabled, setIsUserDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  const checkUserStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se o usuário tem alguma role ativa
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      // Se não tem roles ou está vazio, usuário está desabilitado
      const isDisabled = !roles || roles.length === 0;
      setIsUserDisabled(isDisabled);
      
    } catch (error) {
      console.error('Error checking user status:', error);
      // Em caso de erro, assumir que usuário está ativo para não bloquear desnecessariamente
      setIsUserDisabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [user]);

  return {
    isUserDisabled,
    loading,
    checkUserStatus
  };
}