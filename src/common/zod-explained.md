# Zod Validation in NestJS — Learn How It Works

A complete walkthrough of the Zod setup in this project: the **DTOs** (`src/products/dto/`)
and the **pipe** (`src/common/pipes/`). Read in order — each section builds on the last.

---

## 1. What is Zod, and why are we using it?

Zod is a **schema library**. You write a *schema* that describes what data is allowed,
and Zod validates incoming data against it. If the data doesn't match, Zod tells you exactly
what's wrong.

**Why not class-validator?**
- class-validator uses decorators on classes and needs `class-transformer` to work in NestJS.
- Zod gives you the **TypeScript type for free** using `z.infer` — no double-writing types.

---

## 2. The building block: `z.object({...})`

Look at `create-product.dto.ts` line 3:

```ts
export const createProductSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  ...
});
```

- `z.object({...})` = "the data must be an **object** with these fields."
- Each field inside describes **one rule** for that property.
- Reading it out loud: _"name must be a string with at least 2 characters, price must be a positive number..."_

### The flow in your head when you write a field
```
z.<type>().<rule1>().<rule2>().<optional>
   │          │          │          └─ optional? nullable? default?
   │          │          └─ more constraints (min/max/positive...)
   │          └─ constraints (min length, regex, int...)
   └─ base type (string, number, boolean...)
```

---

## 3. Reading the create schema, field by field

```ts
name: z.string().min(2, 'Message'),
```
`string` base → `min(2)` = at least 2 chars → optional custom error message.

```ts
slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
```
`string` → `min(2)` → `regex(...)` = must match the pattern (lowercase letters, numbers, dashes).

```ts
description: z.string().optional(),
```
`string` → `.optional()` = the field may be **absent** (like a no-description product).

```ts
price: z.number().positive().multipleOf(0.01),
```
`number` → `positive()` → `multipleOf(0.01)` = max 2 decimal places (cents). Money rule.

```ts
compareAtPrice: z.number().positive().multipleOf(0.01).optional(),
```
Same as price, but **optional** (not every product has an "old price").

```ts
stock: z.number().int().nonnegative().default(0),
```
`number` → `int()` (whole number) → `nonnegative()` (0 or more) → `.default(0)` = if the client omits it, use 0.

```ts
categoryId: z.number().int().positive(),
```
Positive whole number — must point to a real category.

```ts
imageUrl: z.string().url().optional(),
```
`string` → `url()` = must be a valid link → optional.

---

## 4. The most important trick: `z.infer`

One schema gives you everything:

```ts
export const createProductSchema = z.object({...});   // runtime validation object
export type CreateProductDto = z.infer<typeof createProductSchema>;  // TS type
```

- `z.infer<typeof schema>` **converts the schema into a TypeScript type** automatically.
- So you write the rules **once**, and TypeScript knows what `createProductDto.name` is, etc.
- That's the "write once, get a type free" magic.

---

## 5. Reuse without repeating: `.partial()`

`update-product.dto.ts`:

```ts
export const updateProductSchema = createProductSchema.partial();
```

- `.partial()` = make **every field optional**.
- Perfect for PATCH (update: client may send some or all fields).
- Fully **reuses** the create schema — no copy-pasting 15 rules.

---

## 6. The pipe: how NestJS actually validates

A NestJS **pipe** runs on incoming data *before* your controller method. This one takes a
Zod schema and validates with it. `src/common/pipes/zod-validation.pipe.ts`:

```ts
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);            // 1. validate + return clean data
    } catch (error) {
      if (error instanceof ZodError) {            // 2. validation failed
        throw new BadRequestException(
          error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        );
      }
      throw error;                                // 3. not a zod error -> rethrow
    }
  }
}
```

**Line by line:**

| Line | What it does |
|------|--------------|
| `implements PipeTransform` | NestJS promise: I have a `transform()` method |
| `transform(value: unknown)` | NestJS hands us the raw incoming body |
| `this.schema.parse(value)` | **validates** value against the schema; returns CLEAN data |
| `error.issues.map(...)` | Zod lists every problem; we format each as `field.path: message` |
| `throw new BadRequestException(...)` | NestJS returns **400 Bad Request** with the messages |

**Why `parse` and not `safeParse`?**
- `parse()` throws on failure → the pipe catches it → 400.
- `safeParse()` returns `{ success, data/error }` instead of throwing. Both are valid;
  `parse` + try/catch is the cleaner style here.

---

## 7. How the pipe is attached in the controller

`products.controller.ts`:

```ts
@Post()
create(
  @Body(new ZodValidationPipe(createProductSchema))
  createProductDto: CreateProductDto,
) {
  return this.productsService.create(createProductDto);
}
```

Flow:
1. Request hits `POST /products`.
2. `@Body(...)` hands the raw body to `new ZodValidationPipe(createProductSchema)`.
3. Pipe validates with the schema → returns clean data (or throws 400).
4. Clean data arrives in `createProductDto`, typed as `CreateProductDto`.
5. Service runs with **guaranteed-valid** data.

**The pipe is generic** — same pipe, different schema per endpoint. Write it once, reuse everywhere.

---

## 8. Clean-syntax cheat sheet (copy these)

```ts
// strings
z.string()
z.string().min(2)
z.string().min(2).max(100)
z.string().email()
z.string().url()
z.string().regex(/^[a-z0-9-]+$/)

// numbers
z.number()
z.number().int()            // whole numbers
z.number().positive()       // > 0
z.number().nonnegative()    // >= 0
z.number().multipleOf(0.01) // 2 decimals
z.number().min(0).max(100)

// end-of-chain modifiers
.optional()   // field may be absent
.nullable()   // field may be null
.default(0)   // use this value if absent
.nullish()    // absent OR null allowed

// other types
z.boolean()
z.date()
z.array(z.string())         // array of strings
z.enum(['EDGE', 'DOWNSTREAM', 'UPSTREAM'])   // pick one of these

// combining
z.object({...})              // an object
z.union([aSchema, bSchema])  // either this or that
```

---

## 9. Building your own schema, step by step (recipe)

1. Ask: **what type?** → `z.string()` / `z.number()` / `z.boolean()` / `z.object({...})`
2. Chain **rules** in sequence: `.min()`, `.positive()`, `.regex()`, `.url()`...
3. End with a **modifier**: `.optional()`, `.default(x)`, `.nullable()`
4. Wrap object fields in `z.object({ ... })`
5. Export the **schema** (`createWhateverSchema`) and the **type** (`z.infer<...>D`to)
6. For partial updates: `baseSchema.partial()`

---

## 10. Common mistakes & how to avoid them

| Mistake | Problem | Fix |
|---------|---------|-----|
| Rules after `.optional()` | doesn't work — optional must be **last** | put `.optional()` at the end |
| Forgetting `z.number().int()` for `id`/stock | floats pass validation | add `.int()` |
| `multipleOf(0.1)` for money | float rounding issues | use `multipleOf(0.01)` |
| Not using custom messages | generic English errors | add the message arg: `.min(2, 'Your message')` |
| Importing the type without `import type` | isolatedModules build error | `import type { CreateProductDto }` |
| No pipe on the route | validation never runs | add `new ZodValidationPipe(schema)` to `@Body()` |

---

## 11. Summary — the 5 things to remember

1. **Schema = rule object** (`z.object({ fields })`), written once.
2. **Chain** base type → rules → modifier. `optional()` is always last.
3. **`z.infer` gives the type free** — never hand-write the DTO type.
4. **`.partial()`** reuses a base schema for updates.
5. **The pipe is generic** — `new ZodValidationPipe(schema)` per route, written once in `src/common/pipes/`.