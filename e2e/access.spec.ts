import { expect, test } from '@playwright/test'
import { eventHref, loginOrganizer, loginStaff } from './helpers'

test('a guard checks a guest in and the organizer sees it live', async ({
  browser,
}) => {
  const organizer = await browser.newContext()
  const ownerPage = await organizer.newPage()
  await loginOrganizer(ownerPage)

  const eventLink = await eventHref(ownerPage, 'Sunset Fest 2026')
  const eventId = eventLink.split('/').pop()!

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

test('a coordinator cannot export another event from the same organization', async ({
  browser,
}) => {
  const organizer = await browser.newContext()
  const ownerPage = await organizer.newPage()
  await loginOrganizer(ownerPage)

  const dinnerHref = await eventHref(ownerPage, 'Cena privada · La Terraza')
  const sunsetHref = await eventHref(ownerPage, 'Sunset Fest 2026')
  const dinnerId = dinnerHref.split('/').pop()!
  const sunsetId = sunsetHref.split('/').pop()!

  const staff = await browser.newContext()
  const coordinatorPage = await staff.newPage()
  await loginStaff(coordinatorPage, 'STF-COORD01')

  const forbidden = await coordinatorPage.request.get(
    `/api/events/${dinnerId}/export`,
  )
  expect(forbidden.status()).toBe(403)

  const allowed = await coordinatorPage.request.get(
    `/api/events/${sunsetId}/export`,
  )
  expect(allowed.status()).toBe(200)

  await organizer.close()
  await staff.close()
})
