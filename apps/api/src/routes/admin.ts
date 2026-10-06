import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  bannerSchema,
  categorySchema,
  rejectWithReasonSchema,
  resolveDisputeSchema,
  storeBadgeSchema,
  updateBannerSchema,
  updateCategorySchema,
} from '@handycraft/shared';
import { adminController } from '../controllers/admin.controller.js';

type Handler = (req: Request, res: Response) => Promise<void>;
const h = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/kpis', h(adminController.kpis));
router.get('/reports', h(adminController.reports));

router.get('/verifications', h(adminController.verifications));
router.post('/verifications/:id/approve', h(adminController.approveVerification));
router.post('/verifications/:id/reject', validate(rejectWithReasonSchema), h(adminController.rejectVerification));

router.get('/products', h(adminController.products));
router.post('/products/:id/approve', h(adminController.approveProduct));
router.post('/products/:id/reject', validate(rejectWithReasonSchema), h(adminController.rejectProduct));

router.get('/disputes', h(adminController.disputes));
router.get('/disputes/:id', h(adminController.dispute));
router.post('/disputes/:id/review', h(adminController.reviewDispute));
router.post('/disputes/:id/resolve', validate(resolveDisputeSchema), h(adminController.resolveDispute));

router.get('/settlements', h(adminController.settlements));
router.post('/withdrawals/:id/paid', h(adminController.markWithdrawalPaid));
router.post('/withdrawals/:id/reject', validate(rejectWithReasonSchema), h(adminController.rejectWithdrawal));

router.get('/banners', h(adminController.banners));
router.post('/banners', validate(bannerSchema), h(adminController.createBanner));
router.patch('/banners/:id', validate(updateBannerSchema), h(adminController.updateBanner));
router.delete('/banners/:id', h(adminController.deleteBanner));

router.post('/categories', validate(categorySchema), h(adminController.createCategory));
router.patch('/categories/:id', validate(updateCategorySchema), h(adminController.updateCategory));
router.delete('/categories/:id', h(adminController.deleteCategory));

router.get('/stores', h(adminController.stores));
router.patch('/stores/:id/badge', validate(storeBadgeSchema), h(adminController.setStoreBadge));

export default router;
