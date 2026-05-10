import { getAccessToken } from "./AuthService.ts";

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export type ActivityType = "ROUTINE" | "ONE_TIME" | "OPTIONAL";
export type CompletionStatus = "completed" | "pending" | "skipped";

export interface HistoryActivity {
  id: string;
  title: string;
  type: ActivityType;
  status: CompletionStatus;
  completedAt: string | null;
}

export interface HistoryEntry {
  date: string;
  progressPercentage: number;
  totalActivities: number;
  completedCount: number;
  activities: HistoryActivity[];
}

export interface HistoryResult {
  entries: HistoryEntry[];
  hasMore: boolean;
  total: number;
}

export interface HistoryFilter {
  from?: string;
  to?: string;
  type?: ActivityType;
  status?: CompletionStatus;
  offset?: number;
  limit?: number;
}

export interface ChartPoint {
  date: string;
  progressPercentage: number;
  completedCount: number;
  totalActivities: number;
  hasData: boolean;
  isFuture: boolean;
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getHistory(filter: HistoryFilter = {}): Promise<HistoryResult> {
  const url = new URL(`${API}/history`);
  if (filter.from) url.searchParams.set("from", filter.from);
  if (filter.to) url.searchParams.set("to", filter.to);
  if (filter.type) url.searchParams.set("type", filter.type);
  if (filter.status) url.searchParams.set("status", filter.status);
  if (filter.offset !== undefined) url.searchParams.set("offset", String(filter.offset));
  if (filter.limit !== undefined) url.searchParams.set("limit", String(filter.limit));

  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json() as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<HistoryResult>;
}

export async function getChartData(from: string, to: string): Promise<ChartPoint[]> {
  const url = new URL(`${API}/history/chart`);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json() as { error?: string };
    throw new Error(d.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json() as { points: ChartPoint[] };
  return data.points;
}
