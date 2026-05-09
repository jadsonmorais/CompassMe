import { ProgressCalculator } from "../services/ProgressCalculator.js";
import { AuraCalculator } from "../services/AuraCalculator.js";
import type { IActivityRepository } from "../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../ports/ICompletionRepository.js";
import type { IProgressRepository } from "../../ports/IProgressRepository.js";
import type { IAuraRepository } from "../../ports/IAuraRepository.js";

export interface DailyProgressResponse {
  date: string;
  totalActivities: number;
  completedCount: number;
  skippedCount: number;
  progressPercentage: number;
  dailyMultiplier: number;
  auraEarned: number;
  auraTotal: number;
  auraReason: string;
}

export class CalculateDailyProgressUseCase {
  private readonly progressCalc = new ProgressCalculator();
  private readonly auraCalc = new AuraCalculator();

  constructor(
    private readonly activityRepo: IActivityRepository,
    private readonly completionRepo: ICompletionRepository,
    private readonly progressRepo: IProgressRepository,
    private readonly auraRepo: IAuraRepository
  ) {}

  async execute(
    userId: string,
    date: Date,
    dailyMultiplier = 1.0
  ): Promise<DailyProgressResponse> {
    const [activities, completions] = await Promise.all([
      this.activityRepo.findByUserId(userId, date),
      this.completionRepo.findByUserAndDate(userId, date),
    ]);

    const result = this.progressCalc.calculate(activities, completions);
    const { delta, reason } = this.auraCalc.calculate(
      result.progressPercentage,
      dailyMultiplier
    );

    const currentTotal = await this.auraRepo.getTotalByUser(userId);
    const newTotal = Math.max(0, currentTotal + delta);

    const [savedProgress, savedAura] = await Promise.all([
      this.progressRepo.upsert({
        userId,
        date,
        totalActivities: result.totalActivities,
        completedCount: result.completedCount,
        skippedCount: result.skippedCount,
        dailyMultiplier,
        progressPercentage: result.progressPercentage,
      }),
      this.auraRepo.upsert({
        userId,
        date,
        auraDelta: delta,
        auraTotal: newTotal,
        reason,
      }),
    ]);

    return {
      date: date.toISOString().slice(0, 10),
      totalActivities: savedProgress.totalActivities,
      completedCount: savedProgress.completedCount,
      skippedCount: savedProgress.skippedCount,
      progressPercentage: savedProgress.progressPercentage,
      dailyMultiplier: savedProgress.dailyMultiplier,
      auraEarned: savedAura.auraDelta,
      auraTotal: savedAura.auraTotal,
      auraReason: savedAura.reason ?? reason,
    };
  }
}
