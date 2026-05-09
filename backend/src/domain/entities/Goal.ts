export type GoalPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export interface Goal {
  id: string;
  userId: string;
  period: GoalPeriod;
  targetPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
