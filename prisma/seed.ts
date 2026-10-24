import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import { normalizeText } from '../src/lib/utils'

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

function futureDate(days: number, hour = 20): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date
}

function guestData(index: number) {
  const name = names[index % names.length]!
  const category =
    index < 10 ? 'VIP' : index % 9 === 0 ? 'Prensa' : 'General'
  return {
    name,
    searchName: normalizeText(name),
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
      date: futureDate(30, 20),
      location: 'Plaza Mayor, Ciudad Demo',
      description:
        'Festival de música en vivo con bandas locales, food trucks y zona VIP.',
    },
  })

  const dinner = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: 'Cena privada · La Terraza',
      date: futureDate(14, 20),
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
      role: 'GUARD',
      canCheckIn: true,
    },
  })

  const coordinator = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-COORD01',
      name: 'Coordinadora general',
      role: 'COORDINATOR',
      canCheckIn: true,
      canViewContact: true,
      canEditGuests: true,
      canExport: true,
      canUndoCheckIn: true,
      canViewStats: true,
    },
  })

  const cook = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-COOK01',
      name: 'Chef Principal',
      role: 'COOK',
      canCheckIn: false,
    },
  })

  const music = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-MUSIC1',
      name: 'DJ Luna',
      role: 'MUSIC',
      canCheckIn: false,
    },
  })

  const decor = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: sunset.id,
      code: 'STF-DECOR1',
      name: 'Equipo de decoración',
      role: 'DECOR',
      canCheckIn: false,
    },
  })

  const dinnerStaff = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: dinner.id,
      code: 'STF-DINNER1',
      name: 'Guardia · Cena privada',
      role: 'GUARD',
      canCheckIn: true,
      canViewContact: true,
    },
  })

  const dinnerCook = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: dinner.id,
      code: 'STF-DINCOOK',
      name: 'Cocina · Cena privada',
      role: 'COOK',
      canCheckIn: false,
    },
  })

  const dinnerMusic = await prisma.staff.create({
    data: {
      organizationId: organization.id,
      eventId: dinner.id,
      code: 'STF-DINMUS',
      name: 'Música · Cena privada',
      role: 'MUSIC',
      canCheckIn: false,
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
        guestName: guest.name,
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

  for (const [index, guest] of dinnerGuests.entries()) {
    const checkedInAt = new Date(Date.now() - (4 - index) * 3 * 60 * 1000)
    await prisma.guest.update({
      where: { id: guest.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt,
        checkedInById: dinnerStaff.id,
      },
    })
    await prisma.accessLog.create({
      data: {
        organizationId: organization.id,
        eventId: dinner.id,
        guestId: guest.id,
        guestName: guest.name,
        staffId: dinnerStaff.id,
        action: 'CHECK_IN',
        createdAt: checkedInAt,
      },
    })
  }

  const tableSpecs = [
    { name: 'Mesa 1', capacity: 8, occupied: 3 },
    { name: 'Mesa 2', capacity: 8, occupied: 5 },
    { name: 'Mesa 3', capacity: 8, occupied: 2 },
    { name: 'Mesa 4', capacity: 8, occupied: 6 },
    { name: 'Mesa 5', capacity: 8, occupied: 8 },
    { name: 'VIP', capacity: 6, occupied: 6 },
  ]

  await Promise.all(
    tableSpecs.map((table) =>
      prisma.eventTable.create({
        data: {
          organizationId: organization.id,
          eventId: sunset.id,
          name: table.name,
          capacity: table.capacity,
          chairs: {
            create: Array.from({ length: table.capacity }, (_, index) => ({
              organizationId: organization.id,
              eventId: sunset.id,
              number: index + 1,
              occupied: index < table.occupied,
            })),
          },
        },
      }),
    ),
  )

  await Promise.all(
    [
      { name: 'Mesa 1', capacity: 6, occupied: 2 },
      { name: 'Mesa 2', capacity: 6, occupied: 4 },
      { name: 'Mesa 3', capacity: 6, occupied: 6 },
      { name: 'Mesa 4', capacity: 6, occupied: 1 },
    ].map((table) =>
      prisma.eventTable.create({
        data: {
          organizationId: organization.id,
          eventId: dinner.id,
          name: table.name,
          capacity: table.capacity,
          chairs: {
            create: Array.from({ length: table.capacity }, (_, index) => ({
              organizationId: organization.id,
              eventId: dinner.id,
              number: index + 1,
              occupied: index < table.occupied,
            })),
          },
        },
      }),
    ),
  )

  const atSunset = (hours: number) =>
    new Date(sunset.date.getTime() + hours * 60 * 60 * 1000)
  const atDinner = (hours: number) =>
    new Date(dinner.date.getTime() + hours * 60 * 60 * 1000)

  await prisma.scheduleItem.createMany({
    data: [
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Montaje de mesas y decoración',
        description: 'Mesas, sillas, mantelería y señalización de la puerta.',
        startAt: atSunset(-4),
        status: 'DONE',
        assigneeId: decor.id,
      },
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Cocina: puesta a punto',
        description: 'Revisar menú, alergias y tiempos de servicio.',
        startAt: atSunset(-2),
        assigneeId: cook.id,
      },
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Apertura de puertas',
        description: 'Check-in con códigos de invitado.',
        startAt: atSunset(0),
        assigneeId: guard.id,
      },
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Servicio de cena',
        startAt: atSunset(1),
        assigneeId: cook.id,
      },
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Música en vivo',
        startAt: atSunset(2),
        assigneeId: music.id,
      },
      {
        organizationId: organization.id,
        eventId: sunset.id,
        title: 'Cierre y conteo final',
        description: 'Salida de invitados, inventario y reporte.',
        startAt: atSunset(4),
        assigneeId: coordinator.id,
      },
    ],
  })

  await prisma.scheduleItem.createMany({
    data: [
      {
        organizationId: organization.id,
        eventId: dinner.id,
        title: 'Montaje de la terraza',
        startAt: atDinner(-2),
        assigneeId: dinnerStaff.id,
      },
      {
        organizationId: organization.id,
        eventId: dinner.id,
        title: 'Servicio de cena',
        startAt: atDinner(0),
        assigneeId: dinnerCook.id,
      },
      {
        organizationId: organization.id,
        eventId: dinner.id,
        title: 'Música ambiental',
        startAt: atDinner(1),
        assigneeId: dinnerMusic.id,
      },
    ],
  })

  console.log('Seed completed.')
  console.log(`  Organizer login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  console.log('  Event: Sunset Fest 2026')
  console.log('  Guard code:     STF-GUARD01')
  console.log('  Coordinator:    STF-COORD01')
  console.log('  Cook code:      STF-COOK01')
  console.log('  Music code:     STF-MUSIC1')
  console.log('  Decor code:     STF-DECOR1')
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
