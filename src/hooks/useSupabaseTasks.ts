import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskFilter, TaskPriority, TaskStatus, TaskType, SubItem } from "@/types";

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
        query = query.in('status', filters.status);
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
      let convertedTasks: Task[] = (data || []).map(task => ({
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
        forwardHistory: (task.forward_history as any[]) || [],
        forwardCount: task.forward_count || 0,
        deliveryDates: task.delivery_dates || [],
        isRoutine: task.is_routine || false,
        recurrence: task.routine_config as any,
        order: task.task_order || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        isRecurrent: false,
        isForwarded: task.forward_count > 0 || (task.forward_history && task.forward_history.length > 0),
        isConcluded: !!task.concluded_at
      }));

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

      return convertedTasks;
    },
  });

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Adicionando nova tarefa:', taskData);
    
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
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }

    console.log('Tarefa adicionada:', data);
    refetch();
    return data;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    console.log('Atualizando tarefa:', taskId, updates);

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
        concluded_at: updates.isConcluded ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }

    console.log('Tarefa atualizada:', data);
    refetch();
    return data;
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
    refetch();
  };

  const reorderTasks = async (taskIds: string[]) => {
    console.log('Reordenando tarefas:', taskIds);

    // Atualizar a ordem de cada tarefa individualmente
    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const newOrder = i;

      const { error } = await supabase
        .from('tasks')
        .update({ task_order: newOrder })
        .eq('id', taskId);

      if (error) {
        console.error(`Erro ao atualizar a ordem da tarefa ${taskId}:`, error);
        throw error;
      }
    }

    console.log('Tarefas reordenadas com sucesso.');
    refetch();
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
