import type { Request, Response } from 'express';
import { storeRepository } from '../repositories/store.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { productFilterSchema } from '@craftsouq/shared';
import { orderService } from '../services/order.service.js';
import { ok } from '../lib/response.js';
import { AppError } from '../lib/AppError.js';

export const storeController = {
  /** GET /stores/verified */
  async verified(_req: Request, res: Response): Promise<void> {
    const stores = await storeRepository.findVerified();
    ok(res, stores);
  },

  /** GET /stores/:id */
  async detail(req: Request, res: Response): Promise<void> {
    const store = await storeRepository.findById(req.params.id!);
    if (!store) throw new AppError('المتجر غير موجود', 404);
    ok(res, store);
  },

  /** GET /stores/:id/products */
  async products(req: Request, res: Response): Promise<void> {
    const filters = productFilterSchema.parse(req.query);
    // storeId is injected server-side, not from query — safe RBAC boundary
    const result = await (productRepository.findMany as (f: typeof filters & { storeId?: string }) => Promise<unknown>)({ ...filters, storeId: req.params.id });
    ok(res, result);
  },

  /** GET /stores/:id/reviews */
  async reviews(req: Request, res: Response): Promise<void> {
    const store = await storeRepository.findById(req.params.id!);
    if (!store) throw new AppError('المتجر غير موجود', 404);
    const reviews = await orderService.listStoreReviews(req.params.id!);
    ok(res, reviews);
  },
};
