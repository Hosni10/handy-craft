import { prisma } from '../lib/prisma.js';

export const otpRepository = {
  /** Create an OTP code for a user, invalidating any previous unused codes */
  async create(userId: string, code: string, expiresAt: Date) {
    // Mark previous codes for this user as used
    await prisma.otpCode.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
    return prisma.otpCode.create({ data: { userId, code, expiresAt } });
  },

  /** Find the latest valid (unused, non-expired) OTP for a user */
  findValid(userId: string, code: string) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  markUsed(id: string) {
    return prisma.otpCode.update({ where: { id }, data: { used: true } });
  },
};
