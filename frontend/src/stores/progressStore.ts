import { atom } from "nanostores";

export interface DailyProgress {
  date: string;
  totalActivities: number;
  completedCount: number;
  skippedCount: number;
  dailyMultiplier: number;
  progressPercentage: number;
}

export interface AuraState {
  total: number;
  todayDelta: number;
}

export const $dailyProgress = atom<DailyProgress | null>(null);
export const $aura = atom<AuraState>({ total: 0, todayDelta: 0 });
export const $progressLoading = atom<boolean>(false);

export function setDailyProgress(progress: DailyProgress | null): void {
  $dailyProgress.set(progress);
}

export function setAura(aura: AuraState): void {
  $aura.set(aura);
}
