import { z } from 'zod';

export const createCustomOrderSchema = z.object({
  productId: z.string().uuid(),
  details: z
    .string()
    .min(10, 'اكتب تفاصيل التخصيص (10 أحرف على الأقل)')
    .max(2000),
});

export const quoteCustomOrderSchema = z.object({
  quotedPrice: z.number().positive('السعر يجب أن يكون أكبر من الصفر'),
  quotedDays: z.number().int().min(1, 'مدة التنفيذ يوم واحد على الأقل').max(180),
  sellerNote: z.string().max(1000).optional(),
});

export type CreateCustomOrderInput = z.infer<typeof createCustomOrderSchema>;
export type QuoteCustomOrderInput = z.infer<typeof quoteCustomOrderSchema>;
