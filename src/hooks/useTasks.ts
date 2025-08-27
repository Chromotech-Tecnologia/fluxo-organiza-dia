
import { useState, useEffect } from 'react';
import { Task, TaskFilter, TaskStats } from '@/types';
import { taskStorage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { getCurrentDateInSaoPaulo } from '@/lib/utils';
import { 
  calculateInsertReordering, 
  calculateMoveReordering, 
  normalizeTaskSequence,
  getNextAvailableOrder 
} from '@/lib/taskOrderUtils';

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
          // Para outros status, usar o status atual
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

      // Filtro por reagendadas
      if (filters.isForwarded !== undefined) {
        if (filters.isForwarded !== task.isForwarded) {
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

      // Novo filtro por processamento
      if (filters.isProcessed !== undefined) {
        if (filters.isProcessed !== (task.isProcessed || false)) {
          return false;
        }
      }

      return true;
    });
  };

  // Adicionar nova tarefa
  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> | Task) => {
    const allTasks = taskStorage.getAll();
    
    const task: Task = 'id' in newTask ? newTask : {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completionHistory: [],
      forwardHistory: [],
      forwardCount: 0,
      status: 'pending',
      order: newTask.order || getNextAvailableOrder(allTasks, newTask.scheduledDate),
      deliveryDates: [],
      timeInvestment: newTask.timeInvestment || 'low',
      category: newTask.category || 'personal',
      isRoutine: newTask.isRoutine || false,
    };

    // Se ordem foi especificada, reordenar outras tarefas
    if (newTask.order && newTask.order > 0) {
      const reorderResult = calculateInsertReordering(allTasks, task.scheduledDate, task.order);
      
      // Aplicar reordenações
      reorderResult.adjustments.forEach(adjustment => {
        const taskToUpdate = allTasks.find(t => t.id === adjustment.taskId);
        if (taskToUpdate) {
          taskToUpdate.order = adjustment.newOrder;
        }
      });
    }

    taskStorage.add(task);
    loadTasks();
    
    toast({
      title: "Sucesso",
      description: "Tarefa criada com sucesso!"
    });
  };

  // Atualizar tarefa
  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const allTasks = taskStorage.getAll();
    const existingTask = allTasks.find(t => t.id === taskId);
    
    if (!existingTask) return;

    // Se a ordem foi alterada, recalcular posições
    if (updates.order && updates.order !== existingTask.order) {
      const scheduledDate = updates.scheduledDate || existingTask.scheduledDate;
      const reorderResult = calculateMoveReordering(allTasks, scheduledDate, taskId, updates.order);
      
      // Aplicar reordenações
      reorderResult.adjustments.forEach(adjustment => {
        const taskToUpdate = allTasks.find(t => t.id === adjustment.taskId);
        if (taskToUpdate) {
          taskToUpdate.order = adjustment.newOrder;
        }
      });
    }

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

  // Reordenar tarefas - versão melhorada
  const reorderTasks = (taskIds: string[]) => {
    const allTasks = taskStorage.getAll();
    
    // Criar mapa das novas ordens
    const orderMap = new Map();
    taskIds.forEach((taskId, index) => {
      orderMap.set(taskId, index + 1);
    });
    
    // Aplicar novas ordens apenas às tarefas reordenadas
    allTasks.forEach(task => {
      if (orderMap.has(task.id)) {
        task.order = orderMap.get(task.id);
        task.updatedAt = new Date().toISOString();
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
    const processedTasks = allTasks.filter(t => t.isProcessed || false).length;
    const pendingTasks = allTasks.filter(t => !(t.isProcessed || false)).length;
    
    // Tarefas em atraso
    const today = getCurrentDateInSaoPaulo();
    const overdueTasks = allTasks.filter(t => 
      !(t.isProcessed || false) && t.scheduledDate < today
    ).length;

    const processingRate = totalTasks > 0 ? (processedTasks / totalTasks) * 100 : 0;
    const averageForwards = totalTasks > 0 
      ? allTasks.reduce((acc, task) => acc + task.forwardCount, 0) / totalTasks 
      : 0;

    return {
      totalTasks,
      completedTasks: processedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: processingRate,
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
