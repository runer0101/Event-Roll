import { test } from '@playwright/test'
import { eventHref, loginOrganizer, loginStaff } from './helpers'

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
  // Let the template's 450 ms page-enter fade finish before capturing.
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/dashboard.png',
    fullPage: true,
  })

  const eventLink = await eventHref(page, 'Sunset Fest 2026')
  await page.goto(eventLink)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/live.png',
    fullPage: true,
  })

  await page.goto(`${eventLink}/guests`)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/guests.png',
    fullPage: true,
  })

  await page.goto(`${eventLink}/tables`)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/tables.png',
    fullPage: true,
  })

  await page.goto(`${eventLink}/schedule`)
  await page.waitForTimeout(600)
  await page.screenshot({
    path: 'docs/screenshots/schedule.png',
    fullPage: true,
  })

  await page.goto(`${eventLink}/staff`)
  await page.waitForTimeout(600)
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
