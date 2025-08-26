import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFilter, TaskStats, SubItem, CompletionRecord } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useSupabaseTasks(filters?: TaskFilter) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Query para carregar tarefas
  const { data: tasks = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Carregando tarefas do Supabase...');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true })
        .order('task_order', { ascending: true });

      if (error) {
        console.error('Erro ao carregar tarefas:', error);
        throw error;
      }

      console.log(`${data?.length || 0} tarefas carregadas do Supabase`);

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
        completionHistory: (task.completion_history as unknown as CompletionRecord[]) || [],
        forwardHistory: (task.forward_history as unknown as Task['forwardHistory']) || [],
        forwardCount: task.forward_count || 0,
        order: task.task_order || 0,
        deliveryDates: task.delivery_dates || [],
        isRecurrent: false,
        isRoutine: task.is_routine || false,
        isForwarded: task.is_forwarded || false,
        isConcluded: task.is_concluded || false,
        concludedAt: task.concluded_at || undefined,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));

      setAllTasks(convertedTasks);
      return convertedTasks;
    },
    enabled: !!user,
    staleTime: 1000 * 30, // 30 segundos
    gcTime: 1000 * 60 * 5, // 5 minutos
  });

  // Filtrar tarefas usando useMemo para otimização
  const filteredTasks = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return tasks;
    }

    const today = getCurrentDateInSaoPaulo();

    return tasks.filter(task => {
      // Filtro por data
      if (filters.dateRange) {
        const taskDate = task.scheduledDate;
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;
        
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
      }

      // Filtro por tipo
      if (filters.type && filters.type.length > 0) {
        if (!filters.type.includes(task.type)) {
          return false;
        }
      }

      // Filtro por prioridade
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(task.priority)) {
          return false;
        }
      }

      // Filtro por status - separando "não feito" dos outros status
      if (filters.status && filters.status.length > 0) {
        if (filters.status.includes('not-done')) {
          const hasNotDoneStatus = task.completionHistory?.some(completion => 
            completion.status === 'not-done'
          );
          if (!hasNotDoneStatus) {
            return false;
          }
        } else {
          if (!filters.status.includes(task.status)) {
            return false;
          }
        }
      }

      // Filtro por pessoa
      if (filters.assignedPersonId) {
        if (task.assignedPersonId !== filters.assignedPersonId) {
          return false;
        }
      }

      // Filtro por tempo de investimento
      if (filters.timeInvestment && filters.timeInvestment.length > 0) {
        if (!filters.timeInvestment.includes(task.timeInvestment)) {
          return false;
        }
      }

      // Filtro por categoria
      if (filters.category && filters.category.length > 0) {
        if (!filters.category.includes(task.category)) {
          return false;
        }
      }

      // Filtro por checklist
      if (filters.hasChecklist !== undefined) {
        const hasSubItems = task.subItems && task.subItems.length > 0;
        if (filters.hasChecklist !== hasSubItems) {
          return false;
        }
      }

      // Filtro por reagendadas - LÓGICA SIMPLES
      if (filters.isForwarded !== undefined) {
        // Lógica simples: tarefa em data futura E tem histórico de reagendamento
        const wasRescheduledToFuture = task.scheduledDate > today && 
          task.forwardHistory && 
          task.forwardHistory.length > 0;
        
        if (filters.isForwarded !== wasRescheduledToFuture) {
          return false;
        }
      }

      // Filtro por sem ordem
      if (filters.noOrder !== undefined) {
        const hasNoOrder = !task.order || task.order === 0;
        if (filters.noOrder !== hasNoOrder) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Adicionar nova tarefa
  const addTask = useCallback(async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    if (!user) return;
    
    try {
      console.log('Adicionando tarefa no Supabase:', newTask);
      
      const taskData = {
        title: newTask.title,
        description: newTask.description || '',
        observations: newTask.observations || '',
        scheduled_date: newTask.scheduledDate,
        type: newTask.type,
        priority: newTask.priority,
        status: newTask.status,
        assigned_person_id: newTask.assignedPersonId || null,
        time_investment: newTask.timeInvestment,
        custom_time_minutes: newTask.customTimeMinutes || null,
        category: newTask.category,
        sub_items: JSON.parse(JSON.stringify(newTask.subItems || [])),
        completion_history: JSON.parse(JSON.stringify(newTask.completionHistory || [])),
        forward_history: JSON.parse(JSON.stringify(newTask.forwardHistory || [])),
        forward_count: newTask.forwardCount || 0,
        task_order: newTask.order || 0,
        delivery_dates: newTask.deliveryDates || [],
        is_routine: newTask.isRoutine || false,
        is_forwarded: newTask.isForwarded || false,
        is_concluded: newTask.isConcluded || false,
        concluded_at: newTask.concludedAt || null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      console.log('Tarefa adicionada com sucesso:', data);
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error: any) {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar tarefa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [user?.id, queryClient]);

  // Atualizar tarefa - PRESERVANDO assignedPersonId
  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    try {
      console.log('Atualizando tarefa no Supabase:', taskId, updates);
      
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) {
        throw new Error('Tarefa não encontrada');
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.observations !== undefined) updateData.observations = updates.observations;
      if (updates.scheduledDate !== undefined) updateData.scheduled_date = updates.scheduledDate;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.timeInvestment !== undefined) updateData.time_investment = updates.timeInvestment;
      if (updates.customTimeMinutes !== undefined) updateData.custom_time_minutes = updates.customTimeMinutes;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.subItems !== undefined) updateData.sub_items = JSON.parse(JSON.stringify(updates.subItems));
      if (updates.completionHistory !== undefined) updateData.completion_history = JSON.parse(JSON.stringify(updates.completionHistory));
      if (updates.forwardHistory !== undefined) updateData.forward_history = JSON.parse(JSON.stringify(updates.forwardHistory));
      if (updates.forwardCount !== undefined) updateData.forward_count = updates.forwardCount;
      if (updates.order !== undefined) updateData.task_order = updates.order;
      if (updates.deliveryDates !== undefined) updateData.delivery_dates = updates.deliveryDates;
      if (updates.isRoutine !== undefined) updateData.is_routine = updates.isRoutine;
      if (updates.isForwarded !== undefined) updateData.is_forwarded = updates.isForwarded;
      if (updates.isConcluded !== undefined) updateData.is_concluded = updates.isConcluded;
      if (updates.concludedAt !== undefined) updateData.concluded_at = updates.concludedAt;
      
      if (updates.assignedPersonId !== undefined) {
        updateData.assigned_person_id = updates.assignedPersonId;
      } else {
        updateData.assigned_person_id = currentTask.assignedPersonId || null;
      }

      console.log('Dados de atualização (preservando assignedPersonId):', updateData);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Tarefa atualizada com sucesso:', data);
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error: any) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [user?.id, queryClient, tasks]);

  // Concluir tarefa - FUNÇÃO ADICIONADA
  const concludeTask = useCallback(async (taskId: string) => {
    try {
      await updateTask(taskId, {
        isConcluded: true,
        concludedAt: new Date().toISOString()
      });
      
      toast({
        title: "Tarefa concluída",
        description: "Tarefa marcada como concluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao concluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [updateTask]);

  // Deletar tarefa
  const deleteTask = useCallback(async (taskId: string) => {
    if (!user) return;
    
    try {
      console.log('Deletando tarefa no Supabase:', taskId);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Tarefa deletada com sucesso');
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error: any) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar tarefa: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [user?.id, queryClient]);

  // Reordenar tarefas
  const reorderTasks = useCallback(async (taskIds: string[]) => {
    if (!user) return;
    
    try {
      console.log('Reordenando tarefas no Supabase:', taskIds);
      
      const updates = taskIds.map((taskId, index) => ({
        id: taskId,
        task_order: index + 1,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('tasks')
          .update({ task_order: update.task_order, updated_at: update.updated_at })
          .eq('id', update.id)
          .eq('user_id', user.id);

        if (error) throw error;
      }

      console.log('Tarefas reordenadas com sucesso');
      
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error: any) {
      console.error('Erro ao reordenar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar tarefas: " + error.message,
        variant: "destructive"
      });
      throw error;
    }
  }, [user?.id, queryClient]);

  // Obter tarefas por data
  const getTasksByDate = useCallback((date: string): Task[] => {
    return filteredTasks.filter(task => task.scheduledDate === date);
  }, [filteredTasks]);

  // Obter estatísticas
  const getStats = useCallback((): TaskStats => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.isConcluded).length;
    const pendingTasks = totalTasks - completedTasks;
    
    const today = getCurrentDateInSaoPaulo();
    const overdueTasks = filteredTasks.filter(t => 
      !t.isConcluded && t.scheduledDate < today
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageForwards = totalTasks > 0 
      ? filteredTasks.reduce((acc, task) => acc + (task.forwardCount || 0), 0) / totalTasks 
      : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageForwards
    };
  }, [filteredTasks]);

  // Setup real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Mudança em tempo real detectada:', payload);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return {
    tasks: filteredTasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    getTasksByDate,
    getStats,
    concludeTask,
    refetch
  };
}
