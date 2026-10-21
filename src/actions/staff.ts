'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { generateStaffCode } from '@/lib/utils'
import { StaffSchema } from '@/lib/validations/staff'

type ActionResult = {
  success?: boolean
  error?: string
  staffId?: string
  code?: string
}

export async function createStaff(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = StaffSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const staff = await prisma.staff.create({
    data: {
      organizationId: owner.organizationId,
      eventId: event.id,
      code: generateStaffCode(),
      name: parsed.data.name,
      role: parsed.data.role,
      canCheckIn: parsed.data.canCheckIn,
      canViewContact: parsed.data.canViewContact,
      canEditGuests: parsed.data.canEditGuests,
      canExport: parsed.data.canExport,
      canUndoCheckIn: parsed.data.canUndoCheckIn,
      canViewStats: parsed.data.canViewStats,
    },
  })

  revalidatePath(`/dashboard/events/${event.id}`, 'layout')
  return { success: true, staffId: staff.id, code: staff.code }
}

export async function updateStaff(
  staffId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  const parsed = StaffSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      canCheckIn: parsed.data.canCheckIn,
      canViewContact: parsed.data.canViewContact,
      canEditGuests: parsed.data.canEditGuests,
      canExport: parsed.data.canExport,
      canUndoCheckIn: parsed.data.canUndoCheckIn,
      canViewStats: parsed.data.canViewStats,
    },
  })

  revalidatePath(`/dashboard/events/${staff.eventId}`, 'layout')
  revalidatePath(`/staff/event/${staff.eventId}`, 'layout')
  return { success: true, staffId: staff.id }
}

export async function regenerateStaffCode(
  staffId: string,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  const code = generateStaffCode()
  await prisma.staff.update({
    where: { id: staff.id },
    data: { code },
  })

  revalidatePath(`/dashboard/events/${staff.eventId}`, 'layout')
  return { success: true, code }
}

export async function setStaffActive(
  staffId: string,
  active: boolean,
): Promise<ActionResult> {
  const owner = await requireOwner()
  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  await prisma.staff.update({
    where: { id: staff.id },
    data: { active },
  })

  revalidatePath(`/dashboard/events/${staff.eventId}`, 'layout')
  return { success: true }
}
