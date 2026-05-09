import { getAccessToken } from "./AuthService.ts";

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export type GoalPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export interface GoalStatus {
  period: GoalPeriod;
  targetPercentage: number;
  currentPercentage: number;
  onTrack: boolean;
  daysWithData: number;
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getGoals(): Promise<GoalStatus[]> {
  const res = await fetch(`${API}/goals`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json() as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { goals: GoalStatus[] };
  return data.goals;
}

export async function updateGoal(period: GoalPeriod, targetPercentage: number): Promise<void> {
  const res = await fetch(`${API}/goals`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ period, targetPercentage }),
  });
  if (!res.ok) {
    const d = await res.json() as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
}
