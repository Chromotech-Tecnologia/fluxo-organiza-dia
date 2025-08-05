import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para obter data atual no timezone de São Paulo
export function getCurrentDateInSaoPaulo(): string {
  const now = new Date();
  // Usar toLocaleDateString com timezone de São Paulo para obter data local
  const localDate = new Date(now.toLocaleString("en-CA", { timeZone: "America/Sao_Paulo" }));
  return localDate.toISOString().split('T')[0];
}

// Função para converter Date do calendário para string YYYY-MM-DD
export function calendarDateToString(date: Date): string {
  // Garantir que a data seja interpretada como local sem conversão de timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para converter string YYYY-MM-DD para Date do calendário
export function stringToCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar Date object local sem conversão de timezone
  return new Date(year, month - 1, day);
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

// Função para obter data de ontem
export function getYesterdayInSaoPaulo(): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const localDate = new Date(yesterday.toLocaleString("en-CA", { timeZone: "America/Sao_Paulo" }));
  return localDate.toISOString().split('T')[0];
}

// Função para obter data de amanhã
export function getTomorrowInSaoPaulo(): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const localDate = new Date(tomorrow.toLocaleString("en-CA", { timeZone: "America/Sao_Paulo" }));
  return localDate.toISOString().split('T')[0];
}
