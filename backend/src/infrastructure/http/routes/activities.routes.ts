import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { IActivityRepository } from "../../../ports/IActivityRepository.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const CreateActivitySchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).nullish(),
  type: z.enum(["ROUTINE", "ONE_TIME", "OPTIONAL"]),
  weight: z.number().min(0.1).max(5).optional().default(1.0),
  recurrence: z.string().nullish(),
  scheduledDate: z.string().nullish(),
  deadlineTime: z.string().nullish(),
});

const UpdateActivitySchema = CreateActivitySchema.partial();

export function createActivitiesRouter(
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
      const activities = await activityRepo.findByUserId(userId, date);
      res.json({ activities });
    } catch (err) {
      next(err);
    }
  });

  // Lista todas as atividades sem filtro de data (para gerenciamento)
  router.get("/all", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const activities = await activityRepo.findByUserId(userId);
      res.json({ activities });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const activity = await activityRepo.findById(req.params.id);
      if (!activity || activity.userId !== userId) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      res.json({ activity });
    } catch (err) {
      next(err);
    }
  });

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = CreateActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { scheduledDate, ...rest } = parsed.data;
      const activity = await activityRepo.create({
        ...rest,
        userId,
        description: rest.description ?? null,
        recurrence: rest.recurrence ?? null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        deadlineTime: rest.deadlineTime ?? null,
        isActive: true,
      });
      res.status(201).json({ activity });
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
    const parsed = UpdateActivitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const existing = await activityRepo.findById(req.params.id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      const { scheduledDate, ...rest } = parsed.data;
      const updated = await activityRepo.update(req.params.id, {
        ...rest,
        description: rest.description ?? null,
        recurrence: rest.recurrence ?? null,
        deadlineTime: rest.deadlineTime ?? null,
        scheduledDate: scheduledDate === undefined
          ? undefined
          : scheduledDate
            ? new Date(scheduledDate)
            : null,
      });
      res.json({ activity: updated });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const existing = await activityRepo.findById(req.params.id);
      if (!existing || existing.userId !== userId) {
        res.status(404).json({ error: "Activity not found" });
        return;
      }
      await activityRepo.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
