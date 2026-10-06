import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createCustomOrderSchema, quoteCustomOrderSchema } from '@handycraft/shared';
import { customOrderController } from '../controllers/custom-order.controller.js';

const router = Router();
const sellerOnly = requireRole('SELLER', 'ADMIN');

router.use(authenticate);

// Buyer
router.post('/', validate(createCustomOrderSchema), (req, res, next) =>
  customOrderController.create(req, res).catch(next)
);
router.get('/mine', (req, res, next) => customOrderController.mine(req, res).catch(next));
router.post('/:id/accept', (req, res, next) => customOrderController.accept(req, res).catch(next));
router.post('/:id/decline', (req, res, next) => customOrderController.decline(req, res).catch(next));

// Seller
router.get('/inbox', sellerOnly, (req, res, next) => customOrderController.inbox(req, res).catch(next));
router.patch('/:id/quote', sellerOnly, validate(quoteCustomOrderSchema), (req, res, next) =>
  customOrderController.quote(req, res).catch(next)
);
router.post('/:id/reject', sellerOnly, (req, res, next) =>
  customOrderController.reject(req, res).catch(next)
);
router.post('/:id/complete', sellerOnly, (req, res, next) =>
  customOrderController.complete(req, res).catch(next)
);

export default router;
