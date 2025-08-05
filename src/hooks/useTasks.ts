import { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskStats } from '@/types';
import { taskStorage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';

export function useTasks(filters?: TaskFilter) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar tarefas do storage
  const loadTasks = () => {
    setLoading(true);
    try {
      let allTasks = taskStorage.getAll();
      
      // Aplicar filtros se fornecidos
      if (filters) {
        allTasks = applyFilters(allTasks, filters);
      }
      
      setTasks(allTasks);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tarefas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = (tasks: Task[], filters: TaskFilter): Task[] => {
    return tasks.filter(task => {
      // Filtro por data
      if (filters.dateRange) {
        const taskDate = task.scheduledDate;
        const startDate = filters.dateRange.start;
        const endDate = filters.dateRange.end;
        
        console.log('Filtrando tarefa:', task.title, 'data tarefa:', taskDate, 'intervalo:', startDate, 'até', endDate);
        
        if (taskDate < startDate || taskDate > endDate) {
          return false;
        }
        
        console.log('Tarefa encontrada no filtro:', task.title);
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

      // Filtro por status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(task.status)) {
          return false;
        }
      }

      // Filtro por pessoa
      if (filters.assignedPersonId) {
        if (task.assignedPersonId !== filters.assignedPersonId) {
          return false;
        }
      }

      // Filtro por número máximo de repasses
      if (filters.maxForwards !== undefined) {
        if (task.forwardCount > filters.maxForwards) {
          return false;
        }
      }

      // Filtro por recorrência
      if (filters.isRecurrent !== undefined) {
        if (task.isRecurrent !== filters.isRecurrent) {
          return false;
        }
      }

      return true;
    });
  };

  // Adicionar nova tarefa
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    const task: Task = 'id' in newTask ? newTask : {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionHistory: [],
    };

    taskStorage.add(task);
    loadTasks();
    
    toast({
      title: "Sucesso",
      description: "Tarefa criada com sucesso!"
    });
  };

  // Atualizar tarefa
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    taskStorage.update(taskId, updates);
    loadTasks();
    
    toast({
      title: "Sucesso",
      description: "Tarefa atualizada com sucesso!"
    });
  };

  // Deletar tarefa
  const deleteTask = (taskId: string) => {
    taskStorage.delete(taskId);
    loadTasks();
    
    toast({
      title: "Sucesso",
      description: "Tarefa removida com sucesso!"
    });
  };

  // Reordenar tarefas
  const reorderTasks = (taskIds: string[]) => {
    const allTasks = taskStorage.getAll();
    
    taskIds.forEach((taskId, index) => {
      const task = allTasks.find(t => t.id === taskId);
      if (task) {
        task.order = index;
      }
    });
    
    taskStorage.save(allTasks);
    loadTasks();
  };

  // Obter tarefas por data
  const getTasksByDate = (date: string): Task[] => {
    return taskStorage.getByDate(date);
  };

  // Obter estatísticas
  const getStats = (): TaskStats => {
    const allTasks = taskStorage.getAll();
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    
    // Tarefas em atraso
    const today = getCurrentDateInSaoPaulo();
    const overdueTasks = allTasks.filter(t => 
      t.status === 'pending' && t.scheduledDate < today
    ).length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const averageForwards = totalTasks > 0 
      ? allTasks.reduce((acc, task) => acc + task.forwardCount, 0) / totalTasks 
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
    getTasksByDate,
    getStats,
    refetch: loadTasks
  };
}