
import { Task, TaskPriority, TaskTimeInvestment, TaskType } from "@/types";

export type SortOption = 'order' | 'priority' | 'title' | 'type' | 'timeInvestment';

export const SORT_OPTIONS = [
  { value: 'order' as const, label: 'Por Ordem' },
  { value: 'priority' as const, label: 'Por Prioridade' },
  { value: 'title' as const, label: 'Por Título' },
  { value: 'type' as const, label: 'Por Tipo' },
  { value: 'timeInvestment' as const, label: 'Por Tempo' },
];

export const sortTasks = (tasks: Task[], sortBy: SortOption): Task[] => {
  switch (sortBy) {
    case 'priority':
      return [...tasks].sort((a, b) => {
        const priorityValues: { [key: string]: number } = {
          'extreme': 3,
          'priority': 2,
          'none': 1,
        };
        return priorityValues[b.priority] - priorityValues[a.priority];
      });
    case 'title':
      return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
    case 'type':
      return [...tasks].sort((a, b) => a.type.localeCompare(b.type));
    case 'timeInvestment':
      return [...tasks].sort((a, b) => {
        const timeInvestmentValues: { [key: string]: number } = {
          'low': 1,
          'medium': 2,
          'high': 3,
        };
        const aValue = timeInvestmentValues[a.timeInvestment] || 0;
        const bValue = timeInvestmentValues[b.timeInvestment] || 0;
        return aValue - bValue;
      });
    case 'order':
    default:
      return [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
};

export const getTimeInMinutes = (timeInvestment: TaskTimeInvestment, customTimeMinutes?: number): number => {
  if (timeInvestment === 'custom' && customTimeMinutes) {
    return customTimeMinutes;
  }
  
  switch (timeInvestment) {
    case 'custom-5':
      return 5;
    case 'custom-30':
      return 30;
    case 'low':
      return 60;
    case 'medium':
      return 120;
    case 'high':
      return 240;
    case 'custom-4h':
      return 240;
    case 'custom-8h':
      return 480;
    default:
      return 5;
  }
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'extreme':
      return 'bg-black text-white border-black';
    case 'priority':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getOrderNumberColor = (order: number, maxOrder: number): string => {
  const percentage = (order / maxOrder) * 100;
  
  if (percentage <= 25) {
    return 'bg-green-100 text-green-800 border-green-300';
  } else if (percentage <= 50) {
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  } else if (percentage <= 75) {
    return 'bg-orange-100 text-orange-800 border-orange-300';
  } else {
    return 'bg-red-100 text-red-800 border-red-300';
  }
};

export const isTaskRescheduledToday = (task: Task): boolean => {
  if (!task.forwardHistory || task.forwardHistory.length === 0) return false;
  
  const today = new Date().toISOString().split('T')[0];
  
  return task.forwardHistory.some(forward => {
    const forwardDate = forward.forwardedAt.split('T')[0];
    return forwardDate === today;
  });
};

export const debugTotalTime = (tasks: Task[]): void => {
  const totalMinutes = tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
  }, 0);
  
  console.log(`Total time for ${tasks.length} tasks: ${formatTime(totalMinutes)}`);
};
