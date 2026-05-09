import type { DailyProgress } from "../domain/entities/DailyProgress.js";

export interface IProgressRepository {
  findByUserAndDate(userId: string, date: Date): Promise<DailyProgress | null>;
  findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<DailyProgress[]>;
  upsert(progress: Omit<DailyProgress, "id" | "createdAt" | "updatedAt">): Promise<DailyProgress>;
}
