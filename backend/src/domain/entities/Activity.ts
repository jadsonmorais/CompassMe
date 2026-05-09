export type ActivityType = "ROUTINE" | "ONE_TIME" | "OPTIONAL";

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: ActivityType;
  weight: number;
  recurrence: string | null;
  scheduledDate: Date | null;
  deadlineTime: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
