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
  // Wait for hydration to install the reveal observer, then walk the page so
  // every section is visible in the full-page capture.
  await page.waitForFunction(() =>
    document.documentElement.classList.contains('reveal-ready'),
  )
  await page.waitForTimeout(600)
  await page.evaluate(async () => {
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    for (let y = 0; y < root.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 120))
    }

    window.scrollTo(0, 0)
    root.style.scrollBehavior = previous
  })
  await page.waitForTimeout(1400)
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

  await page.goto(`${eventHref}/tables`)
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'docs/screenshots/tables.png',
    fullPage: true,
  })

  await page.goto(`${eventHref}/schedule`)
  await page.waitForTimeout(400)
  await page.screenshot({
    path: 'docs/screenshots/schedule.png',
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

  const kitchen = await browser.newContext({
    viewport: { width: 390, height: 844 },
  })
  const cook = await kitchen.newPage()
  await loginStaff(cook, 'STF-COOK01')
  await cook.waitForTimeout(500)
  await cook.screenshot({
    path: 'docs/screenshots/staff-cook.png',
    fullPage: true,
  })
  await kitchen.close()
})
