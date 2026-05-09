export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  totalActivities: number;
  completedCount: number;
  skippedCount: number;
  dailyMultiplier: number;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}
