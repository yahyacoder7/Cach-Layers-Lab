import { z } from 'zod'


export const productQuerySchema = z.object({
    cursor: z.coerce.number().int().nonnegative().optional().default(0),
    limit: z.coerce.number().int().positive().default(10)
})
export type ProductQueryDto = z.infer<typeof productQuerySchema> 