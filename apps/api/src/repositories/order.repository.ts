import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

const orderDetailSelect = {
  id: true,
  buyerId: true,
  storeId: true,
  status: true,
  paymentMethod: true,
  paymentStatus: true,
  subtotalEgp: true,
  shippingFeeEgp: true,
  commissionEgp: true,
  totalEgp: true,
  addressSnapshot: true,
  notes: true,
  deliveredAt: true,
  createdAt: true,
  store: {
    select: { id: true, name: true, slug: true, logo: true },
  },
  dispute: { select: { id: true, status: true } },
  items: {
    select: {
      id: true,
      orderId: true,
      productId: true,
      qty: true,
      unitPrice: true,
      customizationSnapshot: true,
      product: { select: { id: true, name: true, images: true, priceEgp: true } },
    },
  },
  shipment: {
    select: {
      id: true,
      courier: true,
      trackingNumber: true,
      status: true,
      codAmount: true,
      createdAt: true,
    },
  },
  codOtp: {
    select: { confirmed: true, expiresAt: true },
  },
  review: {
    select: {
      id: true,
      orderId: true,
      storeId: true,
      buyerId: true,
      rating: true,
      comment: true,
      images: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderSelect;

export const orderRepository = {
  findByIdForBuyer(id: string, buyerId: string) {
    return prisma.order.findFirst({
      where: { id, buyerId },
      select: orderDetailSelect,
    });
  },

  listForBuyer(buyerId: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    return Promise.all([
      prisma.order.findMany({
        where: { buyerId },
        select: {
          id: true,
          buyerId: true,
          storeId: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          subtotalEgp: true,
          shippingFeeEgp: true,
          commissionEgp: true,
          totalEgp: true,
          addressSnapshot: true,
          notes: true,
          createdAt: true,
          store: { select: { id: true, name: true, slug: true, logo: true } },
          items: {
            select: {
              id: true,
              productId: true,
              qty: true,
              unitPrice: true,
              product: { select: { id: true, name: true, images: true } },
            },
          },
          shipment: { select: { trackingNumber: true, status: true } },
          review: { select: { id: true, rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where: { buyerId } }),
    ]);
  },

  createWithItems(data: Prisma.OrderCreateInput) {
    return prisma.order.create({
      data,
      select: orderDetailSelect,
    });
  },

  upsertCodOtp(orderId: string, code: string, expiresAt: Date) {
    return prisma.codOtp.upsert({
      where: { orderId },
      create: { orderId, code, expiresAt },
      update: { code, expiresAt, confirmed: false },
    });
  },

  findCodOtp(orderId: string) {
    return prisma.codOtp.findUnique({ where: { orderId } });
  },

  confirmCodOtp(orderId: string) {
    return prisma.codOtp.update({
      where: { orderId },
      data: { confirmed: true },
    });
  },

  createReview(data: Prisma.ReviewCreateInput) {
    return prisma.review.create({
      data,
      select: {
        id: true,
        orderId: true,
        storeId: true,
        buyerId: true,
        rating: true,
        comment: true,
        images: true,
        createdAt: true,
      },
    });
  },

  listStoreReviews(storeId: string, limit = 20) {
    return prisma.review.findMany({
      where: { storeId },
      select: {
        id: true,
        rating: true,
        comment: true,
        images: true,
        createdAt: true,
        buyer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
