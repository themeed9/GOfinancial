import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "₦"): string {
  return `${currency}${amount.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()}`;
}

export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return dateStr1.substring(0, 10) === dateStr2.substring(0, 10);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function parseAmount(value: string): number {
  return parseFloat(value.replace(/,/g, "")) || 0;
}

export function formatAmountInput(value: string): string {
  const numericValue = value.replace(/[^0-9.]/g, "");
  if (!numericValue) return "";
  const parts = numericValue.split(".");
  const integerPart = parseInt(parts[0] || "0", 10).toLocaleString();
  if (parts.length > 1) {
    return integerPart + "." + parts[1].slice(0, 2);
  }
  return integerPart;
}
