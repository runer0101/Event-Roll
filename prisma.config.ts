import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // process.env instead of prisma's env(): env() throws when the variable is
  // missing, which would break `prisma generate` on a fresh clone (postinstall
  // runs before .env exists). Migrate commands still require DATABASE_URL.
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
