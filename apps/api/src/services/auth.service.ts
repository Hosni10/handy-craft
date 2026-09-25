/**
 * Auth service — OTP generation, JWT issuance, token refresh.
 *
 * OTP strategy:
 *  - In development (NODE_ENV !== 'production'), the OTP is always config.devOtp ("1234").
 *  - In production the service generates a random 4-digit code and hands it to smsService.
 *
 * Tokens:
 *  - Access token:  short-lived (15 min), stored in httpOnly cookie.
 *  - Refresh token: long-lived (30 d), stored in httpOnly cookie.
 */

import jwt from 'jsonwebtoken';
import { randomInt } from 'node:crypto';
import { config } from '../config/index.js';
import { smsService } from './sms.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { otpRepository } from '../repositories/otp.repository.js';
import { AppError } from '../lib/AppError.js';
import type { JwtPayload } from '../middlewares/auth.js';
import type { User } from '@prisma/client';
import type { StringValue } from 'ms';

function generateOtp(): string {
  if (config.nodeEnv !== 'production') {
    return config.devOtp; // always "1234" in dev
  }
  return String(randomInt(1000, 9999)).padStart(4, '0');
}

function signAccess(user: User): string {
  const payload: JwtPayload = { sub: user.id, role: user.role as JwtPayload['role'], phone: user.phone };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtAccessExpiresIn as StringValue });
}

function signRefresh(user: User): string {
  return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtRefreshExpiresIn as StringValue });
}

export const authService = {
  /** Step 1: send OTP to a phone number (creates user if first visit) */
  async sendOtp(phone: string): Promise<void> {
    // Find or create user (new users start as BUYER)
    let user = await userRepository.findByPhone(phone);
    if (!user) {
      // Default name from phone until they update profile
      user = await userRepository.create({ phone, name: `مستخدم ${phone.slice(-4)}` });
      // Create a wallet for the new buyer
      const { prisma } = await import('../lib/prisma.js');
      await prisma.wallet.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, balanceEgp: 0 },
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + config.otpExpirySeconds * 1000);
    await otpRepository.create(user.id, otp, expiresAt);
    await smsService.sendOtp(phone, otp);
  },

  /** Step 2: verify OTP → return access + refresh tokens */
  async verifyOtp(phone: string, code: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await userRepository.findByPhone(phone);
    if (!user) {
      throw new AppError('رقم الهاتف غير مسجل. أرسل طلب OTP أولاً.', 404);
    }

    const otpRecord = await otpRepository.findValid(user.id, code);
    if (!otpRecord) {
      throw new AppError('رمز التحقق غير صحيح أو منتهي الصلاحية', 401);
    }

    await otpRepository.markUsed(otpRecord.id);

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);
    return { accessToken, refreshToken, user };
  },

  /** Refresh access token using a valid refresh token */
  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: { sub: string };
    try {
      payload = jwt.verify(refreshToken, config.jwtSecret) as { sub: string };
    } catch {
      throw new AppError('جلسة العمل منتهية، يرجى تسجيل الدخول مرة أخرى', 401);
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw new AppError('المستخدم غير موجود', 404);

    const accessToken = signAccess(user);
    return { accessToken };
  },
};
