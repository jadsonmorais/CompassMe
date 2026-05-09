import type { Pool, QueryResult } from "pg";
import type { Goal, GoalPeriod } from "../../../domain/entities/Goal.js";
import type { IGoalsRepository } from "../../../ports/IGoalsRepository.js";

function mapRow(row: Record<string, unknown>): Goal {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    period: row.period as GoalPeriod,
    targetPercentage: parseFloat(row.target_percentage as string),
    isActive: row.is_active as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

const DEFAULTS: Record<GoalPeriod, number> = {
  DAILY: 80,
  WEEKLY: 75,
  MONTHLY: 70,
};

export class PgGoalsRepository implements IGoalsRepository {
  constructor(private readonly pool: Pool) {}

  async findByUser(userId: string): Promise<Goal[]> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM goals WHERE user_id = $1 AND is_active = true ORDER BY period",
      [userId]
    );
    const found = result.rows.map(mapRow);

    // Garante que todos os 3 períodos existam (seed de defaults na primeira consulta)
    const periods: GoalPeriod[] = ["DAILY", "WEEKLY", "MONTHLY"];
    const missing = periods.filter((p) => !found.some((g) => g.period === p));
    if (missing.length > 0) {
      await Promise.all(
        missing.map((p) =>
          this.upsert({ userId, period: p, targetPercentage: DEFAULTS[p], isActive: true })
        )
      );
      return this.findByUser(userId);
    }
    return found;
  }

  async findByUserAndPeriod(userId: string, period: GoalPeriod): Promise<Goal | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM goals WHERE user_id = $1 AND period = $2 AND is_active = true",
      [userId, period]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async upsert(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Promise<Goal> {
    const result: QueryResult = await this.pool.query(
      `INSERT INTO goals (user_id, period, target_percentage, is_active)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, period)
       DO UPDATE SET target_percentage = EXCLUDED.target_percentage,
                     is_active = EXCLUDED.is_active,
                     updated_at = NOW()
       RETURNING *`,
      [goal.userId, goal.period, goal.targetPercentage, goal.isActive]
    );
    return mapRow(result.rows[0]);
  }
}
