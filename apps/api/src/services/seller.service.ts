import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';
import { orderDisplayNumber } from '../lib/shipping.js';
import { userRepository } from '../repositories/user.repository.js';
import { storeRepository } from '../repositories/store.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import { sellerRepository } from '../repositories/seller.repository.js';
import { courierService } from './courier.service.js';
import type {
  CreateProductInput,
  UpdateProductInput,
  CreateStoreInput,
  StoreVerificationInput,
  SellerOrderStatusInput,
  CreateWithdrawalInput,
  SellerDashboard,
  PrintLabelResult,
} from '@handycraft/shared';
import type { OrderStatus, User, Prisma } from '@prisma/client';

function slugify(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[\s،,؟?]/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || `store-${Date.now()}`;
}

async function uniqueSlug(name: string): Promise<string> {
  let slug = slugify(name);
  let suffix = 0;
  while (await storeRepository.slugExists(slug)) {
    suffix += 1;
    slug = `${slugify(name)}-${suffix}`;
  }
  return slug;
}

async function ensureSellerWallet(userId: string) {
  await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balanceEgp: 0 },
  });
}

async function getStoreForUser(userId: string) {
  const store = await storeRepository.findByOwnerId(userId);
  if (!store) throw new AppError('لم يتم إنشاء متجر بعد. أكمل التسجيل كحرفي', 404);
  return store;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'refused'],
  delivered: [],
  cancelled: [],
  refused: [],
};

async function creditSellerForDeliveredOrder(orderId: string) {
  const existing = await prisma.walletTransaction.findFirst({
    where: { refType: 'order', refId: orderId, type: 'credit' },
  });
  if (existing) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: true },
  });
  if (!order || order.status !== 'delivered') return;

  const net = Number(order.subtotalEgp) - Number(order.commissionEgp);
  const sellerId = order.store.ownerId;
  await ensureSellerWallet(sellerId);

  await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: sellerId },
      data: { balanceEgp: { increment: net } },
    });
    const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId: sellerId } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit',
        amount: net,
        refType: 'order',
        refId: orderId,
        note: `أرباح طلب #${orderDisplayNumber(orderId)}`,
      },
    });
    if (order.paymentMethod === 'cod') {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'paid' },
      });
    }
  });
}

function mapStoreProfile(store: NonNullable<Awaited<ReturnType<typeof storeRepository.findByOwnerId>>>) {
  const latest = store.verifications[0];
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    bio: store.bio,
    logo: store.logo,
    governorate: store.governorate,
    badgeStatus: store.badgeStatus,
    shippingZones: store.shippingZones,
    ratingAvg: store.ratingAvg,
    ratingCount: store.ratingCount,
    latestVerification: latest
      ? {
          id: latest.id,
          status: latest.status,
          mediaUrls: latest.mediaUrls,
          note: latest.note,
          reviewNote: latest.reviewNote,
          createdAt: latest.createdAt.toISOString(),
        }
      : null,
  };
}

function serializeProduct(p: NonNullable<Awaited<ReturnType<typeof productRepository.findByIdForStore>>>) {
  return {
    ...p,
    priceEgp: Number(p.priceEgp),
    createdAt: p.createdAt.toISOString(),
    customizations: p.customizations.map((c) => ({ ...c, priceDelta: Number(c.priceDelta) })),
  };
}

