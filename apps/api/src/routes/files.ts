import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { sellerController } from '../controllers/seller.controller.js';

/** Upload endpoint for any signed-in user (dispute evidence, review images). */
const router = Router();

router.post('/', authenticate, upload.array('files', 5), (req, res, next) =>
  sellerController.upload(req, res).catch(next)
);

export default router;
