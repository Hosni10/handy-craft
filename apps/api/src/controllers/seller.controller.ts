import type { Request, Response } from 'express';
import { sellerService } from '../services/seller.service.js';
import { storageService } from '../services/storage.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { ok, created } from '../lib/response.js';
import type { OrderStatus } from '@prisma/client';

export const sellerController = {
  async become(req: Request, res: Response): Promise<void> {
    const user = await sellerService.becomeSeller(req.user!.sub);
    ok(res, {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    });
  },

  async dashboard(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.getDashboard(req.user!.sub));
  },

  async createStore(req: Request, res: Response): Promise<void> {
    const store = await sellerService.createStore(req.user!.sub, req.body);
    created(res, store);
  },

  async updateStore(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.updateStore(req.user!.sub, req.body));
  },

  async submitVerification(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.submitVerification(req.user!.sub, req.body));
  },

  async upload(req: Request, res: Response): Promise<void> {
    const files = req.files as { buffer: Buffer; originalname: string; mimetype: string }[] | undefined;
    if (!files?.length) {
      ok(res, { urls: [] });
      return;
    }
    const urls: string[] = [];
    for (const file of files) {
      const url = await storageService.save({
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      });
      urls.push(url);
    }
    ok(res, { urls });
  },

  async listProducts(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)));
    ok(res, await sellerService.listProducts(req.user!.sub, page, pageSize));
  },

  async createProduct(req: Request, res: Response): Promise<void> {
    const product = await sellerService.createProduct(req.user!.sub, req.body);
    created(res, product);
  },

  async updateProduct(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.updateProduct(req.user!.sub, req.params.id!, req.body));
  },

  async deleteProduct(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.deleteProduct(req.user!.sub, req.params.id!));
  },

  async listOrders(req: Request, res: Response): Promise<void> {
    const status = req.query.status as OrderStatus | undefined;
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 20)));
    ok(res, await sellerService.listOrders(req.user!.sub, status, page, pageSize));
  },

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.updateOrderStatus(req.user!.sub, req.params.id!, req.body));
  },

  async requestPickup(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.requestPickup(req.user!.sub, req.params.id!));
  },

  async printLabel(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.printLabel(req.user!.sub, req.params.id!));
  },

  async earnings(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.getEarnings(req.user!.sub));
  },

  async createWithdrawal(req: Request, res: Response): Promise<void> {
    const row = await sellerService.createWithdrawal(req.user!.sub, req.body);
    created(res, row);
  },

  async listWithdrawals(req: Request, res: Response): Promise<void> {
    ok(res, await sellerService.listWithdrawals(req.user!.sub));
  },

  async refreshMe(req: Request, res: Response): Promise<void> {
    const user = await userRepository.findById(req.user!.sub);
    ok(res, user);
  },
};
