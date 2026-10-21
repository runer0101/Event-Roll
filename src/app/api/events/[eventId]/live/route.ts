import { auth } from '@/auth'
import { getLiveData } from '@/lib/queries/live'
import { getEventForOwner } from '@/lib/queries/events'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const session = await auth()
  const user = session?.user
  if (!user || user.role !== 'OWNER') {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { eventId } = await params
  const event = await getEventForOwner(eventId, user.organizationId)
  if (!event) {
    return Response.json({ error: 'Evento no encontrado' }, { status: 404 })
  }

  const data = await getLiveData(event.id, user.organizationId)
  return Response.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
