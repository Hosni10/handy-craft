import { z } from 'zod';

export const createProductSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(3, 'اسم المنتج يجب ألا يقل عن 3 أحرف').max(120),
  description: z.string().min(10, 'الوصف يجب ألا يقل عن 10 أحرف'),
  materials: z.string().optional(),
  priceEgp: z.number().positive('السعر يجب أن يكون أكبر من الصفر'),
  stockQty: z.number().int().min(0),
  madeToOrder: z.boolean().default(false),
  productionDays: z.number().int().min(1).max(365).optional().nullable(),
  videoUrl: z.string().url().optional().nullable(),
  images: z.array(z.string().min(1)).min(1, 'صورة واحدة على الأقل').max(8),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  governorate: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  madeToOrder: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional().default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
