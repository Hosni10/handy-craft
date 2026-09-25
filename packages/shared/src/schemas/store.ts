import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, 'اسم المتجر يجب ألا يقل عن حرفين').max(80),
  bio: z.string().max(500).optional(),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  shippingZones: z.array(z.string()).min(1, 'يجب تحديد منطقة شحن واحدة على الأقل'),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
