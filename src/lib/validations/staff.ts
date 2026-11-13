import { z } from 'zod'

const staffRole = z.enum([
  'GUARD',
  'COORDINATOR',
  'COOK',
  'MUSIC',
  'DECOR',
  'OTHER',
])

export const StaffSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del ayudante').max(80),
  role: staffRole.default('GUARD'),
  canCheckIn: z.boolean().default(true),
  canViewContact: z.boolean().default(false),
  canEditGuests: z.boolean().default(false),
  canExport: z.boolean().default(false),
  canUndoCheckIn: z.boolean().default(false),
  canViewStats: z.boolean().default(false),
})

/**
 * Editing a staff member only rewrites the fields the payload actually sends:
 * every permission is optional, so an omitted one keeps its stored value
 * instead of falling back to `false` and silently revoking access.
 */
export const StaffUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del ayudante').max(80),
  role: staffRole.optional(),
  canCheckIn: z.boolean().optional(),
  canViewContact: z.boolean().optional(),
  canEditGuests: z.boolean().optional(),
  canExport: z.boolean().optional(),
  canUndoCheckIn: z.boolean().optional(),
  canViewStats: z.boolean().optional(),
})

export const SetStaffActiveSchema = z.object({
  staffId: z.string().trim().min(1).max(64),
  active: z.boolean(),
})

export type StaffInput = z.infer<typeof StaffSchema>
