import { z } from 'zod';

export const addressSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صحيح'),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  street: z.string().min(5, 'العنوان يجب ألا يقل عن 5 أحرف'),
  apartment: z.string().optional(),
});

export const createOrderSchema = z.object({
  storeId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().min(1),
        customization: z.record(z.unknown()).optional(),
      })
    )
    .min(1, 'يجب إضافة منتج واحد على الأقل'),
  paymentMethod: z.enum(['cod', 'electronic']),
  address: addressSchema,
  notes: z.string().max(500).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const shippingQuoteQuerySchema = z.object({
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
});

export const confirmCodOtpSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'رمز التأكيد يجب أن يكون 4 أرقام'),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'التقييم من 1 إلى 5').max(5, 'التقييم من 1 إلى 5'),
  comment: z.string().max(1000).optional(),
  images: z.array(z.string()).max(5).optional(),
});

export type ConfirmCodOtpInput = z.infer<typeof confirmCodOtpSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
