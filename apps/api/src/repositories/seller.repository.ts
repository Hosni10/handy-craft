import { prisma } from '../lib/prisma.js';
import { orderDisplayNumber } from '../lib/shipping.js';
import type { OrderStatus } from '@prisma/client';

export const sellerRepository = {
  async countPendingOrders(storeId: string) {
    return prisma.order.count({
      where: { storeId, status: { in: ['new', 'confirmed', 'preparing'] } },
    });
  },

  async countActiveProducts(storeId: string) {
    return prisma.product.count({ where: { storeId, status: 'active' } });
  },

  createVerification(storeId: string, mediaUrls: string[], note?: string) {
    return prisma.storeVerification.create({
      data: { storeId, mediaUrls, note: note ?? null, status: 'pending' },
    });
  },

  listStoreOrders(storeId: string, status: OrderStatus | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where = {
      storeId,
      ...(status ? { status } : {}),
    };
    return Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          subtotalEgp: true,
          commissionEgp: true,
          totalEgp: true,
          createdAt: true,
          addressSnapshot: true,
          items: { select: { id: true } },
          buyer: { select: { name: true } },
          shipment: { select: { trackingNumber: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);
  },

  findStoreOrder(orderId: string, storeId: string) {
    return prisma.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        items: { include: { product: { select: { name: true } } } },
        buyer: { select: { name: true, phone: true } },
        store: { select: { name: true, governorate: true, owner: { select: { phone: true } } } },
        shipment: true,
      },
    });
  },

  listWithdrawals(sellerId: string) {
    return prisma.withdrawal.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  getWalletWithTransactions(userId: string) {
    return prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  },

  mapSellerOrderRow(order: {
    id: string;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    subtotalEgp: { toNumber(): number };
    commissionEgp: { toNumber(): number };
    totalEgp: { toNumber(): number };
    createdAt: Date;
    addressSnapshot: unknown;
    items: { id: string }[];
    buyer: { name: string };
    shipment?: { trackingNumber: string | null; status: string } | null;
  }) {
    const subtotal = Number(order.subtotalEgp);
    const commission = Number(order.commissionEgp);
    const address = order.addressSnapshot as { name?: string };
    return {
      id: order.id,
      orderNumber: orderDisplayNumber(order.id),
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalEgp: Number(order.totalEgp),
      subtotalEgp: subtotal,
      commissionEgp: commission,
      netEgp: subtotal - commission,
      createdAt: order.createdAt.toISOString(),
      buyerName: address.name ?? order.buyer.name,
      itemsCount: order.items.length,
      shipment: order.shipment ?? null,
    };
  },
};
