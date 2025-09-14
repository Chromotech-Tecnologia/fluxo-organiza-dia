import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  trialExpiresAt: string | null;
  isPermanent: boolean;
}

export function useTrialManagement() {
  const [loading, setLoading] = useState(false);

  const getTrialStatus = async (userId: string): Promise<TrialStatus> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('trial_expires_at, is_permanent')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const now = new Date();
      const trialExpires = data?.trial_expires_at ? new Date(data.trial_expires_at) : null;
      const isInTrial = trialExpires ? trialExpires > now && !data?.is_permanent : false;
      const daysRemaining = trialExpires && isInTrial ? 
        Math.max(0, Math.ceil((trialExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      return {
        isInTrial,
        daysRemaining,
        trialExpiresAt: data?.trial_expires_at || null,
        isPermanent: data?.is_permanent || false
      };
    } catch (error) {
      console.error('Error getting trial status:', error);
      return {
        isInTrial: false,
        daysRemaining: 0,
        trialExpiresAt: null,
        isPermanent: false
      };
    }
  };

  const setTrialPeriod = async (userId: string, days: number) => {
    setLoading(true);
    try {
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + days);

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'user',
          trial_expires_at: trialExpiresAt.toISOString(),
          is_permanent: false
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      toast.success(`Período de teste de ${days} dias configurado com sucesso`);
    } catch (error: any) {
      console.error('Error setting trial period:', error);
      toast.error(error.message || 'Erro ao configurar período de teste');
    } finally {
      setLoading(false);
    }
  };

  const activatePermanent = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'user',
          trial_expires_at: null,
          is_permanent: true
        }, {
          onConflict: 'user_id,role'
        });

      if (error) throw error;

      toast.success('Usuário ativado permanentemente');
    } catch (error: any) {
      console.error('Error activating permanent:', error);
      toast.error(error.message || 'Erro ao ativar permanentemente');
    } finally {
      setLoading(false);
    }
  };

  const disableUser = async (userId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Usuário desabilitado');
    } catch (error: any) {
      console.error('Error disabling user:', error);
      toast.error(error.message || 'Erro ao desabilitar usuário');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getTrialStatus,
    setTrialPeriod,
    activatePermanent,
    disableUser
  };
}