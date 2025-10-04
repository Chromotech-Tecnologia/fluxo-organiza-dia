import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface TeamInvitation {
  id: string;
  sender_user_id: string;
  recipient_email: string;
  recipient_user_id: string | null;
  team_member_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invitation_token: string;
  invited_at: string;
  accepted_at: string | null;
  expires_at: string;
}

export function useTeamInvitations() {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) {
        // Se for erro de permissão e não houver dados, apenas defina array vazio
        if (error.code === 'PGRST301' || error.message.includes('permission denied')) {
          console.log('No invitations found or access denied');
          setInvitations([]);
        } else {
          throw error;
        }
      } else {
        setInvitations(data || []);
      }
    } catch (error: any) {
      console.error('Error loading invitations:', error);
      // Não mostrar erro se for apenas falta de dados
      if (!error.message?.includes('permission denied')) {
        toast({
          title: 'Erro ao carregar convites',
          description: error.message,
          variant: 'destructive',
        });
      }
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (recipientEmail: string, teamMemberId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('send-team-invitation', {
        body: { recipientEmail, teamMemberId },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao enviar convite');
      }

      // Verificar se há mensagem de erro na resposta de dados
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: 'Convite enviado',
        description: response.data?.message || 'O convite foi enviado com sucesso!',
      });

      await loadInvitations();
      return response.data;
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.message || 'Erro desconhecido ao enviar convite';
      toast({
        title: 'Erro ao enviar convite',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const acceptInvitation = async (invitationToken: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('accept-team-invitation', {
        body: { invitationToken },
      });

      if (response.error) throw response.error;

      toast({
        title: 'Convite aceito',
        description: 'Você agora faz parte da equipe!',
      });

      return response.data;
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: 'Erro ao aceitar convite',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    loadInvitations();

    // Subscribe to changes
    const channel = supabase
      .channel('team_invitations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_invitations',
        },
        () => {
          loadInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    invitations,
    loading,
    sendInvitation,
    acceptInvitation,
    refetch: loadInvitations,
  };
}