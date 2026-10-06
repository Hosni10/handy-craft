import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { ok } from '../lib/response.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      select: { id: true, title: true, image: true, link: true, position: true, active: true },
    });
    ok(res, banners);
  } catch (e) {
    next(e);
  }
});

export default router;
