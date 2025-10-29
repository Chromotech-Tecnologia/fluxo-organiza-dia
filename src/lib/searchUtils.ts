import { Task, TaskFilter } from "@/types";

// Utilitário para busca sem acentuação
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c');
}

export function searchInTask(task: any, searchQuery: string): boolean {
  if (!searchQuery.trim()) return true;
  
  const normalizedQuery = normalizeText(searchQuery);
  
  // Buscar em título
  if (normalizeText(task.title || '').includes(normalizedQuery)) return true;
  
  // Buscar em descrição
  if (normalizeText(task.description || '').includes(normalizedQuery)) return true;
  
  // Buscar em observações
  if (normalizeText(task.observations || '').includes(normalizedQuery)) return true;
  
  // Buscar em checklist
  if (task.subItems && Array.isArray(task.subItems)) {
    for (const item of task.subItems) {
      if (normalizeText(item.text || '').includes(normalizedQuery)) return true;
    }
  }
  
  return false;
}

export function filterTasks(tasks: Task[], searchQuery: string, filters: TaskFilter): Task[] {
  let filtered = tasks;

  // Apply search query
  if (searchQuery.trim()) {
    filtered = filtered.filter(task => searchInTask(task, searchQuery));
  }

  // Apply filters
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(task => {
      if (filters.status?.includes('completed')) {
        return task.isConcluded;
      }
      if (filters.status?.includes('pending')) {
        return !task.isConcluded;
      }
      return true;
    });
  }

  if (filters.priority && filters.priority.length > 0) {
    filtered = filtered.filter(task => filters.priority?.includes(task.priority));
  }

  if (filters.type && filters.type.length > 0) {
    filtered = filtered.filter(task => filters.type?.includes(task.type));
  }

  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter(task => filters.category?.includes(task.category));
  }

  if (filters.timeInvestment && filters.timeInvestment.length > 0) {
    filtered = filtered.filter(task => filters.timeInvestment?.includes(task.timeInvestment));
  }

  if (filters.assignedPersonId) {
    filtered = filtered.filter(task => task.assignedPersonId === filters.assignedPersonId);
  }

  if (filters.hasChecklist === true) {
    filtered = filtered.filter(task => task.subItems && task.subItems.length > 0);
  }

  if (filters.isForwarded === true) {
    filtered = filtered.filter(task => task.isForwarded);
  }

  if (filters.isForwarded === false) {
    filtered = filtered.filter(task => !task.isForwarded);
  }

  return filtered;
}
