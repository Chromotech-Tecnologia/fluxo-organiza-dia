export type TaskType = 'feature' | 'bug' | 'chore' | 'documentation';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in progress' | 'completed' | 'blocked';
export type TaskTimeInvestment = 'low' | 'medium' | 'high' | 'custom';

export interface SubItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string;
  assignedPersonId: string;
  timeInvestment: TaskTimeInvestment;
  customTimeMinutes?: number;
  category: 'personal' | 'business';
  subItems: SubItem[];
  observations: string;
  completionHistory: any[];
  forwardHistory: any[];
  forwardCount: number;
  deliveryDates: string[];
  isRoutine: boolean;
  recurrence: any;
  order: number;
  createdAt: string;
  updatedAt: string;
  isRecurrent: boolean;
  isForwarded: boolean;
  isConcluded: boolean;
  isProcessed: boolean;
}

export interface TaskFilter {
  dateRange?: { start: string; end: string };
  type?: TaskType[];
  priority?: TaskPriority[];
  status?: TaskStatus[];
  assignedPersonId?: string;
  timeInvestment?: TaskTimeInvestment[];
  category?: ('personal' | 'business')[];
  hasChecklist?: boolean;
  isForwarded?: boolean;
  noOrder?: boolean;
  isProcessed?: boolean;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageForwards: number;
}

export interface TaskFormValues {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string;
  assignedPersonId: string;
  timeInvestment: TaskTimeInvestment;
  customTimeMinutes?: number;
  category: 'personal' | 'business';
  subItems: SubItem[];
  observations: string;
  completionHistory: any[];
  forwardHistory: any[];
  forwardCount: number;
  deliveryDates: string[];
  isRoutine: boolean;
  recurrence: any;
  order: number;
  isRecurrent: boolean;
  isForwarded: boolean;
  isConcluded: boolean;
  isProcessed: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
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

export interface PersonFormValues {
  name: string;
  role: string;
  contact: string;
  isPartner: boolean;
}

export interface Skill {
  id: string;
  name: string;
  area: string;
  observation: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillFormValues {
  name: string;
  area: string;
  observation: string;
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  address: Address;
  skillIds: string[];
  status: 'ativo' | 'inativo';
  isPartner: boolean;
  origin: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMemberFilter {
  search?: string;
  status?: 'ativo' | 'inativo';
  skillIds?: string[];
}

export interface TeamMemberFormValues {
  name: string;
  role: string;
  email: string;
  phone: string;
  address: Address;
  skillIds: string[];
  status: 'ativo' | 'inativo';
  isPartner: boolean;
  origin: string;
  projects: Project[];
}

export interface DailyReport {
  date: string;
  totalTasks: number;
  completedTasks: number;
  forwardedTasks: number;
}

export type ProjectStatus = 'apresentado' | 'cotado' | 'iniciado' | 'finalizado';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
}
