import { expect, test, type Page } from '@playwright/test'

async function loginOrganizer(page: Page) {
  await page.goto('/login')
  await page.waitForTimeout(500)
  await page.fill('#email', 'demo@event-roll.dev')
  await page.fill('#password', 'event-roll-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

async function loginStaff(page: Page, code = 'STF-GUARD01') {
  await page.goto('/staff')
  await page.waitForTimeout(500)
  await page.fill('#code', code)
  await page.getByRole('button', { name: 'Entrar a la puerta' }).click()
  await page.waitForURL('**/staff/event/**')
}

test('the organizer signs in and sees the seeded events', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /Cada invitado/ }),
  ).toBeVisible()

  await loginOrganizer(page)
  await expect(
    page.getByRole('heading', { name: 'Tus eventos' }),
  ).toBeVisible()
  await expect(page.getByText('Sunset Fest 2026').first()).toBeVisible()
})

test('a guard enters with the unique code and reaches the door screen', async ({
  page,
}) => {
  await loginStaff(page)
  await expect(
    page.getByRole('heading', { name: 'Control de acceso' }),
  ).toBeVisible()
  await expect(page.getByPlaceholder(/Busca por nombre/)).toBeVisible()
})
