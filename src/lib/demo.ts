/**
 * The public demo ships with published credentials on purpose: a stranger can
 * walk the product without signing up. That also makes every visitor an OWNER
 * of the demo organization, so the irreversible actions are closed for it —
 * otherwise one visitor can empty the demo for everyone who comes after.
 */
const DEFAULT_DEMO_EMAIL = 'demo@event-roll.dev'

export const DEMO_READ_ONLY_MESSAGE =
  'La demo pública es de sólo lectura. Crea tu cuenta para probar todo.'

function demoOwnerEmail(): string {
  // `??` would let an empty value through and block every owner with a blank
  // session email, so the fallback is applied after trimming.
  const configured = (process.env.DEMO_OWNER_EMAIL ?? '').trim().toLowerCase()
  return configured || DEFAULT_DEMO_EMAIL
}

export function isDemoOwner(owner: { email: string }): boolean {
  return owner.email.trim().toLowerCase() === demoOwnerEmail()
}
