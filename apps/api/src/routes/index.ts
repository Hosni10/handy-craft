import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import productsRouter from './products.js';
import categoriesRouter from './categories.js';
import storesRouter from './stores.js';
import ordersRouter from './orders.js';
import sellerRouter from './seller.js';
import customOrdersRouter from './custom-orders.js';
import disputesRouter from './disputes.js';
import walletRouter from './wallet.js';
import filesRouter from './files.js';
import bannersRouter from './banners.js';
import adminRouter from './admin.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/stores', storesRouter);
router.use('/orders', ordersRouter);
router.use('/seller', sellerRouter);
router.use('/custom-orders', customOrdersRouter);
router.use('/disputes', disputesRouter);
router.use('/wallet', walletRouter);
router.use('/files', filesRouter);
router.use('/banners', bannersRouter);
router.use('/admin', adminRouter);

export default router;
