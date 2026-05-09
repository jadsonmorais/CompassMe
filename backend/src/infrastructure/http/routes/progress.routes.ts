import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { CalculateDailyProgressUseCase } from "../../../application/use-cases/CalculateDailyProgressUseCase.js";
import type { IActivityRepository } from "../../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../../ports/ICompletionRepository.js";
import type { IProgressRepository } from "../../../ports/IProgressRepository.js";
import type { IAuraRepository } from "../../../ports/IAuraRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export function createProgressRouter(
  activityRepo: IActivityRepository,
  completionRepo: ICompletionRepository,
  progressRepo: IProgressRepository,
  auraRepo: IAuraRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const dateParam = req.query.date as string | undefined;
      const date = dateParam ? new Date(dateParam) : new Date();

      const multiplierParam = req.query.multiplier as string | undefined;
      const dailyMultiplier = multiplierParam ? parseFloat(multiplierParam) : 1.0;

      const useCase = new CalculateDailyProgressUseCase(
        activityRepo,
        completionRepo,
        progressRepo,
        auraRepo
      );
      const result = await useCase.execute(userId, date, dailyMultiplier);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export function createAuraRouter(
  auraRepo: IAuraRepository,
  authMiddleware: (req: Request, res: Response, next: NextFunction) => void
): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const total = await auraRepo.getTotalByUser(userId);

      const dateParam = req.query.date as string | undefined;
      let todayEntry = null;
      if (dateParam) {
        todayEntry = await auraRepo.findByUserAndDate(userId, new Date(dateParam));
      }

      res.json({ auraTotal: total, todayEntry });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
