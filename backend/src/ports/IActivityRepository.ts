import type { Activity } from "../domain/entities/Activity.js";

export interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  findByUserId(userId: string, date?: Date): Promise<Activity[]>;
  create(activity: Omit<Activity, "id" | "createdAt" | "updatedAt">): Promise<Activity>;
  update(id: string, data: Partial<Omit<Activity, "id" | "createdAt">>): Promise<Activity | null>;
  delete(id: string): Promise<boolean>;
}
