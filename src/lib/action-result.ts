/**
 * Envelope every server action returns, optionally carrying its own payload.
 *
 * The shape is deliberately permissive — both fields are optional — instead of a
 * strict discriminated union such as `{ success: true; ... } | { success: false;
 * error: string }`. Client call sites read `result.error` before they narrow on
 * `result.success` (for example `if (result?.error) setError(result.error)`), so
 * a strict union would reject them until every one of them is updated. That
 * tightening needs its own change and its own review (follow-up F1 in
 * `odd/tasks/code-clarity.md`); until then this type only replaces the seven
 * duplicated local declarations with one.
 *
 * `Payload` holds the extra fields of a single action: `ActionResult<{ eventId?:
 * string }>` means "the envelope, plus an optional `eventId`".
 */
export type ActionResult<
  Payload = Record<never, never>,
> = {
  success?: boolean
  error?: string
} & Payload
