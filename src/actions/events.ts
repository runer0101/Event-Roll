'use server'

import { revalidatePath } from 'next/cache'
import { revalidateEvent } from '@/lib/revalidate'
import prisma from '@/lib/prisma'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from '@/lib/demo'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { EventSchema, EventStatusSchema } from '@/lib/validations/events'

type ActionResult = {
  success?: boolean
  error?: string
  eventId?: string
}

export async function createEvent(input: unknown): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared with every visitor: nothing in it may be
  // created, edited or deleted with the published credentials.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const parsed = EventSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, date, location, description } = parsed.data
  if (date.getTime() < Date.now()) {
    return { error: 'La fecha del evento debe ser futura' }
  }

  const event = await prisma.event.create({
    data: {
      organizationId: owner.organizationId,
      name,
      date,
      location,
      description: description || null,
    },
  })

  revalidatePath('/dashboard')
  return { success: true, eventId: event.id }
}

export async function updateEvent(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = EventSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, date, location, description } = parsed.data
  await prisma.event.update({
    where: { id: event.id },
    data: { name, date, location, description: description || null },
  })

  revalidatePath('/dashboard')
  revalidateEvent(event.id)
  return { success: true, eventId: event.id }
}

export async function setEventStatus(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // Closing the demo event with the published credentials would end the demo
  // for every visitor, so the status is part of the read-only surface too.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = EventStatusSchema.safeParse(input)
  if (!parsed.success) return { error: 'Estado inválido' }

  await prisma.event.update({
    where: { id: event.id },
    data: { status: parsed.data },
  })

  revalidatePath('/dashboard')
  revalidateEvent(event.id)
  return { success: true }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared with every visitor: deleting its event
  // would leave the published demo empty for everyone else.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  await prisma.event.delete({ where: { id: event.id } })
  revalidatePath('/dashboard')
  return { success: true }
}
