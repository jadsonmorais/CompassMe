import type { Request, Response, NextFunction } from "express";
import type { IJwtProvider } from "../../../ports/IJwtProvider.js";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function createAuthMiddleware(
  jwtProvider: IJwtProvider,
  tokenBlacklist: Set<string>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = header.slice(7);

    if (tokenBlacklist.has(token)) {
      res.status(401).json({ error: "Token has been revoked" });
      return;
    }

    try {
      const payload = jwtProvider.verify(token);
      (req as AuthenticatedRequest).userId = payload.sub as string;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}
