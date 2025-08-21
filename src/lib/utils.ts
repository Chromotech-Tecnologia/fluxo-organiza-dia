import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para obter data atual no timezone de São Paulo - CORRIGIDA
export function getCurrentDateInSaoPaulo(): string {
  const now = new Date();
  // Usar Intl.DateTimeFormat que é mais confiável para timezone
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const result = formatter.format(now);
  console.log('getCurrentDateInSaoPaulo:', result);
  return result; // formato YYYY-MM-DD
}

// Função para formatar data para exibição (DD/MM/YYYY) - SEGURA PARA TIMEZONE
export function formatDateForDisplay(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  const result = `${day}/${month}/${year}`;
  console.log('formatDateForDisplay - Input:', dateString, 'Output:', result);
  return result;
}

// Função para criar Date local sem conversão de timezone - NOVA
export function createLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar Date local usando o timezone local, não UTC
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  console.log('createLocalDate - Input:', dateString, 'Output:', date);
  return date;
}

// Função para obter o dia do mês de uma data string - PARA CALENDÁRIO
export function getDayFromDateString(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  console.log('getDayFromDateString - Input:', dateString, 'Day:', day);
  return day;
}

// Função para verificar se uma data string corresponde a um dia específico - PARA CALENDÁRIO
export function isDateStringOnDay(dateString: string, targetDay: number, targetMonth: number, targetYear: number): boolean {
  const [year, month, day] = dateString.split('-').map(Number);
  const matches = year === targetYear && month === (targetMonth + 1) && day === targetDay;
  console.log('isDateStringOnDay - DateString:', dateString, 'Target:', `${targetYear}-${targetMonth + 1}-${targetDay}`, 'Matches:', matches);
  return matches;
}

// Função para converter Date do calendário para string YYYY-MM-DD - CORRIGIDA
export function calendarDateToString(date: Date): string {
  // Garantir que a data seja interpretada como local sem conversão de timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  console.log('calendarDateToString - Input:', date, 'Output:', `${year}-${month}-${day}`);
  return `${year}-${month}-${day}`;
}

// Função para converter string YYYY-MM-DD para Date do calendário - CORRIGIDA
export function stringToCalendarDate(dateString: string): Date {
  console.log('stringToCalendarDate - Input:', dateString);
  
  // Handle undefined, null, or empty string
  if (!dateString || dateString.trim() === '') {
    // Return current date as fallback
    const today = new Date();
    console.log('stringToCalendarDate - Using current date as fallback:', today);
    return today;
  }
  
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar Date object local sem conversão de timezone
  // Usar meio-dia para evitar problemas de DST
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  
  console.log('stringToCalendarDate - Output:', date);
  return date;
}

// Função para verificar se uma data é futura
export function isFutureDate(dateString: string): boolean {
  const today = getCurrentDateInSaoPaulo();
  return dateString > today;
}

// Função para comparar datas em formato string
export function isSameDate(date1: string, date2: string): boolean {
  return date1 === date2;
}

// Função para obter data de ontem - CORRIGIDA
export function getYesterdayInSaoPaulo(): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(yesterday);
}

// Função para obter data de amanhã - CORRIGIDA
export function getTomorrowInSaoPaulo(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
}

// Função para formatar Date para YYYY-MM-DD no timezone de São Paulo
export function formatDateToYMDInSaoPaulo(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Função para converter data para timezone de São Paulo - CORRIGIDA
export function toSaoPauloDate(inputDate: string | Date): Date {
  let date: Date;
  
  if (typeof inputDate === "string") {
    // Se é uma string no formato YYYY-MM-DD, criar Date local
    const [year, month, day] = inputDate.split('-').map(Number);
    date = new Date(year, month - 1, day, 12, 0, 0, 0);
  } else {
    date = inputDate;
  }

  // Retornar a data ajustada para São Paulo
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [year, month, day] = formatted.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}
