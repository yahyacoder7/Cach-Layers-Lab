import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional().default(""),
  sku: z.string().min(3),
  description: z.string().optional(),
  price: z.coerce.number().positive().multipleOf(0.01),
  compareAtPrice: z.coerce.number().positive().multipleOf(0.01).optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  categoryId: z.coerce.number().int().positive(),
  
  imageUrl: z.string().url().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;