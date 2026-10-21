import { customAlphabet } from 'nanoid'

/** Joins conditional class names without pulling in another dependency. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}

const dateFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'long',
})

const dateTimeFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const timeFormatter = new Intl.DateTimeFormat('es', {
  timeStyle: 'short',
})

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date))
}

export function formatTime(date: Date | string): string {
  return timeFormatter.format(new Date(date))
}

/** Value for an <input type="datetime-local"> in the server's timezone. */
export function toDateTimeInput(date: Date | string): string {
  const value = new Date(date)
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate(),
  )}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

/** Lowercase, accent-free text used for search and duplicate detection. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

const codeAlphabet = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8)

/** Guest identifier printed on the invitation and used for quick search. */
export function generateGuestCode(): string {
  return `INV-${codeAlphabet()}`
}

/** Staff access code. It is the only credential a guard needs. */
export function generateStaffCode(): string {
  return `STF-${codeAlphabet()}`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function absoluteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${path}`
}
