import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import productsRouter from './products.js';
import categoriesRouter from './categories.js';
import storesRouter from './stores.js';
import ordersRouter from './orders.js';
import sellerRouter from './seller.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/stores', storesRouter);
router.use('/orders', ordersRouter);
router.use('/seller', sellerRouter);

// Phase 5+ routers will be mounted here:
// router.use('/seller', sellerRouter);
// router.use('/admin', adminRouter);

export default router;
