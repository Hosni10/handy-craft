import type { Request, Response } from 'express';
import { disputeService } from '../services/dispute.service.js';
import { ok, created } from '../lib/response.js';

export const disputeController = {
  /** POST /orders/:id/dispute */
  async open(req: Request, res: Response): Promise<void> {
    created(res, await disputeService.open(req.user!.sub, req.params.id!, req.body));
  },

  async mine(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.listForUser(req.user!.sub));
  },

  async detail(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.getDetail(req.params.id!, req.user!.sub, req.user!.role));
  },

  async addMessage(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.addMessage(req.params.id!, req.user!.sub, req.user!.role, req.body));
  },
};
