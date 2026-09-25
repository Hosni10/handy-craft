import { z } from 'zod';

export const storeVerificationSchema = z.object({
  mediaUrls: z
    .array(z.string().min(1))
    .min(3, 'يجب رفع 3 صور على الأقل من الورشة')
    .max(5, '5 ملفات كحد أقصى'),
  note: z.string().max(500).optional(),
});

export const sellerOrderStatusSchema = z.object({
  status: z.enum(['confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refused']),
});

export const createWithdrawalSchema = z.object({
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من الصفر'),
  method: z.enum(['instapay', 'vodafone_cash', 'bank']),
  destination: z.string().min(3, 'بيانات التحويل مطلوبة').max(200),
});

export const sellerProductImagesSchema = z.object({
  images: z.array(z.string()).min(1, 'صورة واحدة على الأقل').max(8),
});

export type StoreVerificationInput = z.infer<typeof storeVerificationSchema>;
export type SellerOrderStatusInput = z.infer<typeof sellerOrderStatusSchema>;
export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
