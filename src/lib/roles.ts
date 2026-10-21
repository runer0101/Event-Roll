import type { StaffRole } from '@/generated/prisma/enums'

export const STAFF_ROLES: Array<{
  value: StaffRole
  label: string
  short: string
  canCheckIn: boolean
}> = [
  {
    value: 'GUARD',
    label: 'Guardia / puerta',
    short: 'Guardia',
    canCheckIn: true,
  },
  {
    value: 'COORDINATOR',
    label: 'Coordinación',
    short: 'Coordinación',
    canCheckIn: true,
  },
  { value: 'COOK', label: 'Cocina', short: 'Cocina', canCheckIn: false },
  { value: 'MUSIC', label: 'Música', short: 'Música', canCheckIn: false },
  {
    value: 'DECOR',
    label: 'Decoración',
    short: 'Decoración',
    canCheckIn: false,
  },
  { value: 'OTHER', label: 'Otro', short: 'Otro', canCheckIn: false },
]

export function roleLabel(role: StaffRole | string): string {
  return STAFF_ROLES.find((item) => item.value === role)?.short ?? 'Equipo'
}

export function defaultCanCheckIn(role: StaffRole | string): boolean {
  return STAFF_ROLES.find((item) => item.value === role)?.canCheckIn ?? false
}
