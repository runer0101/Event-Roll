import { z } from 'zod'

export const StaffSchema = z.object({
  name: z.string().trim().min(2, 'Escribe el nombre del ayudante').max(80),
  role: z
    .enum(['GUARD', 'COORDINATOR', 'COOK', 'MUSIC', 'DECOR', 'OTHER'])
    .default('GUARD'),
  canCheckIn: z.boolean().default(true),
  canViewContact: z.boolean().default(false),
  canEditGuests: z.boolean().default(false),
  canExport: z.boolean().default(false),
  canUndoCheckIn: z.boolean().default(false),
  canViewStats: z.boolean().default(false),
})

export const StaffIdSchema = z.object({ staffId: z.string().min(1) })

export type StaffInput = z.infer<typeof StaffSchema>
