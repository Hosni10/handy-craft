import { z } from 'zod';

export const openDisputeSchema = z.object({
  reason: z.string().min(10, 'اشرح المشكلة (10 أحرف على الأقل)').max(2000),
  evidence: z.array(z.string().min(1)).min(1, 'أرفق صورة واحدة على الأقل كدليل').max(5),
});

export const disputeMessageSchema = z.object({
  body: z.string().min(1, 'اكتب رسالة').max(2000),
  images: z.array(z.string().min(1)).max(5).optional(),
});

export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;
export type DisputeMessageInput = z.infer<typeof disputeMessageSchema>;
