
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
