import type { Goal, GoalPeriod } from "../domain/entities/Goal.js";

export interface IGoalsRepository {
  findByUser(userId: string): Promise<Goal[]>;
  findByUserAndPeriod(userId: string, period: GoalPeriod): Promise<Goal | null>;
  upsert(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal>;
}
