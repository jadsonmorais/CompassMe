import type { Pool, QueryResult } from "pg";
import type { User } from "../../../domain/entities/User.js";
import type { IUserRepository } from "../../../ports/IUserRepository.js";

function mapRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    displayName: row.display_name as string | null,
    dailyMultiplier: parseFloat((row.daily_multiplier as string | number | undefined)?.toString() ?? "1"),
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  };
}

export class PgUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result: QueryResult = await this.pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const result: QueryResult = await this.pool.query(
      `INSERT INTO users (email, password_hash, display_name, daily_multiplier)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.email, user.passwordHash, user.displayName, user.dailyMultiplier ?? 1.0]
    );
    return mapRow(result.rows[0]);
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email);
    }
    if (data.passwordHash !== undefined) {
      fields.push(`password_hash = $${idx++}`);
      values.push(data.passwordHash);
    }
    if (data.displayName !== undefined) {
      fields.push(`display_name = $${idx++}`);
      values.push(data.displayName);
    }
    if (data.dailyMultiplier !== undefined) {
      fields.push(`daily_multiplier = $${idx++}`);
      values.push(data.dailyMultiplier);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result: QueryResult = await this.pool.query(
      `UPDATE users SET ${fields.join(", ")}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING *`,
      values
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }
}
