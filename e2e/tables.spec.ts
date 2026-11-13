import { expect, test } from '@playwright/test'
import { registerOrganizer } from './helpers'

test('clicking every chair marks the table as full and red', async ({
  page,
}) => {
  const stamp = Date.now()
  const table = `Mesa ${stamp}`

  // The demo organization is read-only, so this spec builds its own event and
  // table. It also covers creating a table, which is where the form used to
  // throw after the row had already been written.
  await registerOrganizer(page, stamp)

  await page.goto('/dashboard/events/new')
  await page.fill('#name', `Evento ${stamp}`)
  await page.fill('#date', '2027-12-31T20:00')
  await page.fill('#location', 'Sala de pruebas')
  await page.getByRole('button', { name: 'Crear evento' }).click()
  await page.waitForURL('**/dashboard/events/**')
  const eventUrl = page.url().replace(/\/$/, '')

  await page.goto(`${eventUrl}/tables`)
  await page.fill('#table-name', table)
  await page.fill('#table-capacity', '4')
  await page.getByRole('button', { name: 'Crear mesa' }).click()
  await expect(page.getByRole('heading', { name: table })).toBeVisible()

  const available = page.getByRole('button', {
    name: new RegExp(`${table}, silla \\d+, disponible`),
  })

  for (let index = await available.count(); index > 0; index -= 1) {
    await available.first().click()
    await page.waitForTimeout(120)
  }

  const tableHeader = page.getByRole('heading', { name: table }).locator('..')
  await expect(tableHeader).toContainText('Llena')

  await expect(
    page.getByRole('button', { name: new RegExp(`${table}, silla 4, ocupada`) }),
  ).toHaveAttribute('aria-pressed', 'true')
})
