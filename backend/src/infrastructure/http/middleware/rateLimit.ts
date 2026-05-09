import type { Request, Response, NextFunction } from "express";

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();
const WINDOW_MS = 60_000;

export function createRateLimiter(maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
      next();
      return;
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res
        .status(429)
        .set("Retry-After", String(retryAfter))
        .json({ error: "Too many requests", retryAfter });
      return;
    }

    entry.count += 1;
    next();
  };
}
