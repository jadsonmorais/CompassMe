import { getAccessToken } from "./AuthService.ts";

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export interface DailyProgressResponse {
  date: string;
  totalActivities: number;
  completedCount: number;
  skippedCount: number;
  progressPercentage: number;
  dailyMultiplier: number;
  auraEarned: number;
  auraTotal: number;
  auraReason: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  dailyMultiplier: number;
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getDailyProgress(
  date?: string,
  multiplier?: number
): Promise<DailyProgressResponse> {
  const url = new URL(`${API}/progress`);
  if (date) url.searchParams.set("date", date);
  if (multiplier !== undefined) url.searchParams.set("multiplier", String(multiplier));
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json() as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<DailyProgressResponse>;
}

export async function getMe(): Promise<UserProfile> {
  const res = await fetch(`${API}/users/me`, { headers: authHeaders() });
  if (!res.ok) {
    const data = await res.json() as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { user: UserProfile };
  return data.user;
}

export async function updateMultiplier(dailyMultiplier: number): Promise<UserProfile> {
  const res = await fetch(`${API}/users/me`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ dailyMultiplier }),
  });
  if (!res.ok) {
    const data = await res.json() as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { user: UserProfile };
  return data.user;
}
