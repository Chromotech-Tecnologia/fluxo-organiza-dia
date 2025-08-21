import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFilter, TaskPriority, TaskStatus, TaskType, SubItem } from "@/types";
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

      // Aplicar filtros de data
      if (filters?.dateRange) {
        if (filters.dateRange.start && filters.dateRange.end) {
          query = query
            .gte('scheduled_date', filters.dateRange.start)
            .lte('scheduled_date', filters.dateRange.end);
        }
      }

      // Aplicar outros filtros
      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.status && filters.status.length > 0) {
        // Não aplicar filtro "not-done" no Supabase, será tratado no client-side
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

      // Converter dados do Supabase para o tipo Task
      let convertedTasks: Task[] = (data || []).map(task => {
        // Verificar se forward_history é um array válido
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
          timeInvestment: task.time_investment as 'low' | 'medium' | 'high',
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
          isProcessed: task.is_processed || false
        };
      });

      // Aplicar filtros client-side que não podem ser feitos no Supabase
      if (filters?.hasChecklist !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          const hasSubItems = task.subItems && task.subItems.length > 0;
          return filters.hasChecklist ? hasSubItems : !hasSubItems;
        });
      }

      if (filters?.isForwarded !== undefined) {
        convertedTasks = convertedTasks.filter(task => {
          return filters.isForwarded ? task.isForwarded : !task.isForwarded;
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

      // Filtro especial para "não feito" - tarefas que têm histórico de not-done
      if (filters?.status && filters.status.includes('not-done')) {
        convertedTasks = convertedTasks.filter(task => {
          return task.completionHistory?.some(completion => completion.status === 'not-done');
        });
      }

      return convertedTasks;
    },
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
    
    // Calcular reordenamento necessário
    const reorderResult = calculateInsertReordering(
      tasks,
      taskData.scheduledDate,
      taskData.order || 1
    );

    try {
      // Aplicar reordenamento das tarefas existentes
      await applyOrderAdjustments(reorderResult.adjustments);

      // Inserir nova tarefa
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
          is_processed: taskData.isProcessed || false,
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
      await refetch(); // Recarregar para garantir consistência
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
      // Se a ordem ou data foi alterada, calcular reordenamento
      let reorderResult = { adjustments: [], message: '' };
      
      if (updates.order && updates.order !== currentTask.order) {
        const targetDate = updates.scheduledDate || currentTask.scheduledDate;
        reorderResult = calculateMoveReordering(
          tasks,
          targetDate,
          taskId,
          updates.order
        );
        
        // Aplicar reordenamento das outras tarefas
        await applyOrderAdjustments(reorderResult.adjustments);
      } else if (updates.scheduledDate && updates.scheduledDate !== currentTask.scheduledDate) {
        // Se mudou apenas a data, colocar no final da nova data
        const tasksForNewDate = tasks.filter(t => t.scheduledDate === updates.scheduledDate);
        const maxOrder = Math.max(...tasksForNewDate.map(t => t.order || 0), 0);
        updates.order = maxOrder + 1;
      }

      // Atualizar a tarefa principal
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
          is_processed: updates.isProcessed,
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
      await refetch(); // Recarregar para garantir consistência
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
      // Atualizar a ordem de cada tarefa individualmente com ordem 1-based
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const newOrder = i + 1; // Ordem 1-based

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
