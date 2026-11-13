'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from '@/lib/demo'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { TableSchema } from '@/lib/validations/tables'

// A server action receives anything at runtime, so an id arrives as whatever
// the caller sent; the same shape as the guest id schema keeps it bounded.
const ChairIdSchema = z.string().trim().min(1).max(64)

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
  // The demo organization is shared: its floor plan must survive the visitors.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = TableSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { error: 'Ya existe una mesa con ese nombre' }
    }
    throw error
  }
}

export async function deleteTable(
  tableId: string,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared: its floor plan must survive the visitors.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

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
  // The demo organization is shared: its floor plan must survive the visitors.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const parsedId = ChairIdSchema.safeParse(chairId)
  // One message for every malformed id: the caller gets a handled error, never
  // the TypeError or Prisma failure a raw value used to cause.
  if (!parsedId.success) return { error: 'Silla inválida' }

  const chair = await prisma.chair.findFirst({
    where: { id: parsedId.data, organizationId: owner.organizationId },
    select: { id: true, eventId: true, occupied: true },
  })
  if (!chair) return { error: 'Silla no encontrada' }

  // Compare-and-set: the write only lands on the state this click saw, so a
  // second click or another tab cannot flip the chair twice from one stale
  // read. Zero rows changed means someone else won that race.
  const occupied = !chair.occupied
  const changed = await prisma.chair.updateMany({
    where: {
      id: chair.id,
      organizationId: owner.organizationId,
      occupied: chair.occupied,
    },
    data: { occupied },
  })
  revalidatePath(`/dashboard/events/${chair.eventId}`, 'layout')

  if (changed.count > 0) return { success: true, occupied }

  // Converge on what the chair actually holds now instead of guessing.
  const current = await prisma.chair.findFirst({
    where: { id: chair.id, organizationId: owner.organizationId },
    select: { occupied: true },
  })
  if (!current) return { error: 'Silla no encontrada' }
  return { success: true, occupied: current.occupied }
}

export async function resetTable(tableId: string): Promise<ActionResult> {
  const owner = await requireOwner()
  // Resetting wipes the seat assignments, which cannot be undone.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

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
