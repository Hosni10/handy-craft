import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';
import { walletService } from './wallet.service.js';
import type {
  AdminKpis,
  AdminProductRow,
  AdminReports,
  AdminSettlements,
  AdminStoreRow,
  AdminVerificationRow,
  AdminWithdrawalRow,
  Banner,
  BannerInput,
  CategoryInput,
  SettlementWeek,
  StoreBadgeInput,
  UpdateBannerInput,
  UpdateCategoryInput,
} from '@handycraft/shared';
import type { OrderStatus, Prisma, ProductStatus, StoreVerificationStatus } from '@prisma/client';

/** Orders that count toward GMV / sales reports */
const SALE_STATUSES: OrderStatus[] = ['new', 'confirmed', 'preparing', 'shipped', 'delivered'];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Egyptian weeks start on Saturday */
function weekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));
  return d;
}

const withdrawalInclude = {
  seller: { select: { name: true, phone: true, store: { select: { name: true } } } },
} satisfies Prisma.WithdrawalInclude;

function mapWithdrawal(w: Prisma.WithdrawalGetPayload<{ include: typeof withdrawalInclude }>): AdminWithdrawalRow {
  return {
    id: w.id,
    amount: Number(w.amount),
    method: w.method,
    destination: w.destination,
    status: w.status,
    adminNote: w.adminNote,
    createdAt: w.createdAt.toISOString(),
    processedAt: w.processedAt?.toISOString() ?? null,
    sellerName: w.seller.name,
    sellerPhone: w.seller.phone,
    storeName: w.seller.store?.name ?? null,
  };
}

function mapBanner(b: { id: string; title: string; image: string; link: string | null; position: number; active: boolean }): Banner {
  return { id: b.id, title: b.title, image: b.image, link: b.link, position: b.position, active: b.active };
}

