import { z } from 'zod';

export const rejectWithReasonSchema = z.object({
  reason: z.string().min(3, 'سبب الرفض مطلوب').max(500),
});

export const resolveDisputeSchema = z.object({
  outcome: z.enum(['buyer', 'seller']),
  note: z.string().min(3, 'ملاحظة القرار مطلوبة').max(1000),
});

export const bannerSchema = z.object({
  title: z.string().min(2, 'العنوان مطلوب').max(120),
  image: z.string().min(1, 'الصورة مطلوبة'),
  link: z.string().max(300).optional().nullable(),
  position: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateBannerSchema = bannerSchema.partial();

export const categorySchema = z.object({
  nameAr: z.string().min(2, 'اسم التصنيف مطلوب').max(80),
  parentId: z.string().uuid().optional().nullable(),
  image: z.string().optional().nullable(),
});

export const updateCategorySchema = categorySchema.partial();

export const storeBadgeSchema = z.object({
  badgeStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']),
});

export type RejectWithReasonInput = z.infer<typeof rejectWithReasonSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type StoreBadgeInput = z.infer<typeof storeBadgeSchema>;
