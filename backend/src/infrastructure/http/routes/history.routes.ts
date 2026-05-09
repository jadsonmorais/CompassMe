import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { GetHistoryUseCase } from "../../../application/use-cases/GetHistoryUseCase.js";
import { GetChartDataUseCase } from "../../../application/use-cases/GetChartDataUseCase.js";
import type { IActivityRepository } from "../../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../../ports/ICompletionRepository.js";
import type { IProgressRepository } from "../../../ports/IProgressRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const HistoryQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  type: z.enum(["ROUTINE", "ONE_TIME", "OPTIONAL"]).optional(),
  status: z.enum(["completed", "pending", "skipped"]).optional(),
  offset: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(50).optional().default(50),
});

export function createHistoryRouter(
  activityRepo: IActivityRepository,
  completionRepo: ICompletionRepository,
  progressRepo: IProgressRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = HistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const from = parsed.data.from ? new Date(parsed.data.from) : thirtyDaysAgo;
      const to = parsed.data.to ? new Date(parsed.data.to) : today;

      const useCase = new GetHistoryUseCase(activityRepo, completionRepo, progressRepo);
      const result = await useCase.execute(userId, {
        from,
        to,
        type: parsed.data.type,
        status: parsed.data.status,
        offset: parsed.data.offset,
        limit: parsed.data.limit,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  // GET /history/chart — calcula progresso por dia direto das atividades+completions
  router.get("/chart", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const today = new Date();
      const fourteenAgo = new Date(today);
      fourteenAgo.setDate(today.getDate() - 13);

      const from = req.query.from ? new Date(req.query.from as string) : fourteenAgo;
      const to   = req.query.to   ? new Date(req.query.to as string)   : today;

      const useCase = new GetChartDataUseCase(activityRepo, completionRepo);
      const points  = await useCase.execute(userId, from, to);
      res.json({ points });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
