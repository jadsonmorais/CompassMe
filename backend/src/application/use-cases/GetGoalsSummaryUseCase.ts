import type { IGoalsRepository } from "../../ports/IGoalsRepository.js";
import type { IProgressRepository } from "../../ports/IProgressRepository.js";
import type { GoalPeriod } from "../../domain/entities/Goal.js";

export interface GoalStatus {
  period: GoalPeriod;
  targetPercentage: number;
  currentPercentage: number;
  onTrack: boolean;
  daysWithData: number;
}

export interface GoalsSummary {
  goals: GoalStatus[];
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export class GetGoalsSummaryUseCase {
  constructor(
    private readonly goalsRepo: IGoalsRepository,
    private readonly progressRepo: IProgressRepository
  ) {}

  async execute(userId: string, today: Date): Promise<GoalsSummary> {
    const goals = await this.goalsRepo.findByUser(userId);

    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);

    const [dailyRows, weeklyRows, monthlyRows] = await Promise.all([
      this.progressRepo.findByUserAndDateRange(userId, today, today),
      this.progressRepo.findByUserAndDateRange(userId, weekStart, today),
      this.progressRepo.findByUserAndDateRange(userId, monthStart, today),
    ]);

    const avg = (rows: { progressPercentage: number }[]): number =>
      rows.length === 0
        ? 0
        : Math.round((rows.reduce((s, r) => s + r.progressPercentage, 0) / rows.length) * 100) / 100;

    const statuses: GoalStatus[] = goals.map((g) => {
      let rows: { progressPercentage: number }[];
      if (g.period === "DAILY") rows = dailyRows;
      else if (g.period === "WEEKLY") rows = weeklyRows;
      else rows = monthlyRows;

      const current = avg(rows);
      return {
        period: g.period,
        targetPercentage: g.targetPercentage,
        currentPercentage: current,
        onTrack: current >= g.targetPercentage,
        daysWithData: rows.length,
      };
    });

    return { goals: statuses };
  }
}
