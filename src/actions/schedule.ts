'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { getActiveStaff } from '@/lib/queries/staff'
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
  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = ScheduleItemSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
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

  const item = await prisma.scheduleItem.findFirst({
    where: {
      id: itemId,
      organizationId: user.organizationId,
      ...(user.role === 'STAFF' ? { assigneeId: user.staffId, eventId: user.eventId } : {}),
    },
  })
  if (!item) return { error: 'Tarea no encontrada' }

  if (user.role === 'STAFF') {
    if (!user.staffId || !user.eventId) return { error: 'No autorizado' }
    const staff = await getActiveStaff(
      user.staffId,
      user.eventId,
      user.organizationId,
    )
    if (!staff) return { error: 'Tu acceso está inactivo' }
  }

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
  const item = await prisma.scheduleItem.findFirst({
    where: { id: itemId, organizationId: owner.organizationId },
  })
  if (!item) return { error: 'Tarea no encontrada' }

  await prisma.scheduleItem.delete({ where: { id: item.id } })
  revalidatePath(`/dashboard/events/${item.eventId}`, 'layout')
  revalidatePath(`/staff/event/${item.eventId}`, 'layout')
  return { success: true }
}
