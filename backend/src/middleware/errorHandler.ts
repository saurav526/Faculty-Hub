import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      issues: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (config.isDev) console.error(err);

  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ error: message });
}
