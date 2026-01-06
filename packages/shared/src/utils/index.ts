export function formatDate(date: string | Date): string {
  let d: Date

  if (typeof date === 'string') {
    // If the string is in YYYY-MM-DD format (no time component), parse as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number)
      d = new Date(year, month - 1, day) // month is 0-indexed
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}
