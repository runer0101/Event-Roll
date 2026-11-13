'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from '@/lib/demo'
import { requireOwner, resolveStaff } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { ScheduleItemSchema } from '@/lib/validations/schedule'

type ActionResult = {
  success?: boolean
  error?: string
  itemId?: string
  status?: 'PENDING' | 'DONE'
}

export async function createScheduleItem(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared with every visitor: writing to it with the
  // published credentials would change what the next visitor sees.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = ScheduleItemSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const assigneeId = parsed.data.assigneeId || null
  if (assigneeId) {
    const assignee = await prisma.staff.findFirst({
      where: {
        id: assigneeId,
        eventId: event.id,
        organizationId: owner.organizationId,
      },
    })
    if (!assignee) {
      return { error: 'El responsable no pertenece a este evento' }
    }
  }

  const item = await prisma.scheduleItem.create({
    data: {
      organizationId: owner.organizationId,
      eventId: event.id,
      title: parsed.data.title,
      startAt: parsed.data.startAt,
      description: parsed.data.description || null,
      assigneeId,
    },
  })

  revalidatePath(`/dashboard/events/${event.id}`, 'layout')
  revalidatePath(`/staff/event/${event.id}`, 'layout')
  return { success: true, itemId: item.id }
}

export async function toggleScheduleItem(
  itemId: string,
): Promise<ActionResult> {
  const session = await auth()
  const user = session?.user
  if (!user) return { error: 'No autorizado' }
  // The published schedule of the demo is part of what visitors come to see,
  // and the seeded staff code is public too, so the check is not owner-only.
  if (isDemoOwner({ email: user.email ?? '' })) {
    return { error: DEMO_READ_ONLY_MESSAGE }
  }

  // Authorize before looking the item up, mirroring the guest actions.
  if (user.role === 'STAFF') {
    const access = await resolveStaff(user)
    if (!access.ok) return { error: access.error }
  }

  const item = await prisma.scheduleItem.findFirst({
    where: {
      id: itemId,
      organizationId: user.organizationId,
      ...(user.role === 'STAFF' ? { assigneeId: user.staffId, eventId: user.eventId } : {}),
    },
  })
  if (!item) return { error: 'Tarea no encontrada' }

  const status = item.status === 'DONE' ? 'PENDING' : 'DONE'
  await prisma.scheduleItem.update({
    where: { id: item.id },
    data: { status },
  })

  revalidatePath(`/dashboard/events/${item.eventId}`, 'layout')
  revalidatePath(`/staff/event/${item.eventId}`, 'layout')
  return { success: true, status }
}

export async function deleteScheduleItem(
  itemId: string,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared: its published schedule must stay intact.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const item = await prisma.scheduleItem.findFirst({
    where: { id: itemId, organizationId: owner.organizationId },
  })
  if (!item) return { error: 'Tarea no encontrada' }

  await prisma.scheduleItem.delete({ where: { id: item.id } })
  revalidatePath(`/dashboard/events/${item.eventId}`, 'layout')
  revalidatePath(`/staff/event/${item.eventId}`, 'layout')
  return { success: true }
}
