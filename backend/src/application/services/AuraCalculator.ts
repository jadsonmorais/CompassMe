export type AuraReason = "all_completed" | "partial" | "none";

export interface AuraDelta {
  delta: number;
  reason: AuraReason;
}

export class AuraCalculator {
  /**
   * Regras:
   * - 100%  → +5 aura  (all_completed)
   * - >0%   → +2 aura  (partial)
   * - 0%    → -1 aura  (none)
   * O total nunca vai abaixo de 0 (aplicado ao persistir).
   */
  calculate(progressPercentage: number, dailyMultiplier: number): AuraDelta {
    let delta: number;
    let reason: AuraReason;

    if (progressPercentage >= 100) {
      delta = 5;
      reason = "all_completed";
    } else if (progressPercentage > 0) {
      delta = 2;
      reason = "partial";
    } else {
      delta = -1;
      reason = "none";
    }

    // Multiplicador só amplifica ganhos positivos, nunca aumenta penalidade
    if (delta > 0) {
      delta = Math.round(delta * dailyMultiplier);
    }

    return { delta, reason };
  }
}
