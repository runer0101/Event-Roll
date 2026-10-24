import { expect, test } from '@playwright/test'
import { eventHref, loginOrganizer } from './helpers'

test('clicking every chair marks the table as full and red', async ({
  page,
}) => {
  await loginOrganizer(page)
  const eventLink = await eventHref(page, 'Sunset Fest 2026')
  await page.goto(`${eventLink}/tables`)

  const available = page.getByRole('button', {
    name: /Mesa 2, silla \d+, disponible/,
  })

  for (let index = await available.count(); index > 0; index -= 1) {
    await available.first().click()
    await page.waitForTimeout(120)
  }

  const tableHeader = page.getByRole('heading', { name: 'Mesa 2' }).locator('..')
  await expect(tableHeader).toContainText('Llena')

  await expect(
    page.getByRole('button', { name: /Mesa 2, silla 8, ocupada/ }),
  ).toHaveAttribute('aria-pressed', 'true')
})
