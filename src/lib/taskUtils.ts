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
