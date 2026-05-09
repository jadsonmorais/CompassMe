import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { IUserRepository } from "../../../ports/IUserRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const UpdateProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  dailyMultiplier: z.number().min(1.0).max(2.0).optional(),
});

export function createUsersRouter(
  userRepo: IUserRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const user = await userRepo.findById(userId);
      if (!user) { res.status(404).json({ error: "User not found" }); return; }
      const { passwordHash: _, ...safe } = user;
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  });

  router.patch("/me", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const updated = await userRepo.update(userId, parsed.data);
      if (!updated) { res.status(404).json({ error: "User not found" }); return; }
      const { passwordHash: _, ...safe } = updated;
      res.json({ user: safe });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
