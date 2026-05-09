import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GetGoalsSummaryUseCase } from "../../../application/use-cases/GetGoalsSummaryUseCase.js";
import type { IGoalsRepository } from "../../../ports/IGoalsRepository.js";
import type { IProgressRepository } from "../../../ports/IProgressRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const UpdateGoalSchema = z.object({
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  targetPercentage: z.number().min(0).max(100),
});

export function createGoalsRouter(
  goalsRepo: IGoalsRepository,
  progressRepo: IProgressRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  // GET /goals — retorna metas + progresso atual vs target
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const today = new Date();
      const useCase = new GetGoalsSummaryUseCase(goalsRepo, progressRepo);
      const summary = await useCase.execute(userId, today);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  });

  // PUT /goals — atualiza target de um período
  router.put("/", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = UpdateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const goal = await goalsRepo.upsert({
        userId,
        period: parsed.data.period,
        targetPercentage: parsed.data.targetPercentage,
        isActive: true,
      });
      res.json({ goal });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
