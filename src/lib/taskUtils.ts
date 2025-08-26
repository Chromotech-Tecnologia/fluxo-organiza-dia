import { Task } from "@/types";
import { getCurrentDateInSaoPaulo } from "@/lib/utils";

// Tipos de ordenação disponíveis
export type SortOption = 
  | 'order' 
  | 'priority' 
  | 'time' 
  | 'routine' 
  | 'status' 
  | 'forward' 
  | 'type' 
  | 'date' 
  | 'name-asc' 
  | 'name-desc';

export const SORT_OPTIONS = [
  { value: 'order', label: 'Por Ordem' },
  { value: 'priority', label: 'Por Prioridade' },
  { value: 'time', label: 'Por Tempo Estimado' },
  { value: 'routine', label: 'Por Rotina' },
  { value: 'status', label: 'Por Status' },
  { value: 'forward', label: 'Por Reagendamentos' },
  { value: 'type', label: 'Por Tipo' },
  { value: 'date', label: 'Por Data' },
  { value: 'name-asc', label: 'Por Nome (A-Z)' },
  { value: 'name-desc', label: 'Por Nome (Z-A)' }
];

// Função para verificar se a tarefa foi reagendada hoje pelo usuário
export function isTaskRescheduledToday(task: Task): boolean {
  if (!task.forwardHistory || task.forwardHistory.length === 0) return false;
  
  const today = getCurrentDateInSaoPaulo();
  
  return task.forwardHistory.some(forward => {
    // Verificar se o reagendamento foi hoje
    const forwardDate = new Date(forward.forwardedAt).toISOString().split('T')[0];
    
    // A ação deve ser explícita de reagendamento pelo usuário (não recebimento)
    const isUserRescheduleAction = forward.reason && (
      forward.reason.includes('Reagendada pelo usuário') || 
      forward.reason.includes('Tarefa reagendada') ||
      forward.reason.includes('Reagendamento manual') ||
      (forward.reason === 'Reagendada')
    );
    
    return forwardDate === today && isUserRescheduleAction;
  });
}

// Função para ordenar tarefas
export function sortTasks(tasks: Task[], sortBy: SortOption): Task[] {
  const sortedTasks = [...tasks];
  
  switch (sortBy) {
    case 'order':
      return sortedTasks.sort((a, b) => {
        const orderA = a.order || 999999;
        const orderB = b.order || 999999;
        return orderA - orderB;
      });
      
    case 'priority':
      return sortedTasks.sort((a, b) => {
        const priorityOrder = { 'extreme': 0, 'priority': 1, 'none': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
    case 'time':
      return sortedTasks.sort((a, b) => {
        const timeOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        return timeOrder[a.timeInvestment] - timeOrder[b.timeInvestment];
      });
      
    case 'routine':
      return sortedTasks.sort((a, b) => {
        if (a.isRoutine && !b.isRoutine) return -1;
        if (!a.isRoutine && b.isRoutine) return 1;
        return 0;
      });
      
    case 'status':
      return sortedTasks.sort((a, b) => {
        const statusOrder = { 'pending': 0, 'completed': 1, 'not-done': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
    case 'forward':
      return sortedTasks.sort((a, b) => (b.forwardCount || 0) - (a.forwardCount || 0));
      
    case 'type':
      return sortedTasks.sort((a, b) => a.type.localeCompare(b.type));
      
    case 'date':
      return sortedTasks.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      
    case 'name-asc':
      return sortedTasks.sort((a, b) => a.title.localeCompare(b.title));
      
    case 'name-desc':
      return sortedTasks.sort((a, b) => b.title.localeCompare(a.title));
      
    default:
      return sortedTasks;
  }
}

// Função para obter o valor em minutos baseado no timeInvestment - CORRIGIDA
export function getTimeInMinutes(timeInvestment: string, customTimeMinutes?: number): number {
  // Se o timeInvestment for 'custom' e tiver customTimeMinutes, usar esse valor
  if (timeInvestment === 'custom' && customTimeMinutes) {
    console.log(`[DEBUG TIME] timeInvestment: "custom", customTimeMinutes: ${customTimeMinutes}, resultado: ${customTimeMinutes}min (${(customTimeMinutes/60).toFixed(1)}h)`);
    return customTimeMinutes;
  }
  
  const timeValues: Record<string, number> = {
    // Tempos personalizados pré-definidos - CORRIGIDOS PARA CORRESPONDER AO FILTRO
    'custom-5': 5,      // 5 minutos
    'custom-30': 30,    // 30 minutos  
    'low': 60,          // 1 hora (era 30min, agora 1h)
    'medium': 120,      // 2 horas (mantém)
    'high': 240,        // 4 horas (era 480min/8h, agora 240min/4h)
    'custom-4h': 240,   // 4 horas
    'custom-8h': 480,   // 8 horas
    // Fallback para custom sem valor
    'custom': customTimeMinutes || 0
  };
  
  const result = timeValues[timeInvestment] || 0;
  
  // Log detalhado para debug
  console.log(`[DEBUG TIME] timeInvestment: "${timeInvestment}", customTimeMinutes: ${customTimeMinutes}, resultado: ${result}min (${(result/60).toFixed(1)}h)`);
  
  return result;
}

// Função para debug de cálculo de tempo total
export function debugTotalTime(tasks: Task[], filterDescription: string = ""): void {
  console.log(`\n[DEBUG TOTAL TIME] ${filterDescription}`);
  console.log(`Total de tarefas: ${tasks.length}`);
  
  let totalMinutes = 0;
  tasks.forEach((task, index) => {
    const taskMinutes = getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
    totalMinutes += taskMinutes;
    console.log(`${index + 1}. "${task.title}" - ${task.timeInvestment} - ${taskMinutes}min (${(taskMinutes/60).toFixed(1)}h)`);
  });
  
  console.log(`TOTAL: ${totalMinutes}min (${(totalMinutes/60).toFixed(1)}h)`);
  console.log(`Formatado: ${formatTime(totalMinutes)}`);
  console.log('---');
}

// Função para obter cor do número da ordem (termômetro invertido: vermelho -> verde)
export function getOrderNumberColor(order: number, maxOrder: number): string {
  if (!order || order === 0) return 'text-gray-400';
  
  const percentage = Math.min(order / maxOrder, 1);
  
  // Invertido: ordem baixa = vermelho, ordem alta = verde
  if (percentage <= 0.2) return 'text-red-600 bg-red-50 border-red-300';
  if (percentage <= 0.4) return 'text-red-500 bg-red-50 border-red-200';  
  if (percentage <= 0.6) return 'text-orange-500 bg-orange-50 border-orange-200';
  if (percentage <= 0.8) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-green-600 bg-green-50 border-green-300';
}

// Função para obter cor de prioridade
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'extreme':
      return 'bg-black text-white border-black';
    case 'priority':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Função para calcular tempo estimado total
export function calculateTotalEstimatedTime(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    return total + getTimeInMinutes(task.timeInvestment, task.customTimeMinutes);
  }, 0);
}

// Função para formatar tempo em minutos
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}
