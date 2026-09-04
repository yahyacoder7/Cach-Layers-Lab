# Prisma in NestJS — PrismaModule & PrismaService Explained

This file lives next to `src/prisma/` and explains why we created it and how it works.

---

## 1. The Problem (before this folder existed)

Your NestJS app had **no connection to Postgres**:

- The `ProductsController` existed, but the service returned placeholder strings like
  `'This action returns all products'`.
- The DB had real data (seeded), but the app couldn't read it.
- There was nothing telling NestJS "talk to the database through Prisma."

So we needed a **bridge** between NestJS and Prisma.

---

## 2. The Solution (what this folder adds)

We created a **PrismaService** (wraps the Prisma Client) and a **PrismaModule**
(makes that service available everywhere). Now any service in the app can just
inject `PrismaService` and run queries like `this.prisma.product.findMany()`.

```
NestJS Service ──injects──> PrismaService ──uses──> Prisma Client ──> Postgres
```

---

## 3. What each file does (file by file)

### `src/prisma/prisma.service.ts`

```ts
import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Global()
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.get<string>('DATABASE_URL'),
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Line by line:**

| Line | What it does | Why |
|------|--------------|-----|
| `extends PrismaClient` | inherits ALL Prisma methods (`findMany`, `create`, ...) | so `this.prisma.product...` works directly |
| `new PrismaPg({...})` | creates the Postgres driver adapter | Prisma v7 requires an adapter (no auto URL anymore) |
| `connectionString: config.get('DATABASE_URL')` | reads the DB URL from `.env` | no hard-coded secrets in code |
| `super({ adapter })` | passes the adapter to Prisma's constructor | this is how the client actually connects |
| `onModuleInit() { $connect() }` | opens the DB connection when the app starts | fail early if DB is unreachable |
| `onModuleDestroy() { $disconnect() }` | closes the connection on shutdown | clean release of resources |

**Why `super()` must come first (the bug we hit):**
In a child class, TypeScript forces `super()` to run before you touch `this`.
So we build the adapter **inside** the `super({...})` call and use the plain
`config` parameter (not `this.config`). Doing it the other way caused:
`'super' must be called before accessing 'this'`.

**Why the import order matters:**
`ConfigService` comes from `@nestjs/config`. We had to import it explicitly —
forgetting it caused "Cannot find name 'ConfigService'".

### `src/prisma/prisma.module.ts`

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

| Line | What it does | Why |
|------|--------------|-----|
| `@Global()` | no module needs to import PrismaModule | any service can use PrismaService anywhere |
| `providers: [PrismaService]` | tells NestJS "create this service" | makes it injectable |
| `exports: [PrismaService]` | lets OTHER modules use it | without exports, it stays private to this module |

**In plain words:** `@Global` + `exports` = "every module in the app can ask for PrismaService."

---

## 4. Where it is registered — `src/app.module.ts`

```ts
imports: [ConfigModule.forRoot(), PrismaModule, ProductsModule, RedisModule],
```

- `ConfigModule.forRoot()` loads `.env` **before** PrismaService reads `DATABASE_URL`.
- `PrismaModule` is loaded so PrismaService exists app-wide.
- Order matters: config first (so env vars exist), then Prisma.

---

## 5. How you use it from now on (one injection away)

In ANY service (e.g. `ProductsService`), just:

```ts
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.product.findMany();   // real data, not a string!
  }
}
```

No imports of `PrismaModule` needed because it's `@Global`.

---

## 6. Common pitfalls to remember

| Pitfall | Result | Avoid by |
|---------|--------|----------|
| Forgetting to import `ConfigService` | compile error | add `import { ConfigService } from '@nestjs/config'` |
| Using `this.config` before `super()` | compile error | build the adapter inside `super({...})`, use plain `config` |
| Missing `@Global()` on module | other modules can't inject the service | keep `@Global()` |
| Missing `exports` | service not visible outside module | keep `exports: [PrismaService]` |
| Forgetting `ConfigModule.forRoot()` | `DATABASE_URL` is undefined | keep it first in `AppModule` imports |

---

## 7. Quick summary

- **PrismaModule** = the box that provides PrismaService everywhere (`@Global` + `exports`).
- **PrismaService** = the actual database client (wrapped PrismaClient + pg adapter + lifecycle hooks).
- Together they give any NestJS service the ability to run real database queries.
- The bugs we fixed were: missing `ConfigService` import, and `super()` ordering.

After this, the app can finally talk to Postgres and real CRUD APIs are possible.