import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { walletService } from '../services/wallet.service.js';
import { ok } from '../lib/response.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    ok(res, await walletService.getSummary(req.user!.sub));
  } catch (e) {
    next(e);
  }
});

export default router;
