'use server'

import { revalidateEvent } from '@/lib/revalidate'
import prisma from '@/lib/prisma'
import { DEMO_READ_ONLY_MESSAGE, isDemoOwner } from '@/lib/demo'
import { requireOwner } from '@/lib/session'
import { getEventForOwner } from '@/lib/queries/events'
import { generateStaffCode } from '@/lib/utils'
import {
  SetStaffActiveSchema,
  StaffSchema,
  StaffUpdateSchema,
} from '@/lib/validations/staff'
import type { ActionResult as SharedActionResult } from '@/lib/action-result'

type ActionResult = SharedActionResult<{
  staffId?: string
  code?: string
}>

export async function createStaff(
  eventId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // The demo organization is shared with every visitor: writing to it with the
  // published credentials would change what the next visitor sees.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const event = await getEventForOwner(eventId, owner.organizationId)
  if (!event) return { error: 'Evento no encontrado' }

  const parsed = StaffSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
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

  revalidateEvent(event.id)
  return { success: true, staffId: staff.id, code: staff.code }
}

export async function updateStaff(
  staffId: string,
  input: unknown,
): Promise<ActionResult> {
  const owner = await requireOwner()
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const parsed = StaffUpdateSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  const {
    name,
    role,
    canCheckIn,
    canViewContact,
    canEditGuests,
    canExport,
    canUndoCheckIn,
    canViewStats,
  } = parsed.data

  // Only the fields present in the payload are written: an omitted permission
  // keeps its stored value instead of being silently revoked.
  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      name,
      ...(role === undefined ? {} : { role }),
      ...(canCheckIn === undefined ? {} : { canCheckIn }),
      ...(canViewContact === undefined ? {} : { canViewContact }),
      ...(canEditGuests === undefined ? {} : { canEditGuests }),
      ...(canExport === undefined ? {} : { canExport }),
      ...(canUndoCheckIn === undefined ? {} : { canUndoCheckIn }),
      ...(canViewStats === undefined ? {} : { canViewStats }),
    },
  })

  revalidateEvent(staff.eventId)
  return { success: true, staffId: staff.id }
}

export async function regenerateStaffCode(
  staffId: string,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // Rotating a code would invalidate the codes the demo publishes.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const staff = await prisma.staff.findFirst({
    where: { id: staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  const code = generateStaffCode()
  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      code,
      // Revoke sessions opened with the previous code.
      sessionVersion: { increment: 1 },
    },
  })

  revalidateEvent(staff.eventId)
  return { success: true, code }
}

export async function setStaffActive(
  staffId: string,
  active: boolean,
): Promise<ActionResult> {
  const owner = await requireOwner()
  // Deactivating the demo team would lock every visitor out of the demo.
  if (isDemoOwner(owner)) return { error: DEMO_READ_ONLY_MESSAGE }

  const parsed = SetStaffActiveSchema.safeParse({ staffId, active })
  if (!parsed.success) return { error: 'Estado inválido' }

  const staff = await prisma.staff.findFirst({
    where: { id: parsed.data.staffId, organizationId: owner.organizationId },
  })
  if (!staff) return { error: 'Ayudante no encontrado' }

  await prisma.staff.update({
    where: { id: staff.id },
    data: {
      active: parsed.data.active,
      // Deactivating or reactivating invalidates sessions opened before now.
      sessionVersion: { increment: 1 },
    },
  })

  revalidateEvent(staff.eventId)
  return { success: true }
}
