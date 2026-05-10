import type { Pool, QueryResult } from "pg";
import type { Activity } from "../../../domain/entities/Activity.js";
import type { IActivityRepository } from "../../../ports/IActivityRepository.js";

function mapRow(row: Record<string, unknown>): Activity {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    description: row.description as string | null,
    type: row.type as Activity["type"],
    weight: parseFloat(row.weight as string),
    recurrence: row.recurrence as string | null,
    scheduledDate: row.scheduled_date ? new Date(row.scheduled_date as string) : null,
    deadlineTime: row.deadline_time as string | null,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class PgActivityRepository implements IActivityRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<Activity | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM activities WHERE id = $1",
      [id]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByUserId(userId: string, date?: Date): Promise<Activity[]> {
    let query = "SELECT * FROM activities WHERE user_id = $1 AND is_active = true";
    const params: unknown[] = [userId];

    if (date) {
      const dateStr = date.toISOString().slice(0, 10);
      // Atividades criadas até aquela data
      query += " AND created_at::date <= $2";
      // ROUTINE/OPTIONAL: sem data específica (scheduled_date IS NULL)
      // ONE_TIME: apenas na data exata agendada
      query += " AND (type != 'ONE_TIME' OR scheduled_date = $2)";
      params.push(dateStr);
    }

    query += " ORDER BY created_at DESC";
    const result: QueryResult = await this.pool.query(query, params);
    const activities = result.rows.map(mapRow);

    if (!date) return activities;

    const dow = date.getDay(); // 0=Dom … 6=Sáb
    return activities.filter((a) => {
      if (!a.recurrence?.startsWith("WEEKLY:")) return true;
      const days = a.recurrence.replace("WEEKLY:", "").split(",").map(Number);
      return days.includes(dow);
    });
  }

  async create(
    activity: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ): Promise<Activity> {
    const result: QueryResult = await this.pool.query(
      `INSERT INTO activities
       (user_id, title, description, type, weight, recurrence, scheduled_date, deadline_time, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        activity.userId,
        activity.title,
        activity.description,
        activity.type,
        activity.weight,
        activity.recurrence,
        activity.scheduledDate,
        activity.deadlineTime,
        activity.isActive,
      ]
    );
    return mapRow(result.rows[0]);
  }

  async update(
    id: string,
    data: Partial<Omit<Activity, "id" | "createdAt">>
  ): Promise<Activity | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const mappings: Record<string, string> = {
      userId: "user_id",
      title: "title",
      description: "description",
      type: "type",
      weight: "weight",
      recurrence: "recurrence",
      scheduledDate: "scheduled_date",
      deadlineTime: "deadline_time",
      isActive: "is_active",
    };

    for (const [key, col] of Object.entries(mappings)) {
      if ((data as Record<string, unknown>)[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        values.push((data as Record<string, unknown>)[key]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result: QueryResult = await this.pool.query(
      `UPDATE activities SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result: QueryResult = await this.pool.query(
      "UPDATE activities SET is_active = false, updated_at = NOW() WHERE id = $1",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
