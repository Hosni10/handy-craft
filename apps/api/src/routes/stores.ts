import { Router } from 'express';
import { storeController } from '../controllers/store.controller.js';

const router = Router();

router.get('/verified', (req, res, next) => storeController.verified(req, res).catch(next));
router.get('/:id/reviews', (req, res, next) => storeController.reviews(req, res).catch(next));
router.get('/:id/products', (req, res, next) => storeController.products(req, res).catch(next));
router.get('/:id', (req, res, next) => storeController.detail(req, res).catch(next));

export default router;
