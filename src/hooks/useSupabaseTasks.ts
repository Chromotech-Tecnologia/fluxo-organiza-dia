import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFilter, TaskPriority, TaskStatus, TaskType, TaskTimeInvestment, SubItem } from "@/types";
import { calculateInsertReordering, calculateMoveReordering, OrderAdjustment } from "@/lib/taskOrderUtils";

export function useSupabaseTasks(filters?: TaskFilter) {
  const queryKey = ['tasks', filters];

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('Buscando tarefas com filtros:', filters);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .order('task_order', { ascending: true });

      if (filters?.dateRange) {
        if (filters.dateRange.start && filters.dateRange.end) {
          query = query
            .gte('scheduled_date', filters.dateRange.start)
            .lte('scheduled_date', filters.dateRange.end);
        }
      }

      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.status && filters.status.length > 0) {
        const supabaseStatuses = filters.status.filter(s => s !== 'not-done');
        if (supabaseStatuses.length > 0) {
          query = query.in('status', supabaseStatuses);
        }
      }

      if (filters?.assignedPersonId) {
        query = query.eq('assigned_person_id', filters.assignedPersonId);
      }

      if (filters?.timeInvestment && filters.timeInvestment.length > 0) {
        query = query.in('time_investment', filters.timeInvestment);
      }

      if (filters?.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
      }

      console.log('Tarefas encontradas:', data?.length || 0);

      let convertedTasks: Task[] = (data || []).map(task => {
        const forwardHistory = Array.isArray(task.forward_history) ? task.forward_history : [];
        const hasForwardHistory = forwardHistory.length > 0;
        
        return {
          id: task.id,
          title: task.title,
          description: task.description || '',
          type: task.type as TaskType,
          priority: task.priority as TaskPriority,
          status: task.status as TaskStatus,
          scheduledDate: task.scheduled_date,
          assignedPersonId: task.assigned_person_id || '',
          timeInvestment: task.time_investment as TaskTimeInvestment,
          customTimeMinutes: task.custom_time_minutes || undefined,
          category: (task.category === 'work' || task.category === 'health' || task.category === 'education') 
            ? 'business' 
            : task.category as 'personal' | 'business',
          subItems: (task.sub_items as unknown as SubItem[]) || [],
          observations: task.observations || '',
          completionHistory: (task.completion_history as any[]) || [],
          forwardHistory: forwardHistory as any[],
          forwardCount: task.forward_count || 0,
          deliveryDates: task.delivery_dates || [],
          isRoutine: task.is_routine || false,
          recurrence: task.routine_config as any,
          order: task.task_order || 0,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          isRecurrent: false,
          isForwarded: task.forward_count > 0 || hasForwardHistory,
          isConcluded: task.concluded_at ? true : false,
          isProcessed: (task as any).is_processed || false
        };
      });

      if (filters?.hasChecklist !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          const hasSubItems = task.subItems && task.subItems.length > 0;
          return filters.hasChecklist ? hasSubItems : !hasSubItems;
        });
      }

      if (filters?.isForwarded !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          const isTaskForwarded = task.isForwarded || 
            task.forwardCount > 0 || 
            (task.forwardHistory && task.forwardHistory.length > 0);
          
          return filters.isForwarded ? isTaskForwarded : !isTaskForwarded;
        });
      }

      if (filters?.noOrder !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          const hasNoOrder = !task.order || task.order === 0;
          return filters.noOrder ? hasNoOrder : !hasNoOrder;
        });
      }

      if (filters?.isProcessed !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          return filters.isProcessed ? task.isProcessed : !task.isProcessed;
        });
      }

      if (filters?.status && filters.status.includes('not-done')) {
        convertedTasks = convertedTasks.filter(task => {
          return task.completionHistory?.some(completion => completion.status === 'not-done');
        });
      }

      return convertedTasks;
    },
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  const applyOrderAdjustments = async (adjustments: OrderAdjustment[]) => {
    if (adjustments.length === 0) return;

    console.log('Aplicando ajustes de ordem:', adjustments);

    for (const adjustment of adjustments) {
      const { error } = await supabase
        .from('tasks')
        .update({ task_order: adjustment.newOrder })
        .eq('id', adjustment.taskId);

      if (error) {
        console.error(`Erro ao atualizar ordem da tarefa ${adjustment.taskId}:`, error);
        throw error;
      }
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adicionando nova tarefa:', taskData);
    
    const reorderResult = calculateInsertReordering(
      tasks,
      taskData.scheduledDate,
      taskData.order || 1
    );

    try {
      await applyOrderAdjustments(reorderResult.adjustments);

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          scheduled_date: taskData.scheduledDate,
          type: taskData.type,
          priority: taskData.priority,
          status: taskData.status,
          assigned_person_id: taskData.assignedPersonId || null,
          time_investment: taskData.timeInvestment,
          custom_time_minutes: taskData.customTimeMinutes || null,
          category: taskData.category,
          sub_items: taskData.subItems as any,
          observations: taskData.observations || null,
          completion_history: taskData.completionHistory as any,
          forward_history: taskData.forwardHistory as any,
          forward_count: taskData.forwardCount,
          delivery_dates: taskData.deliveryDates,
          is_routine: taskData.isRoutine,
          routine_config: taskData.recurrence as any,
          task_order: taskData.order,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar tarefa:', error);
        throw error;
      }

      console.log('Tarefa adicionada com reordenamento:', data);
      console.log('Reordenamento aplicado:', reorderResult.message);
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Erro durante inserção com reordenamento:', error);
      await refetch();
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    console.log('Atualizando tarefa:', taskId, updates);

    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask) {
      throw new Error('Tarefa não encontrada');
    }

    try {
      let reorderResult = { adjustments: [], message: '' };
      
      if (updates.order && updates.order !== currentTask.order) {
        const targetDate = updates.scheduledDate || currentTask.scheduledDate;
        reorderResult = calculateMoveReordering(
          tasks,
          targetDate,
          taskId,
          updates.order
        );
        
        await applyOrderAdjustments(reorderResult.adjustments);
      } else if (updates.scheduledDate && updates.scheduledDate !== currentTask.scheduledDate) {
        const tasksForNewDate = tasks.filter(t => t.scheduledDate === updates.scheduledDate);
        const maxOrder = Math.max(...tasksForNewDate.map(t => t.order || 0), 0);
        updates.order = maxOrder + 1;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          scheduled_date: updates.scheduledDate,
          type: updates.type,
          priority: updates.priority,
          status: updates.status,
          assigned_person_id: updates.assignedPersonId || null,
          time_investment: updates.timeInvestment,
          custom_time_minutes: updates.customTimeMinutes || null,
          category: updates.category,
          sub_items: updates.subItems as any,
          observations: updates.observations,
          completion_history: updates.completionHistory as any,
          forward_history: updates.forwardHistory as any,
          forward_count: updates.forwardCount,
          delivery_dates: updates.deliveryDates,
          is_routine: updates.isRoutine,
          routine_config: updates.recurrence as any,
          task_order: updates.order,
          concluded_at: updates.isConcluded ? (updates.concludedAt || new Date().toISOString()) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
      }

      console.log('Tarefa atualizada com reordenamento:', data);
      if (reorderResult.adjustments.length > 0) {
        console.log('Reordenamento aplicado:', reorderResult.message);
      }
      
      await refetch();
      return data;
    } catch (error) {
      console.error('Erro durante atualização com reordenamento:', error);
      await refetch();
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('Deletando tarefa:', taskId);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }

    console.log('Tarefa deletada:', taskId);
    await refetch();
  };

  const reorderTasks = async (taskIds: string[]) => {
    console.log('Reordenando tarefas:', taskIds);

    try {
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const newOrder = i + 1;

        const { error } = await supabase
          .from('tasks')
          .update({ task_order: newOrder })
          .eq('id', taskId);

        if (error) {
          console.error(`Erro ao atualizar a ordem da tarefa ${taskId}:`, error);
          throw error;
        }
      }

      console.log('Tarefas reordenadas com sucesso via drag & drop.');
      await refetch();
    } catch (error) {
      console.error('Erro durante reordenamento por drag & drop:', error);
      await refetch();
      throw error;
    }
  };

  const concludeTask = async (taskId: string) => {
    console.log('Concluindo tarefa:', taskId);

    const { error } = await supabase
      .from('tasks')
      .update({
        concluded_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', taskId);

    if (error) {
      console.error('Erro ao concluir tarefa:', error);
      throw error;
    }

    console.log('Tarefa concluída:', taskId);
    await refetch();
  };

  return {
    tasks,
    loading: isLoading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    concludeTask,
    refetch
  };
}
