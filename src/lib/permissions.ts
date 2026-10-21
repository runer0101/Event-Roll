export type StaffPermissions = {
  canViewContact: boolean
  canEditGuests: boolean
  canExport: boolean
  canUndoCheckIn: boolean
  canViewStats: boolean
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  canViewContact: false,
  canEditGuests: false,
  canExport: false,
  canUndoCheckIn: false,
  canViewStats: false,
}

export const FULL_STAFF_PERMISSIONS: StaffPermissions = {
  canViewContact: true,
  canEditGuests: true,
  canExport: true,
  canUndoCheckIn: true,
  canViewStats: true,
}

export const PERMISSION_LABELS = [
  {
    key: 'canViewContact',
    label: 'Ver datos de contacto',
    description: 'Email y teléfono de los invitados.',
  },
  {
    key: 'canEditGuests',
    label: 'Editar invitados',
    description: 'Cambiar nombre, categoría, acompañantes o notas.',
  },
  {
    key: 'canExport',
    label: 'Exportar lista',
    description: 'Descargar la lista de invitados en CSV.',
  },
  {
    key: 'canUndoCheckIn',
    label: 'Deshacer check-in',
    description: 'Revertir una entrada marcada por error.',
  },
  {
    key: 'canViewStats',
    label: 'Ver estadísticas',
    description: 'Ver el avance de entradas en la pantalla de guardia.',
  },
] as const satisfies Array<{
  key: keyof StaffPermissions
  label: string
  description: string
}>

export function permissionsFromStaff(staff: StaffPermissions): StaffPermissions {
  return {
    canViewContact: staff.canViewContact,
    canEditGuests: staff.canEditGuests,
    canExport: staff.canExport,
    canUndoCheckIn: staff.canUndoCheckIn,
    canViewStats: staff.canViewStats,
  }
}
