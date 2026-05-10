import { ProgressCalculator } from "../services/ProgressCalculator.js";
import type { IActivityRepository } from "../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../ports/ICompletionRepository.js";

export interface ChartPoint {
  date: string;
  progressPercentage: number;
  completedCount: number;
  totalActivities: number;
  hasData: boolean;
  isFuture: boolean;    // projeção — sem completions reais
}

export class GetChartDataUseCase {
  private readonly calc = new ProgressCalculator();

  constructor(
    private readonly activityRepo: IActivityRepository,
    private readonly completionRepo: ICompletionRepository
  ) {}

  async execute(userId: string, from: Date, to: Date): Promise<ChartPoint[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const points: ChartPoint[] = [];
    const current = new Date(from);
    current.setHours(12, 0, 0, 0);

    const end = new Date(to);
    end.setHours(12, 0, 0, 0);

    while (current <= end) {
      const date = new Date(current);
      const dateStr = date.toISOString().slice(0, 10);
      const isFuture = dateStr > todayStr;

      const activities = await this.activityRepo.findByUserId(userId, date);

      if (activities.length === 0) {
        // Nenhuma atividade existia/existe neste dia — omite do gráfico
        current.setDate(current.getDate() + 1);
        continue;
      }

      if (isFuture) {
        // Projeção: mostra total de atividades previstas mas sem completions
        const result = this.calc.calculate(activities, []);
        points.push({
          date: dateStr,
          progressPercentage: 0,          // ainda não completou nada
          completedCount: 0,
          totalActivities: result.totalActivities,
          hasData: true,
          isFuture: true,
        });
      } else {
        // Passado/hoje: calcula com completions reais
        const completions = await this.completionRepo.findByUserAndDate(userId, date);
        const result = this.calc.calculate(activities, completions);
        points.push({
          date: dateStr,
          progressPercentage: result.progressPercentage,
          completedCount: result.completedCount,
          totalActivities: result.totalActivities,
          hasData: true,
          isFuture: false,
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return points;
  }
}
