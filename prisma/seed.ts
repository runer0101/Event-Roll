import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

const DEMO_EMAIL = 'demo@event-roll.dev'
const DEMO_PASSWORD = 'event-roll-demo'

const names = [
  'Lucía Fernández',
  'Mateo Ríos',
  'Ana Vega',
  'Sofía Torres',
  'Diego Salazar',
  'Carla Méndez',
  'Javier Ortiz',
  'Valentina Cruz',
  'Andrés Molina',
  'Paula Navarro',
  'Martín Castro',
  'Elena Rojas',
  'Nicolás Herrera',
  'Mariana Paredes',
  'Sebastián Gil',
  'Camila Duarte',
  'Alejandro Peña',
  'Daniela Soto',
  'Gabriel Luna',
  'Isabella Romero',
  'Tomás Aguilar',
  'Renata Vargas',
  'Emiliano Reyes',
  'Julieta Medina',
  'Bruno Cabrera',
  'Martina Silva',
  'Lucas Fuentes',
  'Victoria Campos',
  'Santiago León',
  'Florencia Vidal',
  'Benjamín Núñez',
  'Antonia Rivera',
  'Joaquín Bravo',
  'Micaela Santos',
  'Facundo Rivas',
  'Constanza Ferrer',
  'Rodrigo Ponce',
  'Amanda Solís',
  'Iker Montoya',
  'Noa Delgado',
]

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

function guestData(index: number) {
  const name = names[index % names.length]!
  const category =
    index < 10 ? 'VIP' : index % 9 === 0 ? 'Prensa' : 'General'
  return {
    name,
    email: `${slug(name)}@example.com`,
    phone: `+34 600 ${String(100000 + index)}`,
    category,
    plusOnes: index % 6 === 0 ? 1 : index % 11 === 0 ? 2 : 0,
    table: `Mesa ${(index % 8) + 1}`,
    notes: index % 13 === 0 ? 'Alergia a frutos secos' : null,
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: 'Demo Organizer', passwordHash },
    create: {
      name: 'Demo Organizer',
      email: DEMO_EMAIL,
      passwordHash,
    },
  })

  const organization = await prisma.organization.upsert({
    where: { ownerId: user.id },
    update: { name: 'Event-Roll Demo' },
    create: { name: 'Event-Roll Demo', ownerId: user.id },
  })

  // The seed is the source of truth for the demo: recreate its events.
  await prisma.event.deleteMany({ where: { organizationId: organization.id } })

  const sunset = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: 'Sunset Fest 2026',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      location: 'Plaza Mayor, Ciudad Demo',
      description:
        'Festival de música en vivo con bandas locales, food trucks y zona VIP.',
    },
  })

  const dinner = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: 'Cena privada · La Terraza',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      location: 'La Terraza, Ciudad Demo',
      description: 'Cena de gala para clientes e invitados especiales.',
    },
  })

  const guard = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-GUARD01',
      name: 'Guardia Principal',
    },
  })

  await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-COORD01',
      name: 'Coordinadora de puerta',
      canViewContact: true,
      canEditGuests: true,
      canExport: true,
      canUndoCheckIn: true,
      canViewStats: true,
    },
  })

  await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: dinner.id,
      code: 'STF-DINNER1',
      name: 'Guardia · Cena privada',
      canViewContact: true,
    },
  })

  await prisma.guest.createMany({
    data: names.map((_, index) => ({
      organizationId: organization.id,
      eventId: sunset.id,
      code: `INV-DEMO-${String(index + 1).padStart(4, '0')}`,
      ...guestData(index),
    })),
  })

  await prisma.guest.createMany({
    data: Array.from({ length: 15 }, (_, index) => ({
      organizationId: organization.id,
      eventId: dinner.id,
      code: `INV-DINNER-${String(index + 1).padStart(4, '0')}`,
      ...guestData(index + 4),
    })),
  })

  const sunsetGuests = await prisma.guest.findMany({
    where: { eventId: sunset.id },
    orderBy: { code: 'asc' },
    take: 12,
  })

  for (const [index, guest] of sunsetGuests.entries()) {
    const checkedInAt = new Date(Date.now() - (12 - index) * 2 * 60 * 1000)
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt,
        checkedInById: guard.id,
      },
    })
    await prisma.accessLog.create({
      data: {
        organizationId: organization.id,
        eventId: sunset.id,
        guestId: guest.id,
        staffId: guard.id,
        action: 'CHECK_IN',
        createdAt: checkedInAt,
      },
    })
  }

  const dinnerGuests = await prisma.guest.findMany({
    where: { eventId: dinner.id },
    orderBy: { code: 'asc' },
    take: 4,
  })
  const dinnerStaff = await prisma.staff.findFirst({
    where: { eventId: dinner.id },
  })

  for (const [index, guest] of dinnerGuests.entries()) {
    const checkedInAt = new Date(Date.now() - (4 - index) * 3 * 60 * 1000)
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt,
        checkedInById: dinnerStaff?.id ?? null,
      },
    })
    await prisma.accessLog.create({
      data: {
        organizationId: organization.id,
        eventId: dinner.id,
        guestId: guest.id,
        staffId: dinnerStaff?.id ?? null,
        action: 'CHECK_IN',
        createdAt: checkedInAt,
      },
    })
  }

  console.log('Seed completed.')
  console.log(`  Organizer login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  console.log('  Event: Sunset Fest 2026')
  console.log('  Guard code:     STF-GUARD01')
  console.log('  Coordinator:    STF-COORD01')
  console.log('  Dinner guard:   STF-DINNER1')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
