import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parse, parseISO } from "date-fns"
import { toZonedTime, fromZonedTime } from "date-fns-tz"

const TIMEZONE = 'America/Sao_Paulo';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter Date object para string no formato YYYY-MM-DD no timezone de São Paulo
export function dateToLocalString(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd');
}

// Função para converter string YYYY-MM-DD para Date object no timezone de São Paulo
export function stringToLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
  return fromZonedTime(localDate, TIMEZONE);
}

// Função para criar um Date object no timezone de São Paulo
export function createLocalDate(year: number, month: number, day: number): Date {
  const localDate = new Date(year, month - 1, day, 12, 0, 0, 0);
  return fromZonedTime(localDate, TIMEZONE);
}

// Função para converter Date object do calendário para string no formato YYYY-MM-DD
export function calendarDateToString(date: Date): string {
  // O React Day Picker retorna um Date object que representa exatamente o dia selecionado
  // Vamos usar diretamente os métodos do objeto Date sem conversão de timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para converter string para Date object que o calendário entende
export function stringToCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Criar um Date object que representa exatamente o dia no timezone local
  return new Date(year, month - 1, day);
}

// Função para obter a data atual no timezone de São Paulo
export function getCurrentDateInSaoPaulo(): string {
  const now = new Date();
  const zonedDate = toZonedTime(now, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd');
}

// Função para verificar se uma data é futura considerando o timezone de São Paulo
export function isFutureDate(dateString: string): boolean {
  const today = getCurrentDateInSaoPaulo();
  return dateString >= today;
}
