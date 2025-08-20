import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskFilter, TaskStats } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';

export function useSupabaseTasks(filters?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Carregar tarefas do Supabase
  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('task_order', { ascending: true })
        .order('order_index', { ascending: true })
        .order('scheduled_date')
        .order('created_at');

      // Aplicar filtros se fornecidos
      if (filters?.dateRange) {
        query = query
          .gte('scheduled_date', filters.dateRange.start)
          .lte('scheduled_date', filters.dateRange.end);
      }

      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      if (filters?.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.timeInvestment && filters.timeInvestment.length > 0) {
        query = query.in('time_investment', filters.timeInvestment);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }

      if (filters?.assignedPersonId) {
        query = query.eq('assigned_person_id', filters.assignedPersonId);
      }

      if (filters?.maxForwards !== undefined) {
        query = query.lte('forward_count', filters.maxForwards);
      }

      if (filters?.isRecurrent !== undefined) {
        query = query.eq('is_routine', filters.isRecurrent);
      }

      if (filters?.isRoutine !== undefined) {
        query = query.eq('is_routine', filters.isRoutine);
      }

      if (filters?.isConcluded !== undefined) {
        query = query.eq('is_concluded', filters.isConcluded);
      }

      if (filters?.notConcluded !== undefined) {
        query = query.eq('is_concluded', !filters.notConcluded);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter dados do Supabase para o formato do frontend
      let convertedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        scheduledDate: task.scheduled_date,
        type: task.type as any,
        priority: task.priority as any,
        timeInvestment: task.time_investment as any,
        category: task.category as any,
        status: task.status as any,
        assignedPersonId: task.assigned_person_id,
        forwardCount: task.forward_count || 0,
        observations: task.observations || '',
        subItems: task.sub_items as any || [],
        completionHistory: task.completion_history as any || [],
        forwardHistory: task.forward_history as any || [],
        deliveryDates: task.delivery_dates || [],
        isRecurrent: false,
        isRoutine: task.is_routine || false,
        routineCycle: (task.routine_config as any)?.type,
        routineStartDate: (task.routine_config as any)?.startDate,
        routineEndDate: (task.routine_config as any)?.endDate,
        recurrence: task.routine_config as any,
        order: task.task_order || task.order_index || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        isForwarded: task.is_forwarded || false,
        isConcluded: task.is_concluded || false,
        concludedAt: task.concluded_at
      }));

      // Aplicar filtros específicos que precisam ser feitos no frontend
      if (filters?.hasSubItems !== undefined) {
        convertedTasks = convertedTasks.filter(task => 
          filters.hasSubItems ? (task.subItems && task.subItems.length > 0) : (!task.subItems || task.subItems.length === 0)
        );
      }

      if (filters?.hasForwards !== undefined) {
        convertedTasks = convertedTasks.filter(task => 
          filters.hasForwards ? task.isForwarded : !task.isForwarded
        );
      }

      if (filters?.isDefinitive !== undefined) {
        convertedTasks = convertedTasks.filter(task => 
          filters.isDefinitive ? (task.status === 'completed' && !task.isForwarded) : !(task.status === 'completed' && !task.isForwarded)
        );
      }

      if (filters?.notForwarded !== undefined) {
        convertedTasks = convertedTasks.filter(task => 
          filters.notForwarded ? !task.isForwarded : task.isForwarded
        );
      }

      if (filters?.noOrder !== undefined) {
        convertedTasks = convertedTasks.filter(task => 
          filters.noOrder ? (!task.order || task.order === 0) : (task.order && task.order > 0)
        );
      }

      setTasks(convertedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas do banco de dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova tarefa
  const addTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    if (!user) return;
    
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description || null,
        scheduled_date: newTask.scheduledDate,
        type: newTask.type,
        priority: newTask.priority,
        time_investment: newTask.timeInvestment || 'low',
        category: newTask.category || 'personal',
        status: 'pending',
        assigned_person_id: newTask.assignedPersonId || null,
        forward_count: 0,
        observations: newTask.observations || null,
        sub_items: newTask.subItems as any || [],
        completion_history: [],
        forward_history: [],
        delivery_dates: [],
        is_routine: newTask.isRoutine || false,
        routine_config: newTask.recurrence as any || null,
        task_order: newTask.order || 0,
        order_index: newTask.order || 0,
        user_id: user.id
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      await loadTasks();
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar tarefa",
        variant: "destructive"
      });
    }
  };

  // Atualizar tarefa
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const supabaseUpdates: any = {};
      
      if (updates.title !== undefined) supabaseUpdates.title = updates.title;
      if (updates.description !== undefined) supabaseUpdates.description = updates.description;
      if (updates.scheduledDate !== undefined) supabaseUpdates.scheduled_date = updates.scheduledDate;
      if (updates.type !== undefined) supabaseUpdates.type = updates.type;
      if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
      if (updates.timeInvestment !== undefined) supabaseUpdates.time_investment = updates.timeInvestment;
      if (updates.category !== undefined) supabaseUpdates.category = updates.category;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      if (updates.assignedPersonId !== undefined) supabaseUpdates.assigned_person_id = updates.assignedPersonId || null;
      if (updates.forwardCount !== undefined) supabaseUpdates.forward_count = updates.forwardCount;
      if (updates.observations !== undefined) supabaseUpdates.observations = updates.observations;
      if (updates.subItems !== undefined) supabaseUpdates.sub_items = updates.subItems;
      if (updates.completionHistory !== undefined) supabaseUpdates.completion_history = updates.completionHistory;
      if (updates.forwardHistory !== undefined) supabaseUpdates.forward_history = updates.forwardHistory;
      if (updates.deliveryDates !== undefined) supabaseUpdates.delivery_dates = updates.deliveryDates;
      if (updates.isRoutine !== undefined) supabaseUpdates.is_routine = updates.isRoutine;
      if (updates.recurrence !== undefined) supabaseUpdates.routine_config = updates.recurrence as any;
      if (updates.order !== undefined) {
        supabaseUpdates.task_order = updates.order;
        supabaseUpdates.order_index = updates.order;
      }
      if (updates.isForwarded !== undefined) supabaseUpdates.is_forwarded = updates.isForwarded;
      if (updates.isConcluded !== undefined) supabaseUpdates.is_concluded = updates.isConcluded;
      if (updates.concludedAt !== undefined) supabaseUpdates.concluded_at = updates.concludedAt;

      const { error } = await supabase
        .from('tasks')
        .update(supabaseUpdates)
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar tarefa",
        variant: "destructive"
      });
    }
  };

  // Marcar tarefa como concluída
  const concludeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_concluded: true,
          concluded_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      
      toast({
        title: "Sucesso",
        description: "Tarefa concluída com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir tarefa",
        variant: "destructive"
      });
    }
  };

  // Deletar tarefa
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      await loadTasks();
      
      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover tarefa",
        variant: "destructive"
      });
    }
  };

  // Reordenar tarefas
  const reorderTasks = async (taskIds: string[]) => {
    try {
      for (const [index, taskId] of taskIds.entries()) {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            task_order: index + 1,
            order_index: index + 1
          })
          .eq('id', taskId);
        
        if (error) throw error;
      }

      await loadTasks();
    } catch (error) {
      console.error('Erro ao reordenar tarefas:', error);
      toast({
        title: "Erro",
        description: "Erro ao reordenar tarefas",
        variant: "destructive"
      });
    }
  };

  // Obter tarefas por data
  const getTasksByDate = async (date: string): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('scheduled_date', date);

      if (error) throw error;

      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        scheduledDate: task.scheduled_date,
        type: task.type as any,
        priority: task.priority as any,
        timeInvestment: task.time_investment as any,
        category: task.category as any,
        status: task.status as any,
        assignedPersonId: task.assigned_person_id,
        forwardCount: task.forward_count || 0,
        observations: task.observations || '',
        subItems: task.sub_items as any || [],
        completionHistory: task.completion_history as any || [],
        forwardHistory: task.forward_history as any || [],
        deliveryDates: task.delivery_dates || [],
        isRecurrent: false,
        isRoutine: task.is_routine || false,
        routineCycle: (task.routine_config as any)?.type,
        routineStartDate: (task.routine_config as any)?.startDate,
        routineEndDate: (task.routine_config as any)?.endDate,
        recurrence: task.routine_config as any,
        order: task.task_order || task.order_index || 0,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar tarefas por data:', error);
      return [];
    }
  };

  // Obter estatísticas
  const getStats = async (): Promise<TaskStats> => {
    try {
      const { data: allTasks, error } = await supabase
        .from('tasks')
        .select('status, scheduled_date, forward_count');

      if (error) throw error;

      const totalTasks = allTasks?.length || 0;
      const completedTasks = allTasks?.filter(t => t.status === 'completed').length || 0;
      const pendingTasks = allTasks?.filter(t => t.status === 'pending').length || 0;
      
      // Tarefas em atraso
      const today = getCurrentDateInSaoPaulo();
      const overdueTasks = allTasks?.filter(t => 
        t.status === 'pending' && t.scheduled_date < today
      ).length || 0;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const averageForwards = totalTasks > 0 
        ? (allTasks?.reduce((acc, task) => acc + (task.forward_count || 0), 0) || 0) / totalTasks 
        : 0;

      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        averageForwards
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        averageForwards: 0
      };
    }
  };

  useEffect(() => {
    if (user) {
      loadTasks();
      
      // Setup real-time subscription
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
          () => {
            console.log('Tasks changed, reloading...');
            loadTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [JSON.stringify(filters), user?.id]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    getTasksByDate,
    getStats,
    concludeTask,
    refetch: loadTasks
  };
}
