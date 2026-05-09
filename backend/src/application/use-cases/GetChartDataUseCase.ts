import { ProgressCalculator } from "../services/ProgressCalculator.js";
import type { IActivityRepository } from "../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../ports/ICompletionRepository.js";

export interface ChartPoint {
  date: string;
  progressPercentage: number;
  completedCount: number;
  totalActivities: number;
  hasData: boolean;
}

export class GetChartDataUseCase {
  private readonly calc = new ProgressCalculator();

  constructor(
    private readonly activityRepo: IActivityRepository,
    private readonly completionRepo: ICompletionRepository
  ) {}

  async execute(userId: string, from: Date, to: Date): Promise<ChartPoint[]> {
    const points: ChartPoint[] = [];
    const current = new Date(from);
    current.setHours(12, 0, 0, 0);

    const end = new Date(to);
    end.setHours(12, 0, 0, 0);

    while (current <= end) {
      const date = new Date(current);
      const dateStr = date.toISOString().slice(0, 10);

      const [activities, completions] = await Promise.all([
        this.activityRepo.findByUserId(userId, date),
        this.completionRepo.findByUserAndDate(userId, date),
      ]);

      if (activities.length > 0) {
        const result = this.calc.calculate(activities, completions);
        points.push({
          date: dateStr,
          progressPercentage: result.progressPercentage,
          completedCount: result.completedCount,
          totalActivities: result.totalActivities,
          hasData: true,
        });
      } else {
        points.push({
          date: dateStr,
          progressPercentage: 0,
          completedCount: 0,
          totalActivities: 0,
          hasData: false,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return points;
  }
}
