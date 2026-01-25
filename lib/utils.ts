import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes bestFor field to always return an array of strings
 * Handles: arrays, strings (comma/newline separated), objects, null/undefined
 */
export function normalizeBestFor(bestFor: unknown): string[] {
  if (!bestFor) return [];
  
  // If already an array, validate and return
  if (Array.isArray(bestFor)) {
    return bestFor
      .map(item => String(item).trim())
      .filter(item => item.length > 0);
  }
  
  // If string, parse it
  if (typeof bestFor === 'string') {
    const trimmed = bestFor.trim();
    if (!trimmed) return [];
    
    // Try splitting by newlines first
    if (trimmed.includes('\n')) {
      return trimmed.split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    // Then try commas
    if (trimmed.includes(',')) {
      return trimmed.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    // Single string value
    return [trimmed];
  }
  
  // For any other type (object, number, etc.), convert to string and return as single item
  try {
    const str = String(bestFor).trim();
    return str ? [str] : [];
  } catch {
    return [];
  }
}
