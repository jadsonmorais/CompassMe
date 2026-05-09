import type { Pool, QueryResult } from "pg";
import type { ActivityCompletion } from "../../../domain/entities/ActivityCompletion.js";
import type { ICompletionRepository } from "../../../ports/ICompletionRepository.js";

function mapRow(row: Record<string, unknown>): ActivityCompletion {
  return {
    id: row.id as string,
    activityId: row.activity_id as string,
    userId: row.user_id as string,
    completedDate: new Date(row.completed_date as string),
    completedAt: row.completed_at ? new Date(row.completed_at as string) : null,
    skipped: row.skipped as boolean,
    createdAt: row.created_at as Date,
  };
}

export class PgCompletionRepository implements ICompletionRepository {
  constructor(private readonly pool: Pool) {}

  async findByActivityAndDate(activityId: string, date: Date): Promise<ActivityCompletion | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM activity_completions WHERE activity_id = $1 AND completed_date = $2",
      [activityId, date.toISOString().slice(0, 10)]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByUserAndDate(userId: string, date: Date): Promise<ActivityCompletion[]> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM activity_completions WHERE user_id = $1 AND completed_date = $2",
      [userId, date.toISOString().slice(0, 10)]
    );
    return result.rows.map(mapRow);
  }

  async upsert(
    completion: Omit<ActivityCompletion, "id" | "createdAt">
  ): Promise<ActivityCompletion> {
    const dateStr = completion.completedDate.toISOString().slice(0, 10);
    const result: QueryResult = await this.pool.query(
      `INSERT INTO activity_completions (activity_id, user_id, completed_date, completed_at, skipped)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (activity_id, completed_date)
       DO UPDATE SET
         completed_at = EXCLUDED.completed_at,
         skipped = EXCLUDED.skipped
       RETURNING *`,
      [
        completion.activityId,
        completion.userId,
        dateStr,
        completion.completedAt,
        completion.skipped,
      ]
    );
    return mapRow(result.rows[0]);
  }
}
