import type { Response } from 'express';
import type { ApiResponse } from '@handycraft/shared';

/** Send a successful JSON response */
export function ok<T>(res: Response, data: T, status = 200): void {
  const body: ApiResponse<T> = { success: true, data };
  res.status(status).json(body);
}

/** Send a created (201) JSON response */
export function created<T>(res: Response, data: T): void {
  ok(res, data, 201);
}

/** Send an error JSON response */
export function fail(res: Response, message: string, status = 400): void {
  const body: ApiResponse = { success: false, error: message };
  res.status(status).json(body);
}
