import type { Request, Response } from 'express';
import { productRepository } from '../repositories/product.repository.js';
import { productFilterSchema } from '@handycraft/shared';
import { ok } from '../lib/response.js';
import { AppError } from '../lib/AppError.js';

export const productController = {
  /** GET /products */
  async list(req: Request, res: Response): Promise<void> {
    const filters = productFilterSchema.parse(req.query);
    const result = await productRepository.findMany(filters);
    ok(res, result);
  },

  /** GET /products/featured */
  async featured(req: Request, res: Response): Promise<void> {
    const items = await productRepository.findFeatured();
    ok(res, items);
  },

  /** GET /products/new-arrivals */
  async newArrivals(req: Request, res: Response): Promise<void> {
    const items = await productRepository.findNewArrivals();
    ok(res, items);
  },

  /** GET /products/ready-to-ship */
  async readyToShip(req: Request, res: Response): Promise<void> {
    const items = await productRepository.findReadyToShip();
    ok(res, items);
  },

  /** GET /products/:id */
  async detail(req: Request, res: Response): Promise<void> {
    const product = await productRepository.findById(req.params.id!);
    if (!product) throw new AppError('المنتج غير موجود', 404);
    ok(res, product);
  },
};
