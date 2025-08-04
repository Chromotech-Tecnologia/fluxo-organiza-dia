import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter uma data do calendário para string no formato YYYY-MM-DD
// sem problemas de timezone
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para converter uma string de data para Date object no timezone local
export function stringToLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Função para criar um Date object "neutro" (sem hora) que representa exatamente o dia selecionado
export function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0); // Meio-dia para evitar shifts de timezone
}

// Função para converter Date object do calendário para string evitando timezone issues
export function calendarDateToString(date: Date): string {
  // Usa getFullYear, getMonth, getDate que são timezone-safe
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate() + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Função para converter string para Date object que o calendário entende
export function stringToCalendarDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return createLocalDate(year, month, day);
}
