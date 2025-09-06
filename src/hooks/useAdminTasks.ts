import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFilter, SubItem, CompletionRecord } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AdminTasksParams {
  userId?: string;
  filters?: TaskFilter;
}

export function useAdminTasks({ userId, filters }: AdminTasksParams) {
  const queryClient = useQueryClient();

  // Query para carregar tarefas do usuário especificado
  const { data: tasks = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-tasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log('Carregando tarefas do usuário:', userId);
      
      // Debug: Check authentication context
      try {
        const { data: authDebug, error: debugError } = await supabase.rpc('debug_auth_context');
        if (debugError) {
          console.error('Erro ao verificar contexto de auth:', debugError);
        } else {
          console.log('Context de auth:', authDebug);
        }
      } catch (debugErr) {
        console.log('Debug auth não disponível:', debugErr);
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true })
        .order('task_order', { ascending: true });

      if (error) {
        console.error('Erro ao carregar tarefas:', error);
        throw error;
      }

      console.log(`${data?.length || 0} tarefas carregadas do Supabase para usuário ${userId}`);
      console.log('Primeiras tarefas:', data?.slice(0, 3));

      // Converter dados do Supabase para o tipo Task com validação de tipos
      const convertedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        observations: task.observations || '',
        scheduledDate: task.scheduled_date,
        type: task.type as Task['type'],
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        assignedPersonId: task.assigned_person_id || undefined,
        timeInvestment: task.time_investment as Task['timeInvestment'],
        customTimeMinutes: task.custom_time_minutes || undefined,
        category: task.category as Task['category'],
        subItems: (task.sub_items as unknown as SubItem[]) || [],
        deliveryDates: task.delivery_dates ? JSON.parse(task.delivery_dates as unknown as string) : [],
        completionHistory: (task.completion_history as unknown as CompletionRecord[]) || [],
        forwardHistory: task.forward_history ? JSON.parse(task.forward_history as unknown as string) : [],
        isRoutine: task.is_routine || false,
        isConcluded: task.is_concluded || false,
        concludedAt: task.concluded_at || undefined,
        order: task.task_order || 0,
        userId: task.user_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at || task.created_at,
        isRecurrent: false,
        forwardCount: task.forward_history ? JSON.parse(task.forward_history as unknown as string)?.length || 0 : 0,
        isForwarded: task.forward_history ? JSON.parse(task.forward_history as unknown as string)?.length > 0 : false
      }));

      console.log(`Tarefas convertidas: ${convertedTasks.length}`);
      return convertedTasks;
    },
    enabled: !!userId
  });

  // Aplicar filtros nas tarefas carregadas
  const filteredTasks = useMemo(() => {
    if (!filters || !tasks.length) return tasks;

    return tasks.filter(task => {
      // Filtro de data
      if (filters.dateRange) {
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;
        
        if (startDate && task.scheduledDate < startDate) return false;
        if (endDate && task.scheduledDate > endDate) return false;
      }

      // Filtro de tipo
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(task.type)) return false;
      }

      // Filtro de prioridade
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(task.priority)) return false;
      }

      // Filtro de status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(task.status)) return false;
      }

      // Filtro de tempo de investimento
      if (filters.timeInvestment && filters.timeInvestment.length > 0) {
        if (!filters.timeInvestment.includes(task.timeInvestment)) return false;
      }

      // Filtro de categoria
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(task.category)) return false;
      }

      // Filtro de processamento
      if (filters.isProcessed !== undefined) {
        const isProcessed = task.completionHistory && task.completionHistory.length > 0;
        if (filters.isProcessed !== isProcessed) return false;
      }

      // Filtro de reagendamento
      if (filters.isForwarded !== undefined) {
        const isForwarded = task.forwardHistory && task.forwardHistory.length > 0;
        if (filters.isForwarded !== isForwarded) return false;
      }

      // Filtro de checklist
      if (filters.hasChecklist !== undefined) {
        const hasChecklist = task.subItems && task.subItems.length > 0;
        if (filters.hasChecklist !== hasChecklist) return false;
      }

      // Filtro de ordem
      if (filters.noOrder !== undefined) {
        const hasNoOrder = !task.order || task.order === 0;
        if (filters.noOrder !== hasNoOrder) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Função para atualizar tarefa
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      console.log('Atualizando tarefa:', taskId, updates);

      // Converter dados para formato do banco
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
      if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.assignedPersonId !== undefined) dbUpdates.assigned_person_id = updates.assignedPersonId;
      if (updates.timeInvestment !== undefined) dbUpdates.time_investment = updates.timeInvestment;
      if (updates.customTimeMinutes !== undefined) dbUpdates.custom_time_minutes = updates.customTimeMinutes;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.subItems !== undefined) dbUpdates.sub_items = updates.subItems;
      if (updates.deliveryDates !== undefined) dbUpdates.delivery_dates = JSON.stringify(updates.deliveryDates);
      if (updates.completionHistory !== undefined) dbUpdates.completion_history = updates.completionHistory;
      if (updates.forwardHistory !== undefined) dbUpdates.forward_history = JSON.stringify(updates.forwardHistory);
      if (updates.isRoutine !== undefined) dbUpdates.is_routine = updates.isRoutine;
      
      if (updates.isConcluded !== undefined) dbUpdates.is_concluded = updates.isConcluded;
      if (updates.concludedAt !== undefined) dbUpdates.concluded_at = updates.concludedAt;
      if (updates.order !== undefined) dbUpdates.task_order = updates.order;
      if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId);

      if (error) throw error;

      // Invalidar cache para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['admin-tasks', userId] });

      console.log('Tarefa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
      throw error;
    }
  }, [queryClient, userId]);

  // Função para deletar tarefa
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      console.log('Deletando tarefa:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['admin-tasks', userId] });
      
      toast({
        title: "Sucesso",
        description: "Tarefa deletada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar tarefa",
        variant: "destructive"
      });
      throw error;
    }
  }, [queryClient, userId]);

  // Função para concluir tarefa
  const concludeTask = useCallback(async (taskId: string) => {
    try {
      console.log('Concluindo tarefa:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .update({
          is_concluded: true,
          concluded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['admin-tasks', userId] });
      
      toast({
        title: "Sucesso",
        description: "Tarefa concluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa",
        variant: "destructive"
      });
      throw error;
    }
  }, [queryClient, userId]);

  // Função para reordenar tarefas
  const reorderTasks = useCallback(async (taskIds: string[]) => {
    try {
      console.log('Reordenando tarefas:', taskIds);
      
      for (let i = 0; i < taskIds.length; i++) {
        await supabase
          .from('tasks')
          .update({ task_order: i + 1 })
          .eq('id', taskIds[i]);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-tasks', userId] });
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar tarefas",
        variant: "destructive"
      });
    }
  }, [queryClient, userId]);

  return {
    tasks: filteredTasks,
    loading,
    refetch,
    updateTask,
    deleteTask,
    concludeTask,
    reorderTasks
  };
}