import { expect, test, type Browser } from '@playwright/test'
import { loginStaff as loginStaffPage } from './helpers'

async function loginStaff(browser: Browser, code: string) {
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginStaffPage(page, code)
  return { context, page }
}

test('kitchen and door roles see their own schedule', async ({ browser }) => {
  const cook = await loginStaff(browser, 'STF-COOK01')
  await expect(
    cook.page.getByRole('heading', { name: 'Tu cronograma' }),
  ).toBeVisible()
  await expect(
    cook.page.getByText('Cocina: puesta a punto'),
  ).toBeVisible()

  const markDone = cook.page.getByRole('button', { name: 'Marcar hecha' })
  if ((await markDone.count()) > 0) {
    await markDone.first().click()
    await expect(cook.page.getByText('Hecha').first()).toBeVisible()
  } else {
    await expect(cook.page.getByText('Hecha').first()).toBeVisible()
  }
  await cook.context.close()

  const guard = await loginStaff(browser, 'STF-GUARD01')
  await expect(
    guard.page.getByRole('heading', { name: 'Control de acceso' }),
  ).toBeVisible()
  await expect(guard.page.getByText('Mi cronograma')).toBeVisible()
  await expect(guard.page.getByText('Apertura de puertas')).toBeVisible()
  await guard.context.close()
})
