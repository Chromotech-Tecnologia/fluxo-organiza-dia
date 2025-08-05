import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para obter data atual no timezone de São Paulo
// export function getCurrentDateInSaoPaulo(): string {
//   const now = new Date();
//   const saoPauloTime = new Intl.DateTimeFormat("sv-SE", {
//     timeZone: "America/Sao_Paulo",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(now);
//   return saoPauloTime; // formato YYYY-MM-DD
// }

export function getCurrentDateInSaoPaulo(): string {
  const now = new Date();
  const saoPauloDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return saoPauloDate.toISOString().split("T")[0]; // retorna "yyyy-mm-dd"
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
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Função para obter data de amanhã
export function getTomorrowInSaoPaulo(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function formatDateToYMDInSaoPaulo(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // Retorna "yyyy-MM-dd"
}

export function toSaoPauloDate(inputDate: string | Date): Date {
  const date = typeof inputDate === "string" ? new Date(inputDate) : inputDate;

  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return new Date(formatted); // YYYY-MM-DD string parsed as Date
}
// lib/utils.ts





