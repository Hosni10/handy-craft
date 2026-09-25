import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

const storePublicSelect = {
  id: true,
  name: true,
  slug: true,
  bio: true,
  logo: true,
  governorate: true,
  badgeStatus: true,
  shippingZones: true,
  ratingAvg: true,
  ratingCount: true,
  createdAt: true,
  owner: { select: { id: true, name: true, avatar: true } },
} satisfies Prisma.StoreSelect;

export const storeRepository = {
  findById(id: string) {
    return prisma.store.findUnique({ where: { id }, select: storePublicSelect });
  },

  findBySlug(slug: string) {
    return prisma.store.findUnique({ where: { slug }, select: storePublicSelect });
  },

  findVerified(limit = 8) {
    return prisma.store.findMany({
      where: { badgeStatus: 'verified' },
      select: storePublicSelect,
      orderBy: { ratingAvg: 'desc' },
      take: limit,
    });
  },

  findByOwnerId(ownerId: string) {
    return prisma.store.findUnique({
      where: { ownerId },
      select: {
        ...storePublicSelect,
        ownerId: true,
        verifications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            mediaUrls: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });
  },

  createForOwner(ownerId: string, data: {
    name: string;
    slug: string;
    bio?: string | null;
    governorate: string;
    shippingZones: string[];
    logo?: string | null;
  }) {
    return prisma.store.create({
      data: {
        ownerId,
        name: data.name,
        slug: data.slug,
        bio: data.bio ?? null,
        governorate: data.governorate,
        shippingZones: data.shippingZones,
        logo: data.logo ?? null,
        badgeStatus: 'unverified',
      },
      select: storePublicSelect,
    });
  },

  updateByOwner(ownerId: string, data: {
    name?: string;
    bio?: string | null;
    governorate?: string;
    shippingZones?: string[];
    logo?: string | null;
  }) {
    return prisma.store.update({
      where: { ownerId },
      data,
      select: storePublicSelect,
    });
  },

  slugExists(slug: string) {
    return prisma.store.findUnique({ where: { slug }, select: { id: true } });
  },
};
