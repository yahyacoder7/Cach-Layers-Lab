# Prisma Integration Guide (v7) — NestJS + Docker PostgreSQL

> Step-by-step to install Prisma v7 and link it to the running Docker Postgres
> container (`cache-postgres`). No app code / models yet — just getting Prisma
> installed, configured, generated, and connected.

---

## 0. Prerequisites (already done in this project)

- Docker Postgres running: `cache-postgres` on `localhost:5432`
  - user: `your_user`
  - password: `your_password`
  - database: `your_db`
- Node.js v24.8 (Prisma v7 needs Node 20.19+)

---

## 1. Install packages

```bash
npm install prisma @prisma/client @prisma/adapter-pg pg dotenv
```

| Package | Why |
|---------|-----|
| `prisma` | The CLI (generate, migrate, ...) |
| `@prisma/client` | The client shell package |
| `@prisma/adapter-pg` | v7 driver adapter for PostgreSQL |
| `pg` | The underlying PostgreSQL driver |
| `dotenv` | v7 does NOT auto-load `.env`; we load it explicitly |

---

## 2. Create `prisma/schema.prisma`

Generator + datasource only (**no models yet** — they come later).

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../generated/prisma"
  moduleFormat = "cjs"   // matches this project's tsconfig (nodenext)
}

datasource db {
  provider = "postgresql"
  // NOTE: URL is NOT here in v7 — it lives in prisma.config.ts
}
```

---

## 3. Create `prisma.config.ts` (project root)

v7 central config file + explicit env loading.

```ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
```

---

## 4. Create `.env`

Point at the running Docker Postgres container.

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/your_db"
```

---

## 5. Update `.gitignore`

Add the generated client so it's not committed:

```
/generated/prisma
```

---

## 6. Generate + verify the connection

```bash
npx prisma generate
```

This reads `schema.prisma` and builds the type-safe client into `generated/prisma/`.

To confirm the DB link works (no models yet, so the migration is empty but proves connectivity):

```bash
npx prisma migrate dev --name init
```

Or a lighter check:

```bash
npx prisma migrate status
```

---

## 7. Verify the build still passes

```bash
npm run build
```

---

## What's next (deferred)

- Design the `Product` model (and any relations) in `schema.prisma`
- Re-run `npx prisma generate` + `npx prisma migrate dev` after any schema change
- Create a NestJS `PrismaService` / `PrismaModule` (using `@prisma/adapter-pg`)
- Refactor `ProductsService` to real DB CRUD