export const sellerService = {
  async becomeSeller(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('المستخدم غير موجود', 404);
    if (user.role === 'SELLER' || user.role === 'ADMIN') return user;
    if (user.role !== 'BUYER') throw new AppError('غير مصرح', 403);
    const updated = await userRepository.update(userId, { role: 'SELLER' });
    await ensureSellerWallet(userId);
    return updated;
  },

  async getDashboard(userId: string): Promise<SellerDashboard> {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('المستخدم غير موجود', 404);

    const storeRaw = await storeRepository.findByOwnerId(userId);
    const wallet = await sellerRepository.getWalletWithTransactions(userId);

    let stats = { pendingOrders: 0, activeProducts: 0, walletBalanceEgp: Number(wallet?.balanceEgp ?? 0) };
    if (storeRaw) {
      stats = {
        pendingOrders: await sellerRepository.countPendingOrders(storeRaw.id),
        activeProducts: await sellerRepository.countActiveProducts(storeRaw.id),
        walletBalanceEgp: Number(wallet?.balanceEgp ?? 0),
      };
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role as SellerDashboard['user']['role'],
        governorate: user.governorate,
      },
      store: storeRaw ? mapStoreProfile(storeRaw) : null,
      stats,
    };
  },

  async createStore(userId: string, input: CreateStoreInput) {
    const existing = await storeRepository.findByOwnerId(userId);
    if (existing) throw new AppError('لديك متجر بالفعل', 409);

    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('المستخدم غير موجود', 404);
    if (user.role === 'BUYER') {
      await this.becomeSeller(userId);
    }

    const slug = await uniqueSlug(input.name);
    const store = await storeRepository.createForOwner(userId, {
      name: input.name,
      slug,
      bio: input.bio ?? null,
      governorate: input.governorate,
      shippingZones: input.shippingZones,
    });

    await userRepository.update(userId, { governorate: input.governorate });
    return store;
  },

  async updateStore(userId: string, input: Partial<CreateStoreInput>) {
    await getStoreForUser(userId);
    return storeRepository.updateByOwner(userId, {
      name: input.name,
      bio: input.bio,
      governorate: input.governorate,
      shippingZones: input.shippingZones,
    });
  },

  async submitVerification(userId: string, input: StoreVerificationInput) {
    const store = await getStoreForUser(userId);
    const verification = await sellerRepository.createVerification(
      store.id,
      input.mediaUrls,
      input.note
    );
    await prisma.store.update({
      where: { id: store.id },
      data: { badgeStatus: 'pending' },
    });
    return {
      id: verification.id,
      status: verification.status,
      mediaUrls: verification.mediaUrls,
      createdAt: verification.createdAt.toISOString(),
    };
  },

  async listProducts(userId: string, page: number, pageSize: number) {
    const store = await getStoreForUser(userId);
    const [rows, total] = await productRepository.findManyForStore(store.id, page, pageSize);
    return {
      items: rows.map((p) => serializeProduct(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async createProduct(userId: string, input: CreateProductInput) {
    const store = await getStoreForUser(userId);
    if (input.madeToOrder && !input.productionDays) {
      throw new AppError('حدد مدة التصنيع للمنتجات حسب الطلب', 400);
    }

    const product = await productRepository.createForStore(store.id, {
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      materials: input.materials ?? null,
      priceEgp: input.priceEgp,
      stockQty: input.stockQty,
      madeToOrder: input.madeToOrder,
      productionDays: input.productionDays ?? null,
      images: input.images,
      videoUrl: input.videoUrl ?? null,
      status: 'pending',
      featured: false,
    });

    return serializeProduct(product);
  },

  async updateProduct(userId: string, productId: string, input: UpdateProductInput) {
    const store = await getStoreForUser(userId);
    const existing = await productRepository.findByIdForStore(productId, store.id);
    if (!existing) throw new AppError('المنتج غير موجود', 404);

    await productRepository.updateForStore(productId, store.id, {
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.materials !== undefined ? { materials: input.materials } : {}),
      ...(input.priceEgp !== undefined ? { priceEgp: input.priceEgp } : {}),
      ...(input.stockQty !== undefined ? { stockQty: input.stockQty } : {}),
      ...(input.madeToOrder !== undefined ? { madeToOrder: input.madeToOrder } : {}),
      ...(input.productionDays !== undefined ? { productionDays: input.productionDays } : {}),
      ...(input.images !== undefined ? { images: input.images } : {}),
      ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl } : {}),
      status: existing.status === 'active' ? 'pending' : existing.status,
    });

    const refreshed = await productRepository.findByIdForStore(productId, store.id);
    if (!refreshed) throw new AppError('المنتج غير موجود', 404);
    return serializeProduct(refreshed);
  },

  async deleteProduct(userId: string, productId: string) {
    const store = await getStoreForUser(userId);
    const existing = await productRepository.findByIdForStore(productId, store.id);
    if (!existing) throw new AppError('المنتج غير موجود', 404);
    await productRepository.updateForStore(productId, store.id, { status: 'draft' });
    return { deleted: true };
  },

  async listOrders(userId: string, status: OrderStatus | undefined, page: number, pageSize: number) {
    const store = await getStoreForUser(userId);
    const [rows, total] = await sellerRepository.listStoreOrders(store.id, status, page, pageSize);
    return {
      items: rows.map((o) => sellerRepository.mapSellerOrderRow(o)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async updateOrderStatus(userId: string, orderId: string, input: SellerOrderStatusInput) {
    const store = await getStoreForUser(userId);
    const order = await sellerRepository.findStoreOrder(orderId, store.id);
    if (!order) throw new AppError('الطلب غير موجود', 404);

    const allowed = STATUS_FLOW[order.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new AppError(`لا يمكن تغيير الحالة من "${order.status}" إلى "${input.status}"`, 400);
    }

    if (input.status === 'shipped' && !order.shipment?.trackingNumber) {
      throw new AppError('اطلب استلام الشحن من Bosta أولاً قبل تحديد الحالة كـ "تم الشحن"', 400);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: input.status,
        ...(input.status === 'delivered' ? { deliveredAt: new Date() } : {}),
      },
    });

    if (input.status === 'delivered') {
      await creditSellerForDeliveredOrder(orderId);
    }

    const refreshed = await sellerRepository.findStoreOrder(orderId, store.id);
    if (!refreshed) throw new AppError('الطلب غير موجود', 404);
    return sellerRepository.mapSellerOrderRow(refreshed);
  },

  async requestPickup(userId: string, orderId: string) {
    const store = await getStoreForUser(userId);
    const order = await sellerRepository.findStoreOrder(orderId, store.id);
    if (!order) throw new AppError('الطلب غير موجود', 404);
    if (!['confirmed', 'preparing'].includes(order.status)) {
      throw new AppError('يمكن طلب الشحن للطلبات المؤكدة أو قيد التجهيز فقط', 400);
    }

    const address = order.addressSnapshot as {
      name: string;
      phone: string;
      governorate: string;
      street: string;
      apartment?: string;
    };

    const pickup = await courierService.requestPickup({
      orderId: order.id,
      sellerAddress: `${store.governorate ?? ''} — ${store.name}`,
      sellerPhone: order.store.owner.phone,
      buyerAddress: `${address.governorate} — ${address.street}${address.apartment ? `، ${address.apartment}` : ''}`,
      buyerPhone: address.phone,
      codAmount: order.paymentMethod === 'cod' ? Number(order.totalEgp) : 0,
    });

    await prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          courier: 'bosta',
          trackingNumber: pickup.trackingNumber,
          status: 'picked_up',
          codAmount: order.paymentMethod === 'cod' ? order.totalEgp : 0,
          courierPayload: pickup as unknown as Prisma.InputJsonValue,
        },
        update: {
          trackingNumber: pickup.trackingNumber,
          status: 'picked_up',
          courierPayload: pickup as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'shipped' },
      });
    });

    return {
      trackingNumber: pickup.trackingNumber,
      courierOrderId: pickup.courierOrderId,
      estimatedDays: pickup.estimatedDays,
    };
  },

  async printLabel(userId: string, orderId: string): Promise<PrintLabelResult> {
    const store = await getStoreForUser(userId);
    const order = await sellerRepository.findStoreOrder(orderId, store.id);
    if (!order) throw new AppError('الطلب غير موجود', 404);

    const address = order.addressSnapshot as {
      name: string;
      governorate: string;
      street: string;
      apartment?: string;
    };

    return {
      orderId: order.id,
      orderNumber: orderDisplayNumber(order.id),
      trackingNumber: order.shipment?.trackingNumber,
      storeName: order.store.name,
      buyerName: address.name,
      addressLine: `${address.governorate} — ${address.street}${address.apartment ? `، ${address.apartment}` : ''}`,
      codAmount: order.paymentMethod === 'cod' ? Number(order.totalEgp) : 0,
    };
  },

  async getEarnings(userId: string) {
    const store = await getStoreForUser(userId);
    const wallet = await sellerRepository.getWalletWithTransactions(userId);
    await ensureSellerWallet(userId);

    const deliveredOrders = await prisma.order.findMany({
      where: { storeId: store.id, status: 'delivered' },
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
      take: 20,
    });

    const inProgress = await prisma.order.findMany({
      where: {
        storeId: store.id,
        status: { in: ['new', 'confirmed', 'preparing', 'shipped'] },
      },
      select: { subtotalEgp: true, commissionEgp: true },
    });

    const pendingNetEgp = inProgress.reduce(
      (sum, o) => sum + Number(o.subtotalEgp) - Number(o.commissionEgp),
      0
    );

    const totalEarnedEgp = deliveredOrders.reduce(
      (sum, o) => sum + Number(o.subtotalEgp) - Number(o.commissionEgp),
      0
    );

    return {
      walletBalanceEgp: Number(wallet?.balanceEgp ?? 0),
      pendingNetEgp,
      totalEarnedEgp,
      recentTransactions: (wallet?.transactions ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        refType: t.refType,
        refId: t.refId,
        note: t.note,
        createdAt: t.createdAt.toISOString(),
      })),
      orderBreakdown: deliveredOrders.map((o) => sellerRepository.mapSellerOrderRow(o)),
    };
  },

  async createWithdrawal(userId: string, input: CreateWithdrawalInput) {
    await getStoreForUser(userId);
    await ensureSellerWallet(userId);

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || Number(wallet.balanceEgp) < input.amount) {
      throw new AppError('رصيد المحفظة غير كافٍ', 400);
    }

    const minWithdrawal = 50;
    if (input.amount < minWithdrawal) {
      throw new AppError(`الحد الأدنى للسحب ${minWithdrawal} جنيه`, 400);
    }

    const withdrawal = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { balanceEgp: { decrement: input.amount } },
      });
      const w = await tx.wallet.findUniqueOrThrow({ where: { userId } });
      const created = await tx.withdrawal.create({
        data: {
          sellerId: userId,
          amount: input.amount,
          method: input.method,
          destination: input.destination,
          status: 'pending',
        },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: w.id,
          type: 'debit',
          amount: input.amount,
          refType: 'withdrawal',
          refId: created.id,
          note: 'طلب سحب أرباح',
        },
      });
      return created;
    });

    return {
      id: withdrawal.id,
      amount: Number(withdrawal.amount),
      method: withdrawal.method,
      destination: withdrawal.destination,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.toISOString(),
    };
  },

  async listWithdrawals(userId: string) {
    await getStoreForUser(userId);
    const rows = await sellerRepository.listWithdrawals(userId);
    return rows.map((w) => ({
      id: w.id,
      amount: Number(w.amount),
      method: w.method,
      destination: w.destination,
      status: w.status,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    }));
  },
};
