// Tipos principais do sistema de controle de tarefas

export type TaskType = 'meeting' | 'own-task' | 'delegated-task';
export type TaskPriority = 'simple' | 'urgent' | 'complex';
export type TaskStatus = 'pending' | 'completed' | 'not-done' | 'forwarded-date' | 'forwarded-person';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Person {
  id: string;
  name: string;
  role: string;
  contact: string;
  isPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number; // a cada X dias/semanas/meses/anos
  endDate?: string;
  daysOfWeek?: number[]; // para semanal
  dayOfMonth?: number; // para mensal
  monthOfYear?: number; // para anual
}

export interface ForwardRecord {
  id: string;
  fromDate: string;
  toDate?: string;
  fromPersonId?: string;
  toPersonId?: string;
  reason: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  assignedPersonId?: string;
  subItems: SubItem[];
  deliveryDates: string[];
  observations: string;
  order: number;
  isRecurrent: boolean;
  recurrence?: RecurrenceConfig;
  forwardHistory: ForwardRecord[];
  forwardCount: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
}

export interface DailyReport {
  id: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completedInDay: number;
  forwardedTasks: number;
  meetingTasks: number;
  notDoneTasks: number;
  averageForwards: number;
  isClosed: boolean;
  closedAt?: string;
  notes: string;
}

export interface TaskFilter {
  dateRange?: {
    start: string;
    end: string;
  };
  type?: TaskType[];
  priority?: TaskPriority[];
  status?: TaskStatus[];
  assignedPersonId?: string;
  maxForwards?: number;
  isRecurrent?: boolean;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageForwards: number;
  topPersonByTasks?: Person;
  mostForwardedTask?: Task;
}