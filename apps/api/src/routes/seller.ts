import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import {
  createStoreSchema,
  updateStoreSchema,
  createProductSchema,
  updateProductSchema,
  storeVerificationSchema,
  sellerOrderStatusSchema,
  createWithdrawalSchema,
} from '@handycraft/shared';
import { sellerController } from '../controllers/seller.controller.js';

const router = Router();

router.use(authenticate);

// Onboarding — buyers can become sellers
router.post('/become', (req, res, next) => sellerController.become(req, res).catch(next));
router.get('/dashboard', (req, res, next) => sellerController.dashboard(req, res).catch(next));
router.post('/store', validate(createStoreSchema), (req, res, next) =>
  sellerController.createStore(req, res).catch(next)
);

const sellerOnly = requireRole('SELLER', 'ADMIN');

router.patch('/store', sellerOnly, validate(updateStoreSchema), (req, res, next) =>
  sellerController.updateStore(req, res).catch(next)
);
router.post('/verification', sellerOnly, validate(storeVerificationSchema), (req, res, next) =>
  sellerController.submitVerification(req, res).catch(next)
);
router.post('/upload', sellerOnly, upload.array('files', 5), (req, res, next) =>
  sellerController.upload(req, res).catch(next)
);

router.get('/products', sellerOnly, (req, res, next) =>
  sellerController.listProducts(req, res).catch(next)
);
router.post('/products', sellerOnly, validate(createProductSchema), (req, res, next) =>
  sellerController.createProduct(req, res).catch(next)
);
router.patch('/products/:id', sellerOnly, validate(updateProductSchema), (req, res, next) =>
  sellerController.updateProduct(req, res).catch(next)
);
router.delete('/products/:id', sellerOnly, (req, res, next) =>
  sellerController.deleteProduct(req, res).catch(next)
);

router.get('/orders', sellerOnly, (req, res, next) =>
  sellerController.listOrders(req, res).catch(next)
);
router.patch('/orders/:id/status', sellerOnly, validate(sellerOrderStatusSchema), (req, res, next) =>
  sellerController.updateOrderStatus(req, res).catch(next)
);
router.post('/orders/:id/pickup', sellerOnly, (req, res, next) =>
  sellerController.requestPickup(req, res).catch(next)
);
router.get('/orders/:id/label', sellerOnly, (req, res, next) =>
  sellerController.printLabel(req, res).catch(next)
);

router.get('/earnings', sellerOnly, (req, res, next) =>
  sellerController.earnings(req, res).catch(next)
);
router.get('/withdrawals', sellerOnly, (req, res, next) =>
  sellerController.listWithdrawals(req, res).catch(next)
);
router.post('/withdrawals', sellerOnly, validate(createWithdrawalSchema), (req, res, next) =>
  sellerController.createWithdrawal(req, res).catch(next)
);

export default router;
