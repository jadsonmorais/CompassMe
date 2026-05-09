import { atom } from "nanostores";

export type ActivityType = "ROUTINE" | "ONE_TIME" | "OPTIONAL";

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  weight: number;
  recurrence: string | null;
  scheduledDate: string | null;
  deadlineTime: string | null;
  isActive: boolean;
}

export const $activities = atom<Activity[]>([]);
export const $activitiesLoading = atom<boolean>(false);

export function setActivities(activities: Activity[]): void {
  $activities.set(activities);
}

export function addActivity(activity: Activity): void {
  $activities.set([...$activities.get(), activity]);
}

export function updateActivity(id: string, data: Partial<Activity>): void {
  $activities.set(
    $activities.get().map((a) => (a.id === id ? { ...a, ...data } : a))
  );
}

export function removeActivity(id: string): void {
  $activities.set($activities.get().filter((a) => a.id !== id));
}
