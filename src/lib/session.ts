import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getActiveStaff } from '@/lib/queries/staff'

export type OwnerSession = {
  userId: string
  name: string
  email: string
  organizationId: string
}

type SessionUserLike = {
  role?: string
  staffId?: string | null
  eventId?: string | null
  organizationId: string
  staffSessionVersion?: number | null
}

export type StaffAccess = NonNullable<
  Awaited<ReturnType<typeof getActiveStaff>>
>

export type StaffAccessResult =
  | { ok: true; staff: StaffAccess }
  | { ok: false; error: string }

/**
 * Resolve the active staff row for a Server Action or a route handler.
 *
 * `requireStaff()` redirects, which is right for a page and wrong for an action:
 * an action must return a message the client can render. Every staff action used
 * to copy this block by hand, and the copies had already drifted, so this is the
 * single place where a staff token becomes an authorized staff row.
 */
export async function resolveStaff(
  user: SessionUserLike | undefined,
): Promise<StaffAccessResult> {
  if (!user || user.role !== 'STAFF' || !user.staffId || !user.eventId) {
    return { ok: false, error: 'No autorizado' }
  }

  const staff = await getActiveStaff(
    user.staffId,
    user.eventId,
    user.organizationId,
    // -1 never matches a real version, so an old token cannot act.
    user.staffSessionVersion ?? -1,
  )
  // A missing row means the code was deactivated or its session version was
  // bumped: the token is valid but may no longer act.
  if (!staff) return { ok: false, error: 'Tu acceso está inactivo' }

  return { ok: true, staff }
}

export type StaffSession = {
  staffId: string
  eventId: string
  organizationId: string
  staffSessionVersion: number
  name: string
}

export async function requireOwner(): Promise<OwnerSession> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'OWNER') {
    redirect('/login')
  }

  return {
    userId: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
    organizationId: user.organizationId,
  }
}

export async function requireStaff(): Promise<StaffSession> {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'STAFF' || !user.staffId || !user.eventId) {
    redirect('/staff')
  }

  return {
    staffId: user.staffId,
    eventId: user.eventId,
    organizationId: user.organizationId,
    // -1 never matches a real version, so a token minted before the claim
    // existed is rejected instead of being silently trusted.
    staffSessionVersion: user.staffSessionVersion ?? -1,
    name: user.name ?? '',
  }
}
