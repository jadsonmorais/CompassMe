import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { ICompletionRepository } from "../../../ports/ICompletionRepository.js";
import type { IActivityRepository } from "../../../ports/IActivityRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const UpsertCompletionSchema = z.object({
  activityId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
  skipped: z.boolean().optional().default(false),
});

export function createCompletionsRouter(
  completionRepo: ICompletionRepository,
  activityRepo: IActivityRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const dateParam = req.query.date as string | undefined;
      const date = dateParam ? new Date(dateParam) : new Date();
      const completions = await completionRepo.findByUserAndDate(userId, date);
      res.json({ completions });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = UpsertCompletionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const activity = await activityRepo.findById(parsed.data.activityId);
      if (!activity || activity.userId !== userId) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      const date = new Date(parsed.data.date);
      const completion = await completionRepo.upsert({
        activityId: parsed.data.activityId,
        userId,
        completedDate: date,
        completedAt: parsed.data.completed ? new Date() : null,
        skipped: parsed.data.skipped,
      });
      res.status(201).json({ completion });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
