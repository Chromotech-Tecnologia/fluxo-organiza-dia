import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFilter, TaskStats } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';

export function useSupabaseTasks(filters?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar tarefas do Supabase
  const loadTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*');

      // Aplicar filtros se fornecidos
      if (filters) {
        // Filtro por data
        if (filters.dateRange) {
          const startDate = filters.dateRange.start;
          const endDate = filters.dateRange.end;
          query = query.gte('scheduled_date', startDate).lte('scheduled_date', endDate);
        }

        // Filtro por tipo
        if (filters.type && filters.type.length > 0) {
          query = query.in('type', filters.type);
        }

        // Filtro por prioridade
        if (filters.priority && filters.priority.length > 0) {
          query = query.in('priority', filters.priority);
        }

        // Filtro por status
        if (filters.status && filters.status.length > 0) {
          query = query.in('status', filters.status);
        }

        // Filtro por pessoa
        if (filters.assignedPersonId) {
          query = query.eq('assigned_person_id', filters.assignedPersonId);
        }

        // Filtro por número máximo de repasses
        if (filters.maxForwards !== undefined) {
          query = query.lte('forward_count', filters.maxForwards);
        }

        // Filtro por recorrência
        if (filters.isRecurrent !== undefined) {
          query = query.eq('is_recurrent', filters.isRecurrent);
        }
      }

      const { data, error } = await query.order('order', { ascending: true });

      if (error) {
        throw error;
      }

      // Mapear os dados para o formato esperado
      const mappedTasks = data.map(task => ({
        ...task,
        scheduledDate: task.scheduled_date,
        assignedPersonId: task.assigned_person_id,
        isRecurrent: task.is_recurrent,
        routineCycle: task.routine_cycle,
        routineStartDate: task.routine_start_date,
        routineEndDate: task.routine_end_date,
        forwardCount: task.forward_count,
        completionHistory: task.completion_history,
        forwardHistory: task.forward_history,
        isForwarded: task.is_forwarded || false,
        isConcluded: task.is_concluded || false,
        concludedAt: task.concluded_at
      }));

      setTasks(mappedTasks);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas do Supabase",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros (agora desativado, pois o filtro é feito no Supabase)
  const applyFilters = (tasks: Task[], filters: TaskFilter): Task[] => {
    return tasks;
  };

  // Adicionar nova tarefa
  const addTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isForwarded' | 'isConcluded' | 'concludedAt'> | Task) => {
    try {
      const task: Task = 'id' in newTask ? newTask : {
        ...newTask,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completionHistory: [],
        forwardHistory: [],
        forwardCount: 0,
        status: 'pending',
        order: 0,
        deliveryDates: [],
        timeInvestment: newTask.timeInvestment || 'low',
        category: newTask.category || 'personal',
        isRoutine: newTask.isRoutine || false,
        isForwarded: false,
        isConcluded: false,
        concludedAt: null
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            id: task.id,
            created_at: task.createdAt,
            updated_at: task.updatedAt,
            title: task.title,
            description: task.description,
            type: task.type,
            priority: task.priority,
            status: task.status,
            scheduled_date: task.scheduledDate,
            assigned_person_id: task.assignedPersonId,
            order: task.order,
            observations: task.observations,
            is_recurrent: task.isRecurrent,
            routine_cycle: task.routineCycle,
            routine_start_date: task.routineStartDate,
            routine_end_date: task.routineEndDate,
            forward_count: task.forwardCount,
            completion_history: task.completionHistory,
            forward_history: task.forwardHistory,
            delivery_dates: task.deliveryDates,
            time_investment: task.timeInvestment,
            category: task.category,
            is_routine: task.isRoutine,
            sub_items: task.subItems,
            is_forwarded: task.isForwarded,
            is_concluded: task.isConcluded,
            concluded_at: task.concludedAt
          }
        ]);

      if (error) {
        throw error;
      }

      loadTasks();

      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  // Atualizar tarefa
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const supabaseUpdates: { [key: string]: any } = {
        updated_at: new Date().toISOString(),
        ...updates,
      };

      // Mapear os campos para o formato do Supabase
      if (updates.scheduledDate !== undefined) {
        supabaseUpdates.scheduled_date = updates.scheduledDate;
      }
      if (updates.assignedPersonId !== undefined) {
        supabaseUpdates.assigned_person_id = updates.assignedPersonId;
      }
      if (updates.isRecurrent !== undefined) {
        supabaseUpdates.is_recurrent = updates.isRecurrent;
      }
      if (updates.routineCycle !== undefined) {
        supabaseUpdates.routine_cycle = updates.routineCycle;
      }
      if (updates.routineStartDate !== undefined) {
        supabaseUpdates.routine_start_date = updates.routineStartDate;
      }
      if (updates.routineEndDate !== undefined) {
        supabaseUpdates.routine_end_date = updates.routineEndDate;
      }
      if (updates.forwardCount !== undefined) {
        supabaseUpdates.forward_count = updates.forwardCount;
      }
      if (updates.completionHistory !== undefined) {
        supabaseUpdates.completion_history = updates.completionHistory;
      }
      if (updates.forwardHistory !== undefined) {
        supabaseUpdates.forward_history = updates.forwardHistory;
      }
      if (updates.deliveryDates !== undefined) {
        supabaseUpdates.delivery_dates = updates.deliveryDates;
      }
      if (updates.subItems !== undefined) {
        supabaseUpdates.sub_items = updates.subItems;
      }
      if (updates.isForwarded !== undefined) {
        supabaseUpdates.is_forwarded = updates.isForwarded;
      }
      if (updates.isConcluded !== undefined) {
        supabaseUpdates.is_concluded = updates.isConcluded;
      }
      if (updates.concludedAt !== undefined) {
        supabaseUpdates.concluded_at = updates.concludedAt;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      loadTasks();

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  // Deletar tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      loadTasks();

      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover tarefa",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  // Reordenar tarefas
  const reorderTasks = async (taskIds: string[]) => {
    try {
      // Atualizar a ordem de cada tarefa no Supabase
      await Promise.all(
        taskIds.map(async (taskId, index) => {
          const { error } = await supabase
            .from('tasks')
            .update({ order: index })
            .eq('id', taskId);

          if (error) {
            throw error;
          }
        })
      );

      loadTasks();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reordenar tarefas",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  const forwardTask = async (taskId: string, newAssignedPersonId: string) => {
    try {
      // Recuperar a tarefa atual
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) {
        throw taskError;
      }

      if (!taskData) {
        throw new Error("Tarefa não encontrada");
      }

      // Atualizar o histórico de repasses
      const updatedForwardHistory = [
        ...(taskData.forward_history || []),
        {
          forwardedAt: getCurrentDateInSaoPaulo(),
          fromPersonId: taskData.assigned_person_id,
          toPersonId: newAssignedPersonId
        }
      ];

      // Contagem de repasses
      const updatedForwardCount = (taskData.forward_count || 0) + 1;

      // Atualizar a tarefa no Supabase
      const { error } = await supabase
        .from('tasks')
        .update({
          assigned_person_id: newAssignedPersonId,
          forward_history: updatedForwardHistory,
          forward_count: updatedForwardCount
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      loadTasks();

      toast({
        title: "Sucesso",
        description: "Tarefa repassada com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao repassar tarefa",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  const concludeTask = async (taskId: string) => {
    try {
      // Recuperar a tarefa atual
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError) {
        throw taskError;
      }

      if (!taskData) {
        throw new Error("Tarefa não encontrada");
      }

      // Verificar se já tem uma baixa
      const hasCompletion = taskData.completion_history && taskData.completion_history.length > 0;
      const lastCompletion = hasCompletion ? taskData.completion_history[taskData.completion_history.length - 1] : null;

      // Não permitir múltiplas baixas do mesmo tipo
      // if (hasCompletion && lastCompletion?.status === 'completed') {
      //   return; // Já tem essa baixa
      // }

      const completionRecord = {
        completedAt: getCurrentDateInSaoPaulo(),
        status: 'completed',
        date: taskData.scheduled_date,
        wasForwarded: taskData.is_forwarded || false
      };

      const updatedCompletionHistory = [
        ...(taskData.completion_history || []),
        completionRecord
      ];

      // Atualizar a tarefa no Supabase
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completion_history: updatedCompletionHistory,
          is_concluded: true,
          concluded_at: getCurrentDateInSaoPaulo()
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      loadTasks();

      toast({
        title: "Sucesso",
        description: "Tarefa concluída com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa",
        variant: "destructive"
      });
      console.error("Supabase error:", error);
    }
  };

  // Obter tarefas por data
  const getTasksByDate = (date: string): Task[] => {
    try {
      return [];
    } catch (error) {
      console.error('Erro ao buscar tarefas por data:', error);
      return [];
    }
  };

  // Obter estatísticas
  const getStats = (): TaskStats => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    // Tarefas em atraso
    const today = getCurrentDateInSaoPaulo();
    const overdueTasks = tasks.filter(t =>
      t.status === 'pending' && t.scheduledDate < today
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageForwards = totalTasks > 0
      ? tasks.reduce((acc, task) => acc + task.forwardCount, 0) / totalTasks
      : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageForwards
    };
  };

  useEffect(() => {
    loadTasks();
  }, [JSON.stringify(filters)]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    forwardTask,
    concludeTask,
    getTasksByDate,
    getStats,
    refetch: loadTasks
  };
}
