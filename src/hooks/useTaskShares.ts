import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useCurrentUserId } from '@/hooks/useCurrentUserId';
import { useQueryClient } from '@tanstack/react-query';

export interface TaskShare {
  id: string;
  task_id: string;
  owner_user_id: string;
  shared_with_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SharedUser {
  id: string;
  email: string;
  name: string;
}

export function useTaskShares() {
  const [shares, setShares] = useState<TaskShare[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = useCurrentUserId();
  const queryClient = useQueryClient();

  const loadShares = useCallback(async () => {
    if (!currentUserId) {
      setShares([]);
      setLoading(false);
      return;
    }

    try {
      // @ts-ignore - Tabela será criada pela migração
      const { data, error } = await (supabase as any)
        .from('task_shares')
        .select('*')
        .or(`owner_user_id.eq.${currentUserId},shared_with_user_id.eq.${currentUserId}`);

      if (error) throw error;
      setShares((data || []) as TaskShare[]);
    } catch (error: any) {
      console.error('Erro ao carregar compartilhamentos:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar compartilhamentos de tarefas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  const shareTask = useCallback(async (taskId: string, sharedWithUserId: string) => {
    if (!currentUserId) return;

    try {
      // @ts-ignore - Tabela será criada pela migração
      const { error } = await (supabase as any)
        .from('task_shares')
        .insert({
          task_id: taskId,
          owner_user_id: currentUserId,
          shared_with_user_id: sharedWithUserId,
        });

      if (error) throw error;

      toast({
        title: 'Tarefa compartilhada',
        description: 'A tarefa foi compartilhada com sucesso',
      });

      await loadShares();
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      console.error('Erro ao compartilhar tarefa:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao compartilhar tarefa: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [currentUserId, loadShares, queryClient]);

  const unshareTask = useCallback(async (taskId: string, sharedWithUserId: string) => {
    if (!currentUserId) return;

    try {
      // @ts-ignore - Tabela será criada pela migração
      const { error } = await (supabase as any)
        .from('task_shares')
        .delete()
        .eq('task_id', taskId)
        .eq('shared_with_user_id', sharedWithUserId)
        .eq('owner_user_id', currentUserId);

      if (error) throw error;

      toast({
        title: 'Compartilhamento removido',
        description: 'O compartilhamento foi removido com sucesso',
      });

      await loadShares();
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    } catch (error: any) {
      console.error('Erro ao remover compartilhamento:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover compartilhamento: ' + error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [currentUserId, loadShares, queryClient]);

  const getSharedUsers = useCallback(async (): Promise<SharedUser[]> => {
    try {
      // Buscar usuários que aceitaram convites (colaboradores)
      const { data: collaborations, error: collabError } = await supabase
        .from('team_collaborations')
        .select('collaborator_user_id')
        .eq('owner_user_id', currentUserId)
        .eq('is_active', true);

      if (collabError) throw collabError;

      if (!collaborations || collaborations.length === 0) {
        return [];
      }

      const userIds = collaborations.map(c => c.collaborator_user_id);

      // Buscar perfis dos usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      return (profiles || []).map(p => ({
        id: p.id,
        email: p.email || '',
        name: p.name || p.email || 'Usuário'
      }));
    } catch (error: any) {
      console.error('Erro ao buscar usuários compartilháveis:', error);
      return [];
    }
  }, [currentUserId]);

  const getTaskShares = useCallback((taskId: string): TaskShare[] => {
    return shares.filter(share => share.task_id === taskId);
  }, [shares]);

  const getTaskSharedByUser = useCallback(async (taskId: string): Promise<{ id: string; name: string; email: string } | null> => {
    const share = shares.find(
      share => share.task_id === taskId && share.shared_with_user_id === currentUserId
    );
    
    if (!share) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', share.owner_user_id)
        .single();

      if (error) throw error;

      return profile ? {
        id: profile.id,
        name: profile.name || profile.email || 'Usuário',
        email: profile.email || ''
      } : null;
    } catch (error) {
      console.error('Erro ao buscar usuário que compartilhou:', error);
      return null;
    }
  }, [shares, currentUserId]);

  const isTaskSharedByMe = useCallback((taskId: string): boolean => {
    return shares.some(
      share => share.task_id === taskId && share.owner_user_id === currentUserId
    );
  }, [shares, currentUserId]);

  const isTaskSharedWithMe = useCallback((taskId: string): boolean => {
    return shares.some(
      share => share.task_id === taskId && share.shared_with_user_id === currentUserId
    );
  }, [shares, currentUserId]);

  useEffect(() => {
    loadShares();

    // Subscribe to changes
    const channel = supabase
      .channel('task_shares_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_shares',
        },
        () => {
          loadShares();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadShares]);

  return {
    shares,
    loading,
    shareTask,
    unshareTask,
    getSharedUsers,
    getTaskShares,
    getTaskSharedByUser,
    isTaskSharedByMe,
    isTaskSharedWithMe,
    refetch: loadShares,
  };
}
