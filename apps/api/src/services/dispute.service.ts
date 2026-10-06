import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/AppError.js';
import { orderDisplayNumber } from '../lib/shipping.js';
import { isWithinDisputeWindow } from './order.service.js';
import { walletService } from './wallet.service.js';
import type {
  DisputeDetail,
  DisputeMessageInput,
  DisputeSummary,
  OpenDisputeInput,
  ResolveDisputeInput,
  UserRole,
} from '@handycraft/shared';
import type { DisputeStatus, Prisma } from '@prisma/client';

const disputeInclude = {
  order: {
    select: {
      id: true,
      buyerId: true,
      totalEgp: true,
      store: { select: { name: true, ownerId: true } },
      buyer: { select: { name: true } },
    },
  },
} satisfies Prisma.DisputeInclude;

const detailInclude = {
  ...disputeInclude,
  messages: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true, role: true } } },
  },
} satisfies Prisma.DisputeInclude;

type DisputeRaw = Prisma.DisputeGetPayload<{ include: typeof disputeInclude }>;
type DisputeDetailRaw = Prisma.DisputeGetPayload<{ include: typeof detailInclude }>;

const RESOLVED: DisputeStatus[] = ['resolved_buyer', 'resolved_seller'];

function mapSummary(d: DisputeRaw): DisputeSummary {
  return {
    id: d.id,
    orderId: d.orderId,
    orderNumber: orderDisplayNumber(d.orderId),
    status: d.status,
    reason: d.reason,
    evidence: d.evidence,
    resolutionNote: d.resolutionNote,
    createdAt: d.createdAt.toISOString(),
    resolvedAt: d.resolvedAt?.toISOString() ?? null,
    storeName: d.order.store.name,
    buyerName: d.order.buyer.name,
    orderTotalEgp: Number(d.order.totalEgp),
  };
}

function mapDetail(d: DisputeDetailRaw): DisputeDetail {
  return {
    ...mapSummary(d),
    messages: d.messages.map((m) => ({
      id: m.id,
      body: m.body,
      images: m.images,
      createdAt: m.createdAt.toISOString(),
      author: { id: m.author.id, name: m.author.name, role: m.author.role },
    })),
  };
}

function canAccess(d: DisputeRaw, userId: string, role: UserRole) {
  return role === 'ADMIN' || d.order.buyerId === userId || d.order.store.ownerId === userId;
}

async function loadDetail(id: string) {
  const d = await prisma.dispute.findUnique({ where: { id }, include: detailInclude });
  if (!d) throw new AppError('النزاع غير موجود', 404);
  return d;
}

export const disputeService = {
  async open(buyerId: string, orderId: string, input: OpenDisputeInput): Promise<DisputeSummary> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId },
      include: { dispute: true },
    });
    if (!order) throw new AppError('الطلب غير موجود', 404);
    if (order.status !== 'delivered') throw new AppError('يمكن فتح نزاع بعد استلام الطلب فقط', 400);
    if (order.dispute) throw new AppError('يوجد نزاع مفتوح على هذا الطلب بالفعل', 409);
    if (!isWithinDisputeWindow(order.deliveredAt)) {
      throw new AppError('انتهت مهلة فتح النزاع (48 ساعة من الاستلام)', 400);
    }

    const created = await prisma.dispute.create({
      data: { orderId, openedBy: buyerId, reason: input.reason, evidence: input.evidence },
      include: disputeInclude,
    });
    return mapSummary(created);
  },

  /** Disputes where the user is the buyer or the store owner */
  async listForUser(userId: string): Promise<DisputeSummary[]> {
    const rows = await prisma.dispute.findMany({
      where: { OR: [{ order: { buyerId: userId } }, { order: { store: { ownerId: userId } } }] },
      include: disputeInclude,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map(mapSummary);
  },

  async listAll(status?: DisputeStatus): Promise<DisputeSummary[]> {
    const rows = await prisma.dispute.findMany({
      where: status ? { status } : {},
      include: disputeInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map(mapSummary);
  },

  async getDetail(id: string, userId: string, role: UserRole): Promise<DisputeDetail> {
    const d = await loadDetail(id);
    if (!canAccess(d, userId, role)) throw new AppError('النزاع غير موجود', 404);
    return mapDetail(d);
  },

  async addMessage(id: string, userId: string, role: UserRole, input: DisputeMessageInput) {
    const d = await loadDetail(id);
    if (!canAccess(d, userId, role)) throw new AppError('النزاع غير موجود', 404);
    if (RESOLVED.includes(d.status)) throw new AppError('تم إغلاق هذا النزاع', 400);

    await prisma.disputeMessage.create({
      data: { disputeId: id, authorId: userId, body: input.body, images: input.images ?? [] },
    });
    return mapDetail(await loadDetail(id));
  },

  async markUnderReview(id: string) {
    const d = await loadDetail(id);
    if (d.status !== 'open') throw new AppError('النزاع ليس في حالة "مفتوح"', 400);
    await prisma.dispute.update({ where: { id }, data: { status: 'under_review' } });
    return mapDetail(await loadDetail(id));
  },

  /**
   * Resolve in favour of the buyer (refund order total to buyer wallet and
   * reverse the seller's earnings credit) or the seller (no money moves).
   */
  async resolve(id: string, adminId: string, input: ResolveDisputeInput) {
    const d = await loadDetail(id);
    if (RESOLVED.includes(d.status)) throw new AppError('تم حسم هذا النزاع مسبقاً', 409);
    const orderNumber = orderDisplayNumber(d.orderId);

    await prisma.$transaction(async (tx) => {
      if (input.outcome === 'buyer') {
        await walletService.move(tx, {
          userId: d.order.buyerId,
          type: 'credit',
          amount: Number(d.order.totalEgp),
          refType: 'dispute',
          refId: d.id,
          note: `استرداد قيمة طلب #${orderNumber}`,
        });

        const sellerCredit = await tx.walletTransaction.findFirst({
          where: { refType: 'order', refId: d.orderId, type: 'credit' },
        });
        if (sellerCredit) {
          await walletService.move(tx, {
            userId: d.order.store.ownerId,
            type: 'debit',
            amount: Number(sellerCredit.amount),
            refType: 'dispute',
            refId: d.id,
            note: `خصم بسبب نزاع على طلب #${orderNumber}`,
          });
        }

        await tx.order.update({ where: { id: d.orderId }, data: { paymentStatus: 'refunded' } });
      }

      await tx.dispute.update({
        where: { id },
        data: {
          status: input.outcome === 'buyer' ? 'resolved_buyer' : 'resolved_seller',
          resolutionNote: input.note,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      });
    });

    return mapDetail(await loadDetail(id));
  },
};
