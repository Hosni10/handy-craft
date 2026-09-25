import type { Request, Response } from 'express';
import { orderService } from '../services/order.service.js';
import { ok } from '../lib/response.js';

export const orderController = {
  /** GET /orders/shipping-quote?governorate= */
  shippingQuote(req: Request, res: Response): void {
    const governorate = String(req.query.governorate ?? '');
    ok(res, orderService.getShippingQuote(governorate));
  },

  /** POST /orders */
  async create(req: Request, res: Response): Promise<void> {
    const result = await orderService.createOrder(req.user!.sub, req.body);
    ok(res, result, 201);
  },

  /** GET /orders */
  async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize ?? 10)));
    const result = await orderService.listBuyerOrders(req.user!.sub, page, pageSize);
    ok(res, result);
  },

  /** GET /orders/:id */
  async detail(req: Request, res: Response): Promise<void> {
    const order = await orderService.getBuyerOrder(req.user!.sub, req.params.id!);
    ok(res, order);
  },

  /** POST /orders/:id/cod/resend */
  async resendCodOtp(req: Request, res: Response): Promise<void> {
    const result = await orderService.resendCodOtp(req.user!.sub, req.params.id!);
    ok(res, result);
  },

  /** POST /orders/:id/cod/confirm */
  async confirmCodOtp(req: Request, res: Response): Promise<void> {
    const { code } = req.body as { code: string };
    const order = await orderService.confirmCodOtp(req.user!.sub, req.params.id!, code);
    ok(res, order);
  },

  /** POST /orders/:id/review */
  async createReview(req: Request, res: Response): Promise<void> {
    const review = await orderService.createReview(req.user!.sub, req.params.id!, req.body);
    ok(res, review, 201);
  },
};
