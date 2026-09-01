import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Rótulo exibido de opção de quiz (A, B, C, D…) pelo índice na lista */
export function getQuizOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}
