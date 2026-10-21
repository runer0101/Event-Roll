import { expect, test, type Page } from '@playwright/test'

async function loginOrganizer(page: Page) {
  await page.goto('/login')
  await page.waitForTimeout(500)
  await page.fill('#email', 'demo@event-roll.dev')
  await page.fill('#password', 'event-roll-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test('clicking every chair marks the table as full and red', async ({
  page,
}) => {
  await loginOrganizer(page)
  const eventHref = await page
    .getByRole('link', { name: 'Abrir panel' })
    .nth(1)
    .getAttribute('href')
  await page.goto(`${eventHref}/tables`)

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
