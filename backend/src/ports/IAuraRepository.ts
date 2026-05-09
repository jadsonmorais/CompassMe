import type { AuraHistory } from "../domain/entities/AuraHistory.js";

export interface IAuraRepository {
  findByUserAndDate(userId: string, date: Date): Promise<AuraHistory | null>;
  getTotalByUser(userId: string): Promise<number>;
  upsert(entry: Omit<AuraHistory, "id" | "createdAt">): Promise<AuraHistory>;
}
