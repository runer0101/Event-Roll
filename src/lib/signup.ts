/**
 * The deployed demo closes public signup: the account it advertises is shared,
 * and letting strangers create organizations spends the free database and CPU
 * budget of the demo itself. Locally, signup stays open.
 */
export const PUBLIC_SIGNUP_DISABLED_MESSAGE =
  'El registro público está cerrado en esta demo. Ejecuta el proyecto en local para crear tu cuenta.'

export function isPublicSignupDisabled(): boolean {
  return (process.env.DISABLE_PUBLIC_SIGNUP ?? '').trim().toLowerCase() === 'true'
}
