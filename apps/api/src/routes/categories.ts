import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';

const router = Router();

router.get('/', (req, res, next) => categoryController.list(req, res).catch(next));
router.get('/:id', (req, res, next) => categoryController.detail(req, res).catch(next));

export default router;
