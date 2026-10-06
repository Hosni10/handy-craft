import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { disputeMessageSchema } from '@handycraft/shared';
import { disputeController } from '../controllers/dispute.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => disputeController.mine(req, res).catch(next));
router.get('/:id', (req, res, next) => disputeController.detail(req, res).catch(next));
router.post('/:id/messages', validate(disputeMessageSchema), (req, res, next) =>
  disputeController.addMessage(req, res).catch(next)
);

export default router;
