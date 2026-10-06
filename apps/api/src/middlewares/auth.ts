import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../lib/AppError.js';
import type { UserRole } from '@handycraft/shared';

export interface JwtPayload {
  sub: string;   // user id
  role: UserRole;
  phone: string;
}

// Augment Express Request so downstream code is typed
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Verify JWT from Authorization header (Bearer) or httpOnly cookie */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (!token) {
    throw new AppError('يجب تسجيل الدخول أولاً', 401);
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw new AppError('جلسة العمل منتهية، يرجى تسجيل الدخول مرة أخرى', 401);
  }
}

/** Guard a route to specific roles. Must be used after `authenticate`. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('يجب تسجيل الدخول أولاً', 401);
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError('غير مصرح لك بهذا الإجراء', 403);
    }
    next();
  };
}
