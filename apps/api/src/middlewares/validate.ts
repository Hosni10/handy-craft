import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

type Target = 'body' | 'query' | 'params';

/**
 * Express middleware factory that validates request data against a Zod schema.
 * On failure, it throws and the global errorHandler converts ZodError → 422.
 */
export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    req[target] = schema.parse(req[target]);
    next();
  };
}
