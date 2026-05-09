import type { Activity } from "../../domain/entities/Activity.js";
import type { ActivityCompletion } from "../../domain/entities/ActivityCompletion.js";

export interface ProgressResult {
  totalActivities: number;
  completedCount: number;
  skippedCount: number;
  progressPercentage: number;
}

export class ProgressCalculator {
  /**
   * Calcula o progresso diário.
   *
   * Regras:
   * - Atividades OPTIONAL não entram no denominador
   * - progressPercentage = (completedCount / denominator) * 100, clampado a [0, 100]
   * - dailyMultiplier não altera a percentagem — é aplicado externamente na Aura
   */
  calculate(
    activities: Activity[],
    completions: ActivityCompletion[]
  ): ProgressResult {
    const active = activities.filter((a) => a.isActive);
    const mandatory = active.filter((a) => a.type !== "OPTIONAL");
    const totalActivities = active.length;

    const completedIds = new Set(
      completions
        .filter((c) => c.completedAt !== null && !c.skipped)
        .map((c) => c.activityId)
    );
    const skippedIds = new Set(
      completions.filter((c) => c.skipped).map((c) => c.activityId)
    );

    const completedCount = active.filter((a) => completedIds.has(a.id)).length;
    const skippedCount = active.filter((a) => skippedIds.has(a.id)).length;

    const denominator = mandatory.length;
    const completedMandatory = mandatory.filter((a) => completedIds.has(a.id)).length;

    const progressPercentage =
      denominator === 0
        ? 100
        : Math.min(100, Math.round((completedMandatory / denominator) * 10000) / 100);

    return { totalActivities, completedCount, skippedCount, progressPercentage };
  }
}
