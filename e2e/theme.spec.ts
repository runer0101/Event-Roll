import { expect, test } from '@playwright/test'

const THEME_STORAGE_KEY = 'event-roll-theme'

test('turns ink into paper by hand and remembers the choice', async ({
  page,
}) => {
  // Pin the system preference: the visitor arrives with ink and no stored choice.
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  const toLight = page.getByRole('button', { name: 'Cambiar a modo claro' })
  // The control is an icon, not a word: the label names the destination and
  // the glyph shows what a click will do.
  await expect(toLight.locator('svg.lucide-sun')).toBeVisible()
  await expect(toLight).toHaveText(/^\s*$/)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await toLight.click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  const toDark = page.getByRole('button', { name: 'Cambiar a modo oscuro' })
  await expect(toDark.locator('svg.lucide-moon')).toBeVisible()

  await page.reload()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(
    page
      .getByRole('button', { name: 'Cambiar a modo oscuro' })
      .locator('svg.lucide-moon'),
  ).toBeVisible()
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY),
  ).toBe('light')
})

test('follows the system while the visitor has chosen nothing', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(
    page
      .getByRole('button', { name: 'Cambiar a modo oscuro' })
      .locator('svg.lucide-moon'),
  ).toBeVisible()
})
