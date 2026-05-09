import type { Pool, QueryResult } from "pg";
import type { AuraHistory } from "../../../domain/entities/AuraHistory.js";
import type { IAuraRepository } from "../../../ports/IAuraRepository.js";

function mapRow(row: Record<string, unknown>): AuraHistory {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: new Date(row.date as string),
    auraDelta: row.aura_delta as number,
    auraTotal: row.aura_total as number,
    reason: row.reason as string | null,
    createdAt: row.created_at as Date,
  };
}

export class PgAuraRepository implements IAuraRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserAndDate(userId: string, date: Date): Promise<AuraHistory | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM aura_history WHERE user_id = $1 AND date = $2",
      [userId, date.toISOString().slice(0, 10)]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async getTotalByUser(userId: string): Promise<number> {
    const result: QueryResult = await this.pool.query(
      "SELECT COALESCE(SUM(aura_delta), 0) AS total FROM aura_history WHERE user_id = $1",
      [userId]
    );
    return parseInt(result.rows[0]?.total ?? "0", 10);
  }

  async upsert(entry: Omit<AuraHistory, "id" | "createdAt">): Promise<AuraHistory> {
    const dateStr = entry.date.toISOString().slice(0, 10);
    const result: QueryResult = await this.pool.query(
      `INSERT INTO aura_history (user_id, date, aura_delta, aura_total, reason)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, date)
       DO UPDATE SET aura_delta = EXCLUDED.aura_delta, aura_total = EXCLUDED.aura_total, reason = EXCLUDED.reason
       RETURNING *`,
      [entry.userId, dateStr, entry.auraDelta, entry.auraTotal, entry.reason]
    );
    return mapRow(result.rows[0]);
  }
}
