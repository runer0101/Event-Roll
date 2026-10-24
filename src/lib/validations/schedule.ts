import { z } from 'zod'

export const ScheduleItemSchema = z.object({
  title: z.string().trim().min(2, 'Escribe el nombre de la tarea').max(120),
  startAt: z.coerce.date({ error: 'Hora inválida' }),
  assigneeId: z.string().optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
})

export type ScheduleItemInput = z.infer<typeof ScheduleItemSchema>
