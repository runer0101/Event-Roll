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

test('a guard checks a guest in and the organizer sees it live', async ({
  browser,
}) => {
  const organizer = await browser.newContext()
  const ownerPage = await organizer.newPage()
  await loginOrganizer(ownerPage)

  const eventHref = await ownerPage
    .getByRole('link', { name: 'Abrir panel' })
    .nth(1)
    .getAttribute('href')
  const eventId = eventHref!.split('/').pop()!

  const staff = await browser.newContext()
  const guardPage = await staff.newPage()
  await loginStaff(guardPage)

  await guardPage.getByPlaceholder(/Busca por nombre/).fill('Nicolás')
  await expect(guardPage.getByText('Nicolás Herrera')).toBeVisible()
  await expect(
    guardPage.getByText('nicolas.herrera@example.com'),
  ).toHaveCount(0)

  await guardPage.getByRole('button', { name: 'Marcar entrada' }).click()
  await expect(
    guardPage.getByText('Entrada registrada para Nicolás Herrera.'),
  ).toBeVisible()
  await expect(guardPage.getByText('Ya dentro')).toBeVisible()

  const forbidden = await guardPage.request.get(
    `/api/events/${eventId}/export`,
  )
  expect(forbidden.status()).toBe(403)

  await ownerPage.goto(`/dashboard/events/${eventId}`)
  await expect(ownerPage.getByText('Nicolás Herrera').first()).toBeVisible({
    timeout: 15_000,
  })

  await organizer.close()
  await staff.close()
})

test('the coordinator permission reveals guest contact data', async ({
  page,
}) => {
  await loginStaff(page, 'STF-COORD01')
  await page.getByPlaceholder(/Busca por nombre/).fill('Lucía')
  await expect(page.getByText('Lucía Fernández')).toBeVisible()
  await expect(page.getByText('lucia.fernandez@example.com')).toBeVisible()
})
