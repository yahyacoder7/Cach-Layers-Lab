import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase, numbers, or dashes'),
  sku: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive().multipleOf(0.01),
  compareAtPrice: z.number().positive().multipleOf(0.01).optional(),
  stock: z.number().int().nonnegative().default(0),
  categoryId: z.number().int().positive(),
  imageUrl: z.string().url().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;