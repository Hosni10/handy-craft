import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { userRepository } from '../repositories/user.repository.js';
import { ok, created } from '../lib/response.js';
import { AppError } from '../lib/AppError.js';

// Cookie options — httpOnly, sameSite, secure in prod
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export const authController = {
  /** POST /auth/send-otp */
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { phone } = req.body as { phone: string };
    await authService.sendOtp(phone);
    ok(res, { message: 'تم إرسال رمز التحقق إلى هاتفك' });
  },

  /** POST /auth/verify-otp */
  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { phone, otp } = req.body as { phone: string; otp: string };
    const { accessToken, refreshToken, user } = await authService.verifyOtp(phone, otp);

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 30 * 24 * 60 * 60 * 1000 });

    ok(res, {
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        governorate: user.governorate,
        avatar: user.avatar,
      },
      accessToken, // also return in body for non-cookie clients
    });
  },

  /** POST /auth/refresh */
  async refresh(req: Request, res: Response): Promise<void> {
    const token = (req.cookies?.refreshToken as string | undefined) ?? (req.body as { refreshToken?: string }).refreshToken;
    if (!token) throw new AppError('لا يوجد رمز تحديث', 401);
    const { accessToken } = await authService.refresh(token);
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    ok(res, { accessToken });
  },

  /** POST /auth/logout */
  logout(req: Request, res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    ok(res, { message: 'تم تسجيل الخروج بنجاح' });
  },

  /** GET /auth/me */
  async me(req: Request, res: Response): Promise<void> {
    const user = await userRepository.findById(req.user!.sub);
    if (!user) throw new AppError('المستخدم غير موجود', 404);
    ok(res, {
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      governorate: user.governorate,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  },
};
