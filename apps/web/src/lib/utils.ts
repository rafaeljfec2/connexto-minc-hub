import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatDate, formatDateTime, formatTime } from '@minc-hub/shared/utils'

export function parseLocalDate(dateString: string): Date {
  // Handles YYYY-MM-DD strings by treating them as local dates
  if (dateString.includes('T')) {
    return new Date(dateString)
  }
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}
