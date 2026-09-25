import { prisma } from '../lib/prisma.js';

export const categoryRepository = {
  /** Flat list of all categories */
  findAll() {
    return prisma.category.findMany({ orderBy: { nameAr: 'asc' } });
  },

  /** Root categories with their immediate children */
  findRootsWithChildren() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { nameAr: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.category.findUnique({ where: { id }, include: { children: true } });
  },
};
