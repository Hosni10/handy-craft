import type { Request, Response } from 'express';
import { customOrderService } from '../services/custom-order.service.js';
import { ok, created } from '../lib/response.js';
import type { CustomOrderStatus } from '@prisma/client';

export const customOrderController = {
  async create(req: Request, res: Response): Promise<void> {
    created(res, await customOrderService.create(req.user!.sub, req.body));
  },

  async mine(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.listForBuyer(req.user!.sub));
  },

  async accept(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.accept(req.user!.sub, req.params.id!));
  },

  async decline(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.buyerDecline(req.user!.sub, req.params.id!));
  },

  async inbox(req: Request, res: Response): Promise<void> {
    const status = req.query.status as CustomOrderStatus | undefined;
    ok(res, await customOrderService.listForSeller(req.user!.sub, status));
  },

  async quote(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.quote(req.user!.sub, req.params.id!, req.body));
  },

  async reject(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.sellerReject(req.user!.sub, req.params.id!));
  },

  async complete(req: Request, res: Response): Promise<void> {
    ok(res, await customOrderService.complete(req.user!.sub, req.params.id!));
  },
};
