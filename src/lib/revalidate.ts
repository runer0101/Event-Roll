import { revalidatePath } from 'next/cache'

/**
 * Revalidate the two screens an event write can change.
 *
 * The actions used to call revalidatePath by hand: twenty sites with eight
 * different combinations, so a write could refresh the dashboard and leave the
 * door screen stale, or the reverse. The `/dashboard` list stays separate
 * because only some writes change the list of events.
 */
export function revalidateEvent(eventId: string): void {
  revalidatePath(`/dashboard/events/${eventId}`, 'layout')
  revalidatePath(`/staff/event/${eventId}`, 'layout')
}
