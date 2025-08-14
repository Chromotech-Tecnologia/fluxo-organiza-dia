// Tipos principais do sistema de controle de tarefas

export type TaskType = 'meeting' | 'own-task' | 'delegated-task';
export type TaskPriority = 'none' | 'priority' | 'extreme';
export type TaskTimeInvestment = 'low' | 'medium' | 'high';
export type TaskCategory = 'personal' | 'business';
export type TaskStatus = 'pending' | 'completed' | 'not-done' | 'forwarded-date' | 'forwarded-person';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Skill {
  id: string;
  name: string;
  observation: string;
  area: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'apresentado' | 'cotado' | 'iniciado' | 'finalizado';
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  status: 'ativo' | 'inativo';
  isPartner: boolean;
  skillIds: string[];
  origin: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  contact: string;
  isPartner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
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
  forwardedAt: string;
  forwardedTo?: string | null;
  newDate: string;
  originalDate: string;
  statusAtForward: TaskStatus;
  reason: string;
}

export interface CompletionRecord {
  completedAt: string;
  status: 'completed' | 'not-done';
  date: string;
  wasForwarded?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  timeInvestment: TaskTimeInvestment;
  category: TaskCategory;
  status: TaskStatus;
  assignedPersonId?: string;
  subItems: SubItem[];
  deliveryDates: string[];
  observations: string;
  order: number;
  isRecurrent: boolean;
  isRoutine: boolean;
  routineCycle?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  routineStartDate?: string;
  routineEndDate?: string;
  recurrence?: RecurrenceConfig;
  forwardHistory: ForwardRecord[];
  forwardCount: number;
  completionHistory: CompletionRecord[];
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

// Form types
export interface TaskFormValues {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  timeInvestment: TaskTimeInvestment;
  category: TaskCategory;
  assignedPersonId?: string;
  scheduledDate: string;
  order: number;
  observations?: string;
  isRoutine: boolean;
  routineCycle?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'annual';
  routineStartDate?: string;
  routineEndDate?: string;
}

export interface PersonFormValues {
  name: string;
  role: string;
  contact: string;
  isPartner: boolean;
}

export interface SkillFormValues {
  name: string;
  observation: string;
  area: string;
}

export interface TeamMemberFormValues {
  name: string;
  role: string;
  email: string;
  phone: string;
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  status: 'ativo' | 'inativo';
  isPartner: boolean;
  skillIds: string[];
  origin: string;
  projects: Project[];
}

export interface TeamMemberFilter {
  search?: string;
  skillIds?: string[];
  status?: 'ativo' | 'inativo';
}