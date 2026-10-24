import { expect, test } from '@playwright/test'
import { loginOrganizer, loginStaff } from './helpers'

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