export const adminService = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────

  async getKpis(): Promise<AdminKpis> {
    const today = startOfToday();
    const [gmv, ordersToday, activeStores, pendingVerifications, pendingProducts, openDisputes, pendingWithdrawals] =
      await Promise.all([
        prisma.order.aggregate({
          where: { createdAt: { gte: today }, status: { in: SALE_STATUSES } },
          _sum: { totalEgp: true },
        }),
        prisma.order.count({ where: { createdAt: { gte: today } } }),
        prisma.store.count({ where: { products: { some: { status: 'active' } } } }),
        prisma.storeVerification.count({ where: { status: 'pending' } }),
        prisma.product.count({ where: { status: 'pending' } }),
        prisma.dispute.count({ where: { status: { in: ['open', 'under_review'] } } }),
        prisma.withdrawal.count({ where: { status: 'pending' } }),
      ]);

    return {
      gmvTodayEgp: Number(gmv._sum.totalEgp ?? 0),
      ordersToday,
      activeStores,
      pendingApprovals: pendingVerifications + pendingProducts,
      openDisputes,
      pendingWithdrawals,
    };
  },

  // ─── Store verifications ───────────────────────────────────────────────────

  async listVerifications(status: StoreVerificationStatus = 'pending'): Promise<AdminVerificationRow[]> {
    const rows = await prisma.storeVerification.findMany({
      where: { status },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            governorate: true,
            badgeStatus: true,
            owner: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return rows.map((v) => ({
      id: v.id,
      status: v.status,
      mediaUrls: v.mediaUrls,
      note: v.note,
      reviewNote: v.reviewNote,
      createdAt: v.createdAt.toISOString(),
      store: {
        id: v.store.id,
        name: v.store.name,
        governorate: v.store.governorate,
        badgeStatus: v.store.badgeStatus,
        ownerName: v.store.owner.name,
        ownerPhone: v.store.owner.phone,
      },
    }));
  },

  async reviewVerification(id: string, adminId: string, approve: boolean, reason?: string) {
    const v = await prisma.storeVerification.findUnique({ where: { id } });
    if (!v) throw new AppError('طلب التوثيق غير موجود', 404);
    if (v.status !== 'pending') throw new AppError('تمت مراجعة هذا الطلب مسبقاً', 409);

    await prisma.$transaction([
      prisma.storeVerification.update({
        where: { id },
        data: {
          status: approve ? 'approved' : 'rejected',
          reviewNote: reason ?? null,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      }),
      prisma.store.update({
        where: { id: v.storeId },
        data: { badgeStatus: approve ? 'verified' : 'rejected' },
      }),
    ]);
    return { id, status: approve ? 'approved' : 'rejected' };
  },

  // ─── Product approvals ─────────────────────────────────────────────────────

  async listProducts(status: ProductStatus = 'pending'): Promise<AdminProductRow[]> {
    const rows = await prisma.product.findMany({
      where: { status },
      include: {
        store: { select: { id: true, name: true } },
        category: { select: { id: true, nameAr: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      priceEgp: Number(p.priceEgp),
      images: p.images,
      status: p.status,
      madeToOrder: p.madeToOrder,
      rejectionReason: p.rejectionReason,
      createdAt: p.createdAt.toISOString(),
      store: p.store,
      category: p.category,
    }));
  },

  async reviewProduct(id: string, approve: boolean, reason?: string) {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) throw new AppError('المنتج غير موجود', 404);
    if (p.status !== 'pending') throw new AppError('المنتج ليس قيد المراجعة', 409);
    await prisma.product.update({
      where: { id },
      data: { status: approve ? 'active' : 'rejected', rejectionReason: approve ? null : reason ?? null },
    });
    return { id, status: approve ? 'active' : 'rejected' };
  },

  // ─── Settlements ───────────────────────────────────────────────────────────

  async getSettlements(weeks = 8): Promise<AdminSettlements> {
    const since = weekStart(new Date());
    since.setDate(since.getDate() - 7 * (weeks - 1));

    const [withdrawals, wallets] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { OR: [{ createdAt: { gte: since } }, { status: 'pending' }] },
        include: withdrawalInclude,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.wallet.findMany({
        where: { user: { role: 'SELLER' } },
        include: { user: { select: { id: true, name: true, store: { select: { name: true } } } } },
        orderBy: { balanceEgp: 'desc' },
        take: 100,
      }),
    ]);

    const byWeek = new Map<string, SettlementWeek>();
    for (const w of withdrawals) {
      const key = weekStart(w.createdAt).toISOString();
      const bucket = byWeek.get(key) ?? { weekStart: key, pendingEgp: 0, paidEgp: 0, withdrawals: [] };
      if (w.status === 'pending') bucket.pendingEgp += Number(w.amount);
      if (w.status === 'paid') bucket.paidEgp += Number(w.amount);
      bucket.withdrawals.push(mapWithdrawal(w));
      byWeek.set(key, bucket);
    }

    return {
      weeks: [...byWeek.values()].sort((a, b) => b.weekStart.localeCompare(a.weekStart)),
      sellerBalances: wallets.map((w) => ({
        sellerId: w.user.id,
        sellerName: w.user.name,
        storeName: w.user.store?.name ?? null,
        balanceEgp: Number(w.balanceEgp),
      })),
    };
  },

  async markWithdrawalPaid(id: string, adminId: string) {
    const w = await prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new AppError('طلب السحب غير موجود', 404);
    if (w.status !== 'pending') throw new AppError('تمت معالجة طلب السحب مسبقاً', 409);
    const updated = await prisma.withdrawal.update({
      where: { id },
      data: { status: 'paid', processedBy: adminId, processedAt: new Date() },
      include: withdrawalInclude,
    });
    return mapWithdrawal(updated);
  },

  /** Rejecting returns the held amount to the seller's wallet */
  async rejectWithdrawal(id: string, adminId: string, reason: string) {
    const w = await prisma.withdrawal.findUnique({ where: { id } });
    if (!w) throw new AppError('طلب السحب غير موجود', 404);
    if (w.status !== 'pending') throw new AppError('تمت معالجة طلب السحب مسبقاً', 409);

    const updated = await prisma.$transaction(async (tx) => {
      await walletService.move(tx, {
        userId: w.sellerId,
        type: 'credit',
        amount: Number(w.amount),
        refType: 'withdrawal',
        refId: w.id,
        note: 'إرجاع مبلغ سحب مرفوض',
      });
      return tx.withdrawal.update({
        where: { id },
        data: { status: 'rejected', adminNote: reason, processedBy: adminId, processedAt: new Date() },
        include: withdrawalInclude,
      });
    });
    return mapWithdrawal(updated);
  },

  // ─── CMS: banners ──────────────────────────────────────────────────────────

  async listBanners(): Promise<Banner[]> {
    const rows = await prisma.banner.findMany({ orderBy: { position: 'asc' } });
    return rows.map(mapBanner);
  },

  async createBanner(input: BannerInput) {
    return mapBanner(await prisma.banner.create({ data: { ...input, link: input.link ?? null } }));
  },

  async updateBanner(id: string, input: UpdateBannerInput) {
    const exists = await prisma.banner.findUnique({ where: { id } });
    if (!exists) throw new AppError('البانر غير موجود', 404);
    return mapBanner(await prisma.banner.update({ where: { id }, data: input }));
  },

  async deleteBanner(id: string) {
    const exists = await prisma.banner.findUnique({ where: { id } });
    if (!exists) throw new AppError('البانر غير موجود', 404);
    await prisma.banner.delete({ where: { id } });
    return { deleted: true };
  },

  // ─── CMS: categories ───────────────────────────────────────────────────────

  async createCategory(input: CategoryInput) {
    if (input.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) throw new AppError('التصنيف الأب غير موجود', 404);
    }
    return prisma.category.create({
      data: { nameAr: input.nameAr, parentId: input.parentId ?? null, image: input.image ?? null },
    });
  },

  async updateCategory(id: string, input: UpdateCategoryInput) {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) throw new AppError('التصنيف غير موجود', 404);
    if (input.parentId === id) throw new AppError('لا يمكن جعل التصنيف أباً لنفسه', 400);
    return prisma.category.update({ where: { id }, data: input });
  },

  async deleteCategory(id: string) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!cat) throw new AppError('التصنيف غير موجود', 404);
    if (cat._count.products > 0 || cat._count.children > 0) {
      throw new AppError('لا يمكن حذف تصنيف يحتوي على منتجات أو تصنيفات فرعية', 400);
    }
    await prisma.category.delete({ where: { id } });
    return { deleted: true };
  },

  // ─── CMS: stores & badges ──────────────────────────────────────────────────

  async listStores(): Promise<AdminStoreRow[]> {
    const rows = await prisma.store.findMany({
      include: {
        owner: { select: { name: true, phone: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      governorate: s.governorate,
      badgeStatus: s.badgeStatus,
      ratingAvg: s.ratingAvg,
      ratingCount: s.ratingCount,
      ownerName: s.owner.name,
      ownerPhone: s.owner.phone,
      productsCount: s._count.products,
    }));
  },

  async setStoreBadge(id: string, input: StoreBadgeInput) {
    const exists = await prisma.store.findUnique({ where: { id } });
    if (!exists) throw new AppError('المتجر غير موجود', 404);
    await prisma.store.update({ where: { id }, data: { badgeStatus: input.badgeStatus } });
    return { id, badgeStatus: input.badgeStatus };
  },

  // ─── Reports ───────────────────────────────────────────────────────────────

  async getReports(days = 30): Promise<AdminReports> {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000);
    const saleWhere = { createdAt: { gte: since }, status: { in: SALE_STATUSES } };

    const [items, orders, codTotal, codRefused, storeGroups] = await Promise.all([
      prisma.orderItem.findMany({
        where: { order: saleWhere },
        select: {
          orderId: true,
          qty: true,
          unitPrice: true,
          product: {
            select: { category: { select: { id: true, nameAr: true, parent: { select: { id: true, nameAr: true } } } } },
          },
        },
      }),
      prisma.order.findMany({ where: saleWhere, select: { totalEgp: true, addressSnapshot: true } }),
      prisma.order.count({
        where: { createdAt: { gte: since }, paymentMethod: 'cod', status: { in: ['delivered', 'refused'] } },
      }),
      prisma.order.count({ where: { createdAt: { gte: since }, paymentMethod: 'cod', status: 'refused' } }),
      prisma.order.groupBy({
        by: ['storeId'],
        where: saleWhere,
        _sum: { subtotalEgp: true },
        _count: { _all: true },
        orderBy: { _sum: { subtotalEgp: 'desc' } },
        take: 10,
      }),
    ]);

    // Roll sub-categories up into their root category
    const categoryMap = new Map<string, { categoryId: string; nameAr: string; totalEgp: number; orderIds: Set<string> }>();
    for (const item of items) {
      const root = item.product.category.parent ?? item.product.category;
      const entry = categoryMap.get(root.id) ?? { categoryId: root.id, nameAr: root.nameAr, totalEgp: 0, orderIds: new Set() };
      entry.totalEgp += Number(item.unitPrice) * item.qty;
      entry.orderIds.add(item.orderId);
      categoryMap.set(root.id, entry);
    }

    const govMap = new Map<string, { governorate: string; totalEgp: number; orders: number }>();
    for (const o of orders) {
      const governorate = (o.addressSnapshot as { governorate?: string }).governorate ?? 'غير محدد';
      const entry = govMap.get(governorate) ?? { governorate, totalEgp: 0, orders: 0 };
      entry.totalEgp += Number(o.totalEgp);
      entry.orders += 1;
      govMap.set(governorate, entry);
    }

    const stores = await prisma.store.findMany({
      where: { id: { in: storeGroups.map((g) => g.storeId) } },
      select: { id: true, name: true, ratingAvg: true },
    });
    const storeById = new Map(stores.map((s) => [s.id, s]));

    return {
      salesByCategory: [...categoryMap.values()]
        .map(({ orderIds, ...rest }) => ({ ...rest, orders: orderIds.size }))
        .sort((a, b) => b.totalEgp - a.totalEgp),
      salesByGovernorate: [...govMap.values()].sort((a, b) => b.totalEgp - a.totalEgp),
      cod: {
        total: codTotal,
        refused: codRefused,
        refusalRatePct: codTotal === 0 ? 0 : Math.round((codRefused / codTotal) * 1000) / 10,
      },
      topStores: storeGroups.map((g) => ({
        storeId: g.storeId,
        name: storeById.get(g.storeId)?.name ?? '—',
        ratingAvg: storeById.get(g.storeId)?.ratingAvg ?? 0,
        gmvEgp: Number(g._sum.subtotalEgp ?? 0),
        orders: g._count._all,
      })),
    };
  },
};
