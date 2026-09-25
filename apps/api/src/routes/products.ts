import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';

const router = Router();

router.get('/featured', (req, res, next) => productController.featured(req, res).catch(next));
router.get('/new-arrivals', (req, res, next) => productController.newArrivals(req, res).catch(next));
router.get('/ready-to-ship', (req, res, next) => productController.readyToShip(req, res).catch(next));
router.get('/', (req, res, next) => productController.list(req, res).catch(next));
router.get('/:id', (req, res, next) => productController.detail(req, res).catch(next));

export default router;
