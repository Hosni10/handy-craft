import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError.js';
import type { ApiResponse } from '@craftsouq/shared';

// Arabic messages for common HTTP errors
const HTTP_MESSAGES: Record<number, string> = {
  400: 'طلب غير صحيح',
  401: 'يجب تسجيل الدخول أولاً',
  403: 'غير مصرح لك بهذا الإجراء',
  404: 'العنصر المطلوب غير موجود',
  409: 'تعارض في البيانات',
  422: 'بيانات غير صالحة',
  500: 'حدث خطأ داخلي في الخادم',
};

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => e.message).join('، ');
    const body: ApiResponse = { success: false, error: messages };
    res.status(422).json(body);
    return;
  }

  // Application errors (Arabic messages already attached)
  if (err instanceof AppError) {
    const body: ApiResponse = { success: false, error: err.message };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown errors — log and return generic Arabic message
  console.error('[ErrorHandler]', err);
  const body: ApiResponse = {
    success: false,
    error: HTTP_MESSAGES[500],
  };
  res.status(500).json(body);
};
