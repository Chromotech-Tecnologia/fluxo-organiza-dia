
import { Task } from "@/types";

export interface OrderAdjustment {
  taskId: string;
  oldOrder: number;
  newOrder: number;
}

export interface ReorderResult {
  adjustments: OrderAdjustment[];
  message: string;
}

// Função para obter próximo número disponível
export function getNextAvailableOrder(tasks: Task[], date: string): number {
  const tasksForDate = tasks.filter(task => task.scheduledDate === date);
  const orders = tasksForDate.map(task => task.order || 0).sort((a, b) => a - b);
  
  return Math.max(...orders, 0) + 1;
}

// Função para calcular reordenamento ao inserir nova tarefa
export function calculateInsertReordering(
  tasks: Task[],
  date: string,
  insertPosition: number,
  excludeTaskId?: string
): ReorderResult {
  // Filtrar tarefas do mesmo dia, excluindo a tarefa sendo editada
  const tasksForDate = tasks
    .filter(task => task.scheduledDate === date && task.id !== excludeTaskId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const adjustments: OrderAdjustment[] = [];
  
  // Para cada tarefa que precisa ser movida para frente
  tasksForDate.forEach(task => {
    const currentOrder = task.order || 0;
    if (currentOrder >= insertPosition) {
      adjustments.push({
        taskId: task.id,
        oldOrder: currentOrder,
        newOrder: currentOrder + 1
      });
    }
  });

  const message = adjustments.length > 0
    ? `Tarefas nas posições ${adjustments.map(a => a.oldOrder).join(', ')} serão movidas para ${adjustments.map(a => a.newOrder).join(', ')}`
    : 'Nenhuma tarefa será reordenada';

  return { adjustments, message };
}

// Função para calcular reordenamento ao mover tarefa existente
export function calculateMoveReordering(
  tasks: Task[],
  date: string,
  taskId: string,
  newPosition: number
): ReorderResult {
  const tasksForDate = tasks
    .filter(task => task.scheduledDate === date)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const movingTask = tasksForDate.find(task => task.id === taskId);
  if (!movingTask) return { adjustments: [], message: 'Tarefa não encontrada' };

  const oldPosition = movingTask.order || 0;
  const otherTasks = tasksForDate.filter(task => task.id !== taskId);
  
  const adjustments: OrderAdjustment[] = [];

  if (newPosition > oldPosition) {
    // Movendo para baixo: tarefas entre oldPosition+1 e newPosition sobem
    otherTasks.forEach(task => {
      const order = task.order || 0;
      if (order > oldPosition && order <= newPosition) {
        adjustments.push({
          taskId: task.id,
          oldOrder: order,
          newOrder: order - 1
        });
      }
    });
  } else if (newPosition < oldPosition) {
    // Movendo para cima: tarefas entre newPosition e oldPosition-1 descem
    otherTasks.forEach(task => {
      const order = task.order || 0;
      if (order >= newPosition && order < oldPosition) {
        adjustments.push({
          taskId: task.id,
          oldOrder: order,
          newOrder: order + 1
        });
      }
    });
  }

  const message = adjustments.length > 0
    ? `Movendo tarefa da posição ${oldPosition} para ${newPosition}. ${adjustments.length} tarefas reordenadas.`
    : `Movendo tarefa da posição ${oldPosition} para ${newPosition}`;

  return { adjustments, message };
}

// Função para normalizar sequência de tarefas (remove gaps)
export function normalizeTaskSequence(tasks: Task[], date: string): OrderAdjustment[] {
  const tasksForDate = tasks
    .filter(task => task.scheduledDate === date)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const adjustments: OrderAdjustment[] = [];
  
  tasksForDate.forEach((task, index) => {
    const expectedOrder = index + 1;
    const currentOrder = task.order || 0;
    
    if (currentOrder !== expectedOrder) {
      adjustments.push({
        taskId: task.id,
        oldOrder: currentOrder,
        newOrder: expectedOrder
      });
    }
  });

  return adjustments;
}
