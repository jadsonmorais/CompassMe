import type { Pool, QueryResult } from "pg";
import type { DailyProgress } from "../../../domain/entities/DailyProgress.js";
import type { IProgressRepository } from "../../../ports/IProgressRepository.js";

function mapRow(row: Record<string, unknown>): DailyProgress {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: new Date(row.date as string),
    totalActivities: row.total_activities as number,
    completedCount: row.completed_count as number,
    skippedCount: row.skipped_count as number,
    dailyMultiplier: parseFloat(row.daily_multiplier as string),
    progressPercentage: parseFloat(row.progress_percentage as string),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class PgProgressRepository implements IProgressRepository {
  constructor(private readonly pool: Pool) {}

  async findByUserAndDate(userId: string, date: Date): Promise<DailyProgress | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM daily_progress WHERE user_id = $1 AND date = $2",
      [userId, date.toISOString().slice(0, 10)]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByUserAndDateRange(userId: string, from: Date, to: Date): Promise<DailyProgress[]> {
    const result: QueryResult = await this.pool.query(
      `SELECT * FROM daily_progress
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date DESC`,
      [userId, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10)]
    );
    return result.rows.map(mapRow);
  }

  async upsert(
    progress: Omit<DailyProgress, "id" | "createdAt" | "updatedAt">
  ): Promise<DailyProgress> {
    const dateStr = progress.date.toISOString().slice(0, 10);
    const result: QueryResult = await this.pool.query(
      `INSERT INTO daily_progress
         (user_id, date, total_activities, completed_count, skipped_count, daily_multiplier, progress_percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, date)
       DO UPDATE SET
         total_activities   = EXCLUDED.total_activities,
         completed_count    = EXCLUDED.completed_count,
         skipped_count      = EXCLUDED.skipped_count,
         daily_multiplier   = EXCLUDED.daily_multiplier,
         progress_percentage = EXCLUDED.progress_percentage,
         updated_at         = NOW()
       RETURNING *`,
      [
        progress.userId,
        dateStr,
        progress.totalActivities,
        progress.completedCount,
        progress.skippedCount,
        progress.dailyMultiplier,
        progress.progressPercentage,
      ]
    );
    return mapRow(result.rows[0]);
  }
}
