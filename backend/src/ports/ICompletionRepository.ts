import type { ActivityCompletion } from "../domain/entities/ActivityCompletion.js";

export interface ICompletionRepository {
  findByActivityAndDate(activityId: string, date: Date): Promise<ActivityCompletion | null>;
  findByUserAndDate(userId: string, date: Date): Promise<ActivityCompletion[]>;
  upsert(completion: Omit<ActivityCompletion, "id" | "createdAt">): Promise<ActivityCompletion>;
}
