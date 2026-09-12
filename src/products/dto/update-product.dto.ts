import { z } from 'zod';
import { createProductSchema } from './create-product.dto';

// .partial() → every create field becomes optional: PATCH can send 1 field or all.
// .omit()    → fields that must NEVER change after creation: sku and slug are
//              unique business keys — changing them breaks references / URL history.
//              (id comes from the URL param, not the body, so it's already safe.)
export const updateProductSchema = createProductSchema
  .partial()
  .omit({ slug: true, sku: true });

export type UpdateProductDto = z.infer<typeof updateProductSchema>;