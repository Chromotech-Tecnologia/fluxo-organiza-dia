import { TaskFormValues, SubItem, Task } from "@/types";
import { format, addDays, addWeeks, addMonths, addQuarters, addYears, startOfDay, endOfDay, getDay } from "date-fns";

export interface RoutineTaskData extends TaskFormValues {
  subItems: SubItem[];
}

/**
 * Gera as datas para uma rotina baseado no ciclo configurado
 */
export function generateRoutineDates(
  startDate: string,
  endDate: string | undefined,
  cycle: string,
  includeWeekends: boolean = true
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : addYears(start, 1); // Limite de 1 ano se não especificado
  
  let currentDate = new Date(start);
  
  // Limitar a 100 ocorrências para evitar loops infinitos
  const maxOccurrences = 100;
  let count = 0;
  
  while (currentDate <= end && count < maxOccurrences) {
    const dayOfWeek = getDay(currentDate); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Adicionar data apenas se incluir finais de semana OU se não for final de semana
    if (includeWeekends || !isWeekend) {
      dates.push(format(currentDate, 'yyyy-MM-dd'));
    }
    
    switch (cycle) {
      case 'daily':
        currentDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, 1);
        break;
      case 'quarterly':
        currentDate = addQuarters(currentDate, 1);
        break;
      case 'biannual':
        currentDate = addMonths(currentDate, 6);
        break;
      case 'annual':
        currentDate = addYears(currentDate, 1);
        break;
      default:
        return dates; // Ciclo inválido
    }
    
    count++;
  }
  
  return dates;
}

/**
 * Gera múltiplas tarefas baseado na configuração de rotina
 */
export function generateRoutineTasks(taskData: RoutineTaskData): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] {
  if (!taskData.isRoutine || !taskData.routineCycle || !taskData.routineStartDate) {
    // Se não é rotina, retorna apenas uma tarefa para a data agendada
    return [{
      ...taskData,
      scheduledDate: taskData.scheduledDate,
      description: taskData.description || '',
      observations: taskData.observations || '',
      status: 'pending',
      order: taskData.order || 0,
      forwardHistory: [],
      forwardCount: 0,
      deliveryDates: [],
      isRecurrent: true,
      completionHistory: [],
      isForwarded: false,
      isConcluded: false,
      attachments: taskData.attachments || []
    }];
  }

  const routineDates = generateRoutineDates(
    taskData.routineStartDate,
    taskData.routineEndDate,
    taskData.routineCycle,
    taskData.includeWeekends
  );

  return routineDates.map((date, index) => ({
    ...taskData,
    scheduledDate: date,
    title: `${taskData.title}${routineDates.length > 1 ? ` (#${index + 1})` : ''}`,
    description: taskData.description || '',
    observations: taskData.observations || '',
    status: 'pending' as const,
    order: (taskData.order || 0) + index,
    forwardHistory: [],
    forwardCount: 0,
    deliveryDates: [],
    isRecurrent: true,
    completionHistory: [],
    isForwarded: false,
    isConcluded: false,
    attachments: taskData.attachments || []
  }));
}

/**
 * Valida se a configuração de rotina está correta
 */
export function validateRoutineConfig(taskData: RoutineTaskData): string | null {
  if (!taskData.isRoutine) return null;
  
  if (!taskData.routineCycle) {
    return "Ciclo da rotina é obrigatório";
  }
  
  if (!taskData.routineStartDate) {
    return "Data de início da rotina é obrigatória";
  }
  
  const startDate = new Date(taskData.routineStartDate);
  const endDate = taskData.routineEndDate ? new Date(taskData.routineEndDate) : null;
  
  if (endDate && endDate <= startDate) {
    return "A data de fim deve ser posterior à data de início";
  }
  
  return null;
}