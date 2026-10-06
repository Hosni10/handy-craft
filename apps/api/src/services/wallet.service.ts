import { prisma } from '../lib/prisma.js';
import type { Prisma, WalletTransactionType } from '@prisma/client';
import type { WalletSummary } from '@handycraft/shared';

interface WalletMovement {
  userId: string;
  type: WalletTransactionType;
  amount: number;
  refType: string;
  refId: string;
  note: string;
}

export const walletService = {
  /** Apply a credit/debit and record it. Must run inside the caller's transaction. */
  async move(tx: Prisma.TransactionClient, m: WalletMovement) {
    const wallet = await tx.wallet.upsert({
      where: { userId: m.userId },
      update: {
        balanceEgp: m.type === 'credit' ? { increment: m.amount } : { decrement: m.amount },
      },
      create: { userId: m.userId, balanceEgp: m.type === 'credit' ? m.amount : -m.amount },
    });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: m.type,
        amount: m.amount,
        refType: m.refType,
        refId: m.refId,
        note: m.note,
      },
    });
  },

  async getSummary(userId: string): Promise<WalletSummary> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } },
    });
    return {
      balanceEgp: Number(wallet?.balanceEgp ?? 0),
      transactions: (wallet?.transactions ?? []).map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        refType: t.refType,
        refId: t.refId,
        note: t.note,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  },
};
