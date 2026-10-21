import { test, type Page } from '@playwright/test'

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

test('captures the presentation screenshots', async ({ page, browser }) => {
  await page.goto('/')
  await page.screenshot({
    path: 'docs/screenshots/landing.png',
    fullPage: true,
  })

  await loginOrganizer(page)
  await page.screenshot({
    path: 'docs/screenshots/dashboard.png',
    fullPage: true,
  })

  const eventHref = await page
    .getByRole('link', { name: 'Abrir panel' })
    .nth(1)
    .getAttribute('href')
  await page.goto(eventHref!)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/live.png',
    fullPage: true,
  })

  await page.goto(`${eventHref}/guests`)
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'docs/screenshots/guests.png',
    fullPage: true,
  })

  await page.goto(`${eventHref}/staff`)
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'docs/screenshots/staff.png',
    fullPage: true,
  })

  const staff = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const guard = await staff.newPage()
  await loginStaff(guard)
  await guard.waitForTimeout(500)
  await guard.screenshot({
    path: 'docs/screenshots/guard.png',
    fullPage: true,
  })
  await staff.close()
})
