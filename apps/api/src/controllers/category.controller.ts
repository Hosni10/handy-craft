import type { Request, Response } from 'express';
import { categoryRepository } from '../repositories/category.repository.js';
import { ok } from '../lib/response.js';
import { AppError } from '../lib/AppError.js';

export const categoryController = {
  /** GET /categories */
  async list(_req: Request, res: Response): Promise<void> {
    const categories = await categoryRepository.findRootsWithChildren();
    ok(res, categories);
  },

  /** GET /categories/:id */
  async detail(req: Request, res: Response): Promise<void> {
    const category = await categoryRepository.findById(req.params.id!);
    if (!category) throw new AppError('التصنيف غير موجود', 404);
    ok(res, category);
  },
};
