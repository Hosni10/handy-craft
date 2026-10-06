import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../lib/AppError.js';
import { paymentService } from './payment.service.js';
import type {
  AcceptCustomOrderResult,
  CreateCustomOrderInput,
  CustomOrderRow,
  QuoteCustomOrderInput,
} from '@handycraft/shared';
import type { CustomOrderStatus, Prisma } from '@prisma/client';

const customOrderInclude = {
  product: {
    select: { id: true, name: true, images: true, store: { select: { id: true, name: true, ownerId: true } } },
  },
  buyer: { select: { id: true, name: true, phone: true } },
} satisfies Prisma.CustomOrderRequestInclude;

type CustomOrderRaw = Prisma.CustomOrderRequestGetPayload<{ include: typeof customOrderInclude }>;

function mapRow(r: CustomOrderRaw): CustomOrderRow {
  const quoted = r.quotedPrice != null ? Number(r.quotedPrice) : null;
  return {
    id: r.id,
    status: r.status,
    details: r.details,
    quotedPrice: quoted,
    quotedDays: r.quotedDays,
    sellerNote: r.sellerNote,
    depositPct: r.depositPct,
    depositPaid: r.depositPaid,
    depositEgp: quoted != null ? Math.round(quoted * r.depositPct) / 100 : null,
    createdAt: r.createdAt.toISOString(),
    product: { id: r.product.id, name: r.product.name, images: r.product.images },
    store: { id: r.product.store.id, name: r.product.store.name },
    buyer: { id: r.buyer.id, name: r.buyer.name },
  };
}

async function findForBuyer(id: string, buyerId: string) {
  const row = await prisma.customOrderRequest.findFirst({
    where: { id, buyerId },
    include: customOrderInclude,
  });
  if (!row) throw new AppError('طلب التخصيص غير موجود', 404);
  return row;
}

async function findForSeller(id: string, sellerId: string) {
  const row = await prisma.customOrderRequest.findFirst({
    where: { id, product: { store: { ownerId: sellerId } } },
    include: customOrderInclude,
  });
  if (!row) throw new AppError('طلب التخصيص غير موجود', 404);
  return row;
}

function assertStatus(current: CustomOrderStatus, expected: CustomOrderStatus, message: string) {
  if (current !== expected) throw new AppError(message, 400);
}

async function setStatus(id: string, data: Prisma.CustomOrderRequestUpdateInput) {
  const updated = await prisma.customOrderRequest.update({
    where: { id },
    data,
    include: customOrderInclude,
  });
  return mapRow(updated);
}

export const customOrderService = {
  async create(buyerId: string, input: CreateCustomOrderInput): Promise<CustomOrderRow> {
    const product = await prisma.product.findFirst({
      where: { id: input.productId, status: 'active' },
      include: { store: { select: { ownerId: true } } },
    });
    if (!product) throw new AppError('المنتج غير متاح', 404);
    if (product.store.ownerId === buyerId) {
      throw new AppError('لا يمكنك طلب تخصيص لمنتجك', 400);
    }

    const row = await prisma.customOrderRequest.create({
      data: {
        buyerId,
        productId: product.id,
        details: input.details,
        depositPct: config.customOrderDepositPct,
      },
      include: customOrderInclude,
    });
    return mapRow(row);
  },

  async listForBuyer(buyerId: string): Promise<CustomOrderRow[]> {
    const rows = await prisma.customOrderRequest.findMany({
      where: { buyerId },
      include: customOrderInclude,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map(mapRow);
  },

  async listForSeller(sellerId: string, status?: CustomOrderStatus): Promise<CustomOrderRow[]> {
    const rows = await prisma.customOrderRequest.findMany({
      where: { product: { store: { ownerId: sellerId } }, ...(status ? { status } : {}) },
      include: customOrderInclude,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return rows.map(mapRow);
  },

  async quote(sellerId: string, id: string, input: QuoteCustomOrderInput) {
    const row = await findForSeller(id, sellerId);
    assertStatus(row.status, 'pending', 'يمكن تسعير الطلبات الجديدة فقط');
    return setStatus(id, {
      status: 'quoted',
      quotedPrice: input.quotedPrice,
      quotedDays: input.quotedDays,
      sellerNote: input.sellerNote ?? null,
    });
  },

  async sellerReject(sellerId: string, id: string) {
    const row = await findForSeller(id, sellerId);
    assertStatus(row.status, 'pending', 'يمكن رفض الطلبات الجديدة فقط');
    return setStatus(id, { status: 'rejected' });
  },

  async complete(sellerId: string, id: string) {
    const row = await findForSeller(id, sellerId);
    assertStatus(row.status, 'accepted', 'يمكن إنهاء الطلبات المقبولة فقط');
    return setStatus(id, { status: 'completed' });
  },

  /** Buyer accepts the quote and pays the deposit through the payment stub. */
  async accept(buyerId: string, id: string): Promise<AcceptCustomOrderResult> {
    const row = await findForBuyer(id, buyerId);
    assertStatus(row.status, 'quoted', 'لا يوجد عرض سعر لقبوله');
    const deposit = Math.round(Number(row.quotedPrice) * row.depositPct) / 100;

    const paymentIntent = await paymentService.createIntent({
      orderId: row.id,
      amountEgp: deposit,
      phone: row.buyer.phone,
      name: row.buyer.name,
    });

    const customOrder = await setStatus(id, { status: 'accepted', depositPaid: true });
    return { customOrder, paymentIntent };
  },

  async buyerDecline(buyerId: string, id: string) {
    const row = await findForBuyer(id, buyerId);
    assertStatus(row.status, 'quoted', 'لا يوجد عرض سعر لرفضه');
    return setStatus(id, { status: 'rejected' });
  },
};
