import type { Page } from '@playwright/test'

const DEMO_EMAIL = 'demo@event-roll.dev'
const DEMO_PASSWORD = 'event-roll-demo'

export async function loginOrganizer(page: Page) {
  await page.goto('/login')
  // The login form is a client component: wait for hydration before typing.
  await page.waitForTimeout(500)
  await page.fill('#email', DEMO_EMAIL)
  await page.fill('#password', DEMO_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

export async function loginStaff(page: Page, code = 'STF-GUARD01') {
  await page.goto('/staff')
  await page.waitForTimeout(500)
  await page.fill('#code', code)
  await page.getByRole('button', { name: 'Entrar a la puerta' }).click()
  await page.waitForURL('**/staff/event/**')
}

/**
 * Resolves an event card by its accessible name instead of relying on the
 * seed's date order, so adding an event does not break the suite.
 */
export async function eventHref(
  page: Page,
  eventName: string,
): Promise<string> {
  const href = await page
    .getByRole('link', { name: `Abrir panel de ${eventName}` })
    .getAttribute('href')

  if (!href) throw new Error(`No panel link for event "${eventName}"`)
  return href
}
