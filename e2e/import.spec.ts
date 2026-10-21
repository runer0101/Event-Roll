import { expect, test, type Page } from '@playwright/test'

async function loginOrganizer(page: Page) {
  await page.goto('/login')
  await page.waitForTimeout(500)
  await page.fill('#email', 'demo@event-roll.dev')
  await page.fill('#password', 'event-roll-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/dashboard')
}

test('the organizer imports a CSV list and creates an event', async ({
  page,
}) => {
  const stamp = Date.now()
  const first = `Invitado ${stamp}`
  const second = `Acompañante ${stamp}`

  await loginOrganizer(page)
  const eventHref = await page
    .getByRole('link', { name: 'Abrir panel' })
    .nth(1)
    .getAttribute('href')
  await page.goto(`${eventHref}/guests`)

  const csv = [
    'nombre,email,categoria,acompanantes,mesa',
    `${first},first${stamp}@example.com,VIP,1,Mesa 1`,
    `${second},second${stamp}@example.com,General,0,Mesa 2`,
  ].join('\n')

  await page.getByRole('button', { name: 'Importar Excel/CSV' }).click()
  await page.locator('input[type=file]').setInputFiles({
    name: 'invitados.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv),
  })
  await expect(page.getByText('2 filas listas de 2')).toBeVisible()
  await page.getByRole('button', { name: 'Importar 2 invitados' }).click()
  await expect(page.getByText(/2 invitados importados/)).toBeVisible()
  await page.getByRole('button', { name: 'Cancelar' }).click()

  await page.fill('input[name="q"]', first)
  await page.getByRole('button', { name: 'Filtrar' }).click()
  await expect(page.getByText(first)).toBeVisible()

  await page.goto('/dashboard/events/new')
  await page.fill('#name', `Evento ${stamp}`)
  await page.fill('#date', '2027-12-31T20:00')
  await page.fill('#location', 'Sala de pruebas')
  await page.getByRole('button', { name: 'Crear evento' }).click()
  await page.waitForURL('**/dashboard/events/**')
  await expect(
    page.getByRole('heading', { name: `Evento ${stamp}` }),
  ).toBeVisible()
})
