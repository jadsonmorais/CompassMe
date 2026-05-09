export interface ActivityCompletion {
  id: string;
  activityId: string;
  userId: string;
  completedDate: Date;
  completedAt: Date | null;
  skipped: boolean;
  createdAt: Date;
}
