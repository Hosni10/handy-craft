import { prisma } from '../lib/prisma.js';
import type { ProductFilterInput } from '@craftsouq/shared';

// Extended filter for store-specific listing
type ExtendedFilter = ProductFilterInput & { storeId?: string };
import type { Prisma } from '@prisma/client';

/** Full product select — include store + category for public listing */
const productWithRelations = {
  id: true,
  storeId: true,
  categoryId: true,
  name: true,
  description: true,
  materials: true,
  priceEgp: true,
  stockQty: true,
  madeToOrder: true,
  productionDays: true,
  images: true,
  videoUrl: true,
  status: true,
  featured: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      governorate: true,
      badgeStatus: true,
      ratingAvg: true,
      ratingCount: true,
    },
  },
  category: { select: { id: true, nameAr: true } },
  customizations: {
    select: { id: true, optionName: true, choices: true, priceDelta: true },
  },
} satisfies Prisma.ProductSelect;

export const productRepository = {
  async findMany(filters: ExtendedFilter) {
    const { q, categoryId, governorate, minPrice, maxPrice, minRating, madeToOrder, sort, page, pageSize, storeId } = filters;

    const where: Prisma.ProductWhereInput = {
      status: 'active',
      ...(storeId ? { storeId } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { materials: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(governorate ? { store: { governorate } } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined ? {
        priceEgp: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        },
      } : {}),
      ...(madeToOrder !== undefined ? { madeToOrder } : {}),
      ...(minRating !== undefined ? {
        store: { ratingAvg: { gte: minRating }, ...(governorate ? { governorate } : {}) },
      } : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === 'price_asc' ? { priceEgp: 'asc' }
      : sort === 'price_desc' ? { priceEgp: 'desc' }
      : sort === 'rating' ? { store: { ratingAvg: 'desc' } }
      : { createdAt: 'desc' };

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, select: productWithRelations, orderBy, skip, take: pageSize }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      select: productWithRelations,
    });
  },

  findFeatured(limit = 8) {
    return prisma.product.findMany({
      where: { status: 'active', featured: true },
      select: productWithRelations,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  findNewArrivals(limit = 8) {
    return prisma.product.findMany({
      where: { status: 'active' },
      select: productWithRelations,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  findReadyToShip(limit = 8) {
    return prisma.product.findMany({
      where: { status: 'active', madeToOrder: false, stockQty: { gt: 0 } },
      select: productWithRelations,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  findManyForStore(storeId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.product.findMany({
        where: { storeId },
        select: productWithRelations,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where: { storeId } }),
    ]);
  },

  findByIdForStore(productId: string, storeId: string) {
    return prisma.product.findFirst({
      where: { id: productId, storeId },
      select: productWithRelations,
    });
  },

  createForStore(storeId: string, data: Omit<Prisma.ProductUncheckedCreateInput, 'storeId'>) {
    return prisma.product.create({
      data: { ...data, storeId },
      select: productWithRelations,
    });
  },

  updateForStore(productId: string, storeId: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.updateMany({
      where: { id: productId, storeId },
      data,
    });
  },
};
