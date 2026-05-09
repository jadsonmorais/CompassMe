import type { IActivityRepository } from "../../ports/IActivityRepository.js";
import type { ICompletionRepository } from "../../ports/ICompletionRepository.js";
import type { IProgressRepository } from "../../ports/IProgressRepository.js";
import type { ActivityType } from "../../domain/entities/Activity.js";

export type CompletionStatus = "completed" | "pending" | "skipped";

export interface HistoryFilter {
  from: Date;
  to: Date;
  type?: ActivityType;
  status?: CompletionStatus;
  offset: number;
  limit: number;
}

export interface HistoryDayEntry {
  date: string;
  progressPercentage: number;
  totalActivities: number;
  completedCount: number;
  activities: {
    id: string;
    title: string;
    type: ActivityType;
    status: CompletionStatus;
    completedAt: string | null;
  }[];
}

export interface HistoryResult {
  entries: HistoryDayEntry[];
  hasMore: boolean;
  total: number;
}

export class GetHistoryUseCase {
  constructor(
    private readonly activityRepo: IActivityRepository,
    private readonly completionRepo: ICompletionRepository,
    private readonly progressRepo: IProgressRepository
  ) {}

  async execute(userId: string, filter: HistoryFilter): Promise<HistoryResult> {
    const progressRows = await this.progressRepo.findByUserAndDateRange(
      userId,
      filter.from,
      filter.to
    );

    // Aplica paginação sobre dias com registro de progresso
    const total = progressRows.length;
    const paged = progressRows.slice(filter.offset, filter.offset + filter.limit);
    const hasMore = filter.offset + filter.limit < total;

    const entries: HistoryDayEntry[] = await Promise.all(
      paged.map(async (p) => {
        const completions = await this.completionRepo.findByUserAndDate(userId, p.date);
        const activities = await this.activityRepo.findByUserId(userId, p.date);

        const completionMap = new Map(completions.map((c) => [c.activityId, c]));

        const activityRows = activities
          .map((a) => {
            const c = completionMap.get(a.id);
            let status: CompletionStatus;
            if (c?.skipped) status = "skipped";
            else if (c?.completedAt) status = "completed";
            else status = "pending";

            return {
              id: a.id,
              title: a.title,
              type: a.type,
              status,
              completedAt: c?.completedAt?.toISOString() ?? null,
            };
          })
          .filter((a) => {
            if (filter.type && a.type !== filter.type) return false;
            if (filter.status && a.status !== filter.status) return false;
            return true;
          });

        return {
          date: p.date.toISOString().slice(0, 10),
          progressPercentage: p.progressPercentage,
          totalActivities: p.totalActivities,
          completedCount: p.completedCount,
          activities: activityRows,
        };
      })
    );

    // Se filtro de type/status estava ativo, remove dias sem atividades correspondentes
    const filtered = filter.type ?? filter.status
      ? entries.filter((e) => e.activities.length > 0)
      : entries;

    return { entries: filtered, hasMore, total };
  }
}
