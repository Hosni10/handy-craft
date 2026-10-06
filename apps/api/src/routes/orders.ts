import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createOrderSchema,
  confirmCodOtpSchema,
  createReviewSchema,
  shippingQuoteQuerySchema,
  openDisputeSchema,
} from '@handycraft/shared';
import { orderController } from '../controllers/order.controller.js';
import { disputeController } from '../controllers/dispute.controller.js';

const router = Router();

router.use(authenticate);

router.get(
  '/shipping-quote',
  validate(shippingQuoteQuerySchema, 'query'),
  (req, res, next) => {
    try {
      orderController.shippingQuote(req, res);
    } catch (e) {
      next(e);
    }
  }
);

router.post('/', validate(createOrderSchema), (req, res, next) =>
  orderController.create(req, res).catch(next)
);

router.get('/', (req, res, next) => orderController.list(req, res).catch(next));

router.get('/:id', (req, res, next) => orderController.detail(req, res).catch(next));

router.post('/:id/cod/resend', (req, res, next) =>
  orderController.resendCodOtp(req, res).catch(next)
);

router.post('/:id/cod/confirm', validate(confirmCodOtpSchema), (req, res, next) =>
  orderController.confirmCodOtp(req, res).catch(next)
);

router.post('/:id/review', validate(createReviewSchema), (req, res, next) =>
  orderController.createReview(req, res).catch(next)
);

router.post('/:id/dispute', validate(openDisputeSchema), (req, res, next) =>
  disputeController.open(req, res).catch(next)
);

export default router;
