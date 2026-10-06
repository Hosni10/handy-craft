import type { Request, Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { disputeService } from '../services/dispute.service.js';
import { ok, created } from '../lib/response.js';
import type { DisputeStatus, ProductStatus, StoreVerificationStatus } from '@prisma/client';

export const adminController = {
  async kpis(_req: Request, res: Response): Promise<void> {
    ok(res, await adminService.getKpis());
  },

  async reports(req: Request, res: Response): Promise<void> {
    const days = Math.min(365, Math.max(1, Number(req.query.days ?? 30)));
    ok(res, await adminService.getReports(days));
  },

  async verifications(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.listVerifications(req.query.status as StoreVerificationStatus | undefined));
  },

  async approveVerification(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.reviewVerification(req.params.id!, req.user!.sub, true));
  },

  async rejectVerification(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.reviewVerification(req.params.id!, req.user!.sub, false, req.body.reason));
  },

  async products(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.listProducts(req.query.status as ProductStatus | undefined));
  },

  async approveProduct(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.reviewProduct(req.params.id!, true));
  },

  async rejectProduct(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.reviewProduct(req.params.id!, false, req.body.reason));
  },

  async disputes(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.listAll(req.query.status as DisputeStatus | undefined));
  },

  async dispute(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.getDetail(req.params.id!, req.user!.sub, 'ADMIN'));
  },

  async reviewDispute(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.markUnderReview(req.params.id!));
  },

  async resolveDispute(req: Request, res: Response): Promise<void> {
    ok(res, await disputeService.resolve(req.params.id!, req.user!.sub, req.body));
  },

  async settlements(_req: Request, res: Response): Promise<void> {
    ok(res, await adminService.getSettlements());
  },

  async markWithdrawalPaid(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.markWithdrawalPaid(req.params.id!, req.user!.sub));
  },

  async rejectWithdrawal(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.rejectWithdrawal(req.params.id!, req.user!.sub, req.body.reason));
  },

  async banners(_req: Request, res: Response): Promise<void> {
    ok(res, await adminService.listBanners());
  },

  async createBanner(req: Request, res: Response): Promise<void> {
    created(res, await adminService.createBanner(req.body));
  },

  async updateBanner(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.updateBanner(req.params.id!, req.body));
  },

  async deleteBanner(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.deleteBanner(req.params.id!));
  },

  async createCategory(req: Request, res: Response): Promise<void> {
    created(res, await adminService.createCategory(req.body));
  },

  async updateCategory(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.updateCategory(req.params.id!, req.body));
  },

  async deleteCategory(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.deleteCategory(req.params.id!));
  },

  async stores(_req: Request, res: Response): Promise<void> {
    ok(res, await adminService.listStores());
  },

  async setStoreBadge(req: Request, res: Response): Promise<void> {
    ok(res, await adminService.setStoreBadge(req.params.id!, req.body));
  },
};
