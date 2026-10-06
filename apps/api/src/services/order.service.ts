import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../lib/AppError.js';
import { orderRepository } from '../repositories/order.repository.js';
import { resolveShippingFeeEgp, orderDisplayNumber, serializeOrder } from '../lib/shipping.js';
import { paymentService } from './payment.service.js';
import { smsService } from './sms.service.js';
import type { CreateOrderInput, CreateReviewInput, OrderDetail, CreateOrderResult, ShippingQuote } from '@handycraft/shared';
import type { Prisma } from '@prisma/client';

function generateCodOtpCode(): string {
  if (config.nodeEnv === 'development') {
    return config.devCodOtp;
  }
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function isWithinDisputeWindow(deliveredAt: Date | null): boolean {
  if (!deliveredAt) return false;
  return Date.now() - deliveredAt.getTime() <= config.disputeWindowHours * 3600 * 1000;
}

function mapOrderDetail(raw: NonNullable<Awaited<ReturnType<typeof orderRepository.findByIdForBuyer>>>): OrderDetail {
  const serialized = serializeOrder(raw);
  return {
    id: raw.id,
    buyerId: raw.buyerId,
    storeId: raw.storeId,
    status: raw.status,
    paymentMethod: raw.paymentMethod,
    paymentStatus: raw.paymentStatus,
    subtotalEgp: Number(raw.subtotalEgp),
    shippingFeeEgp: Number(raw.shippingFeeEgp),
    commissionEgp: Number(raw.commissionEgp),
    totalEgp: Number(raw.totalEgp),
    notes: raw.notes,
    store: raw.store ?? undefined,
    orderNumber: orderDisplayNumber(raw.id),
    canReview: raw.status === 'delivered' && !raw.review,
    deliveredAt: raw.deliveredAt?.toISOString() ?? null,
    canDispute: raw.status === 'delivered' && !raw.dispute && isWithinDisputeWindow(raw.deliveredAt),
    dispute: raw.dispute,
    createdAt: raw.createdAt.toISOString(),
    codOtp: raw.codOtp
      ? { confirmed: raw.codOtp.confirmed, expiresAt: raw.codOtp.expiresAt.toISOString() }
      : null,
    items: serialized.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      customizationSnapshot: item.customizationSnapshot as Record<string, unknown> | null | undefined,
      product: item.product
        ? { id: item.product.id, name: item.product.name, images: item.product.images }
        : undefined,
    })),
    addressSnapshot: raw.addressSnapshot as unknown as OrderDetail['addressSnapshot'],
    shipment: raw.shipment
      ? {
          id: raw.shipment.id,
          courier: raw.shipment.courier,
          trackingNumber: raw.shipment.trackingNumber,
          status: raw.shipment.status,
          codAmount: Number(raw.shipment.codAmount),
          createdAt: raw.shipment.createdAt.toISOString(),
        }
      : null,
    review: raw.review
      ? { ...raw.review, createdAt: raw.review.createdAt.toISOString() }
      : null,
  };
}

