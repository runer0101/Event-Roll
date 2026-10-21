'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { TableSchema } from '@/lib/validations/tables'

type ActionResult = {
  success?: boolean
  error?: string
  tableId?: string
  occupied?: boolean
}

export async function createTable(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = TableSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  try {
    const table = await prisma.eventTable.create({
      data: {
        organizationId: owner.organizationId,
        eventId: event.id,
        name: parsed.data.name,
        capacity: parsed.data.capacity,
        chairs: {
          create: Array.from({ length: parsed.data.capacity }, (_, index) => ({
            organizationId: owner.organizationId,
            eventId: event.id,
            number: index + 1,
          })),
        },
      },
    })

    revalidatePath(`/dashboard/events/${event.id}`, 'layout')
    return { success: true, tableId: table.id }
  } catch {
    return { error: 'Ya existe una mesa con ese nombre' }
  }
}

export async function deleteTable(
  tableId: string,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const table = await prisma.eventTable.findFirst({
    where: { id: tableId, organizationId: owner.organizationId },
  })
  if (!table) return { error: 'Mesa no encontrada' }

  await prisma.eventTable.delete({ where: { id: table.id } })
  revalidatePath(`/dashboard/events/${table.eventId}`, 'layout')
  return { success: true }
}

export async function toggleChair(chairId: string): Promise<ActionResult> {
  const owner = await requireOwner()
  const chair = await prisma.chair.findFirst({
    where: { id: chairId, organizationId: owner.organizationId },
  })
  if (!chair) return { error: 'Silla no encontrada' }

  const occupied = !chair.occupied
  await prisma.chair.update({
    where: { id: chair.id },
    data: { occupied },
  })
  revalidatePath(`/dashboard/events/${chair.eventId}`, 'layout')
  return { success: true, occupied }
}

export async function resetTable(tableId: string): Promise<ActionResult> {
  const owner = await requireOwner()
  const table = await prisma.eventTable.findFirst({
    where: { id: tableId, organizationId: owner.organizationId },
  })
  if (!table) return { error: 'Mesa no encontrada' }

  await prisma.chair.updateMany({
    where: { tableId: table.id },
    data: { occupied: false, guestName: null },
  })
  revalidatePath(`/dashboard/events/${table.eventId}`, 'layout')
  return { success: true }
}