export const orderService = {
  getShippingQuote(governorate: string): ShippingQuote {
    const { zone, shippingFeeEgp } = resolveShippingFeeEgp(governorate);
    return { governorate, zone, shippingFeeEgp };
  },

  async createOrder(buyerId: string, input: CreateOrderInput): Promise<CreateOrderResult> {
    const { storeId, items, paymentMethod, address, notes } = input;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new AppError('المتجر غير موجود', 404);

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId, status: 'active' },
    });

    if (products.length !== items.length) {
      throw new AppError('بعض المنتجات غير متاحة أو لا تتبع هذا المتجر', 400);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    for (const line of items) {
      const product = productMap.get(line.productId)!;
      if (!product.madeToOrder && product.stockQty < line.qty) {
        throw new AppError(`الكمية المطلوبة من "${product.name}" غير متوفرة`, 400);
      }
      subtotal += Number(product.priceEgp) * line.qty;
    }

    const { shippingFeeEgp } = resolveShippingFeeEgp(address.governorate);
    const commissionEgp = Math.round((subtotal * config.commissionPct) / 100 * 100) / 100;
    const totalEgp = subtotal + shippingFeeEgp;

    const order = await prisma.$transaction(async (tx) => {
      for (const line of items) {
        const product = productMap.get(line.productId)!;
        if (!product.madeToOrder) {
          await tx.product.update({
            where: { id: product.id },
            data: { stockQty: { decrement: line.qty } },
          });
        }
      }

      return tx.order.create({
        data: {
          buyerId,
          storeId,
          paymentMethod,
          paymentStatus: paymentMethod === 'electronic' ? 'pending' : 'pending',
          subtotalEgp: subtotal,
          shippingFeeEgp,
          commissionEgp,
          totalEgp,
          addressSnapshot: address,
          notes: notes ?? null,
          items: {
            create: items.map((line) => {
              const product = productMap.get(line.productId)!;
              return {
                productId: line.productId,
                qty: line.qty,
                unitPrice: product.priceEgp,
                customizationSnapshot: (line.customization ?? undefined) as Prisma.InputJsonValue | undefined,
              };
            }),
          },
        },
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
              orderId: true,
              productId: true,
              qty: true,
              unitPrice: true,
              customizationSnapshot: true,
              product: { select: { id: true, name: true, images: true, priceEgp: true } },
            },
          },
          shipment: true,
          codOtp: { select: { confirmed: true, expiresAt: true } },
          review: true,
        },
      });
    });

    const refreshed = await orderRepository.findByIdForBuyer(order.id, buyerId);
    if (!refreshed) throw new AppError('تعذر تحميل الطلب', 500);

    const result: CreateOrderResult = {
      order: mapOrderDetail(refreshed),
    };

    if (paymentMethod === 'cod') {
      const code = generateCodOtpCode();
      const expiresAt = new Date(Date.now() + config.codOtpExpirySeconds * 1000);
      await orderRepository.upsertCodOtp(order.id, code, expiresAt);
      await smsService.sendOtp(address.phone, code);
      result.codOtpSent = true;
      if (config.nodeEnv === 'development') {
        result.codOtpDevCode = code;
      }
      result.order = mapOrderDetail(
        (await orderRepository.findByIdForBuyer(order.id, buyerId)) ?? refreshed
      );
    } else {
      result.paymentIntent = await paymentService.createIntent({
        orderId: order.id,
        amountEgp: totalEgp,
        phone: address.phone,
        name: address.name,
      });
    }

    return result;
  },

  async listBuyerOrders(buyerId: string, page: number, pageSize: number) {
    const [rows, total] = await orderRepository.listForBuyer(buyerId, page, pageSize);
    const items = rows.map((raw) => {
      const base = serializeOrder(raw);
      return {
        ...base,
        orderNumber: orderDisplayNumber(raw.id),
        createdAt: raw.createdAt.toISOString(),
        canReview: raw.status === 'delivered' && !raw.review,
        review: raw.review ?? null,
      };
    });
    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getBuyerOrder(buyerId: string, orderId: string) {
    const raw = await orderRepository.findByIdForBuyer(orderId, buyerId);
    if (!raw) throw new AppError('الطلب غير موجود', 404);
    return mapOrderDetail(raw);
  },

  async resendCodOtp(buyerId: string, orderId: string) {
    const order = await orderRepository.findByIdForBuyer(orderId, buyerId);
    if (!order) throw new AppError('الطلب غير موجود', 404);
    if (order.paymentMethod !== 'cod') {
      throw new AppError('هذا الطلب لا يستخدم الدفع عند الاستلام', 400);
    }
    const address = order.addressSnapshot as { phone: string };
    const code = generateCodOtpCode();
    const expiresAt = new Date(Date.now() + config.codOtpExpirySeconds * 1000);
    await orderRepository.upsertCodOtp(orderId, code, expiresAt);
    await smsService.sendOtp(address.phone, code);
    return {
      sent: true,
      expiresAt: expiresAt.toISOString(),
      ...(config.nodeEnv === 'development' ? { devCode: code } : {}),
    };
  },

  async confirmCodOtp(buyerId: string, orderId: string, code: string) {
    const order = await orderRepository.findByIdForBuyer(orderId, buyerId);
    if (!order) throw new AppError('الطلب غير موجود', 404);
    if (order.paymentMethod !== 'cod') {
      throw new AppError('هذا الطلب لا يستخدم الدفع عند الاستلام', 400);
    }

    const otp = await orderRepository.findCodOtp(orderId);
    if (!otp) throw new AppError('لم يتم إنشاء رمز تأكيد لهذا الطلب', 400);
    if (otp.confirmed) throw new AppError('تم تأكيد الطلب مسبقاً', 409);
    if (otp.expiresAt < new Date()) throw new AppError('انتهت صلاحية الرمز، اطلب رمزاً جديداً', 400);
    if (otp.code !== code) throw new AppError('رمز التأكيد غير صحيح', 400);

    await orderRepository.confirmCodOtp(orderId);
    if (order.status === 'new') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'confirmed' },
      });
    }

    return this.getBuyerOrder(buyerId, orderId);
  },

  async createReview(buyerId: string, orderId: string, input: CreateReviewInput) {
    const order = await orderRepository.findByIdForBuyer(orderId, buyerId);
    if (!order) throw new AppError('الطلب غير موجود', 404);
    if (order.status !== 'delivered') {
      throw new AppError('يمكنك التقييم بعد استلام الطلب فقط', 400);
    }
    if (order.review) throw new AppError('تم تقييم هذا الطلب مسبقاً', 409);

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          orderId,
          storeId: order.storeId,
          buyerId,
          rating: input.rating,
          comment: input.comment ?? null,
          images: input.images ?? [],
        },
      });

      const store = await tx.store.findUniqueOrThrow({ where: { id: order.storeId } });
      const newCount = store.ratingCount + 1;
      const newAvg = (store.ratingAvg * store.ratingCount + input.rating) / newCount;

      await tx.store.update({
        where: { id: order.storeId },
        data: { ratingCount: newCount, ratingAvg: newAvg },
      });

      return created;
    });

    return {
      id: review.id,
      orderId: review.orderId,
      storeId: review.storeId,
      buyerId: review.buyerId,
      rating: review.rating,
      comment: review.comment,
      images: review.images,
      createdAt: review.createdAt.toISOString(),
    };
  },

  listStoreReviews(storeId: string) {
    return orderRepository.listStoreReviews(storeId);
  },
};
