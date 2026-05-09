import { getAccessToken } from "./AuthService.ts";

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export type ActivityType = "ROUTINE" | "ONE_TIME" | "OPTIONAL";

export interface Activity {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: ActivityType;
  weight: number;
  recurrence: string | null;
  scheduledDate: string | null;
  deadlineTime: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityCompletion {
  id: string;
  activityId: string;
  userId: string;
  completedDate: string;
  completedAt: string | null;
  skipped: boolean;
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json() as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data;
}

export async function listActivities(date?: string): Promise<Activity[]> {
  const url = new URL(`${API}/activities`);
  if (date) url.searchParams.set("date", date);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  const data = await handleResponse<{ activities: Activity[] }>(res);
  return data.activities;
}

export async function createActivity(
  input: Pick<Activity, "title" | "type"> & Partial<Pick<Activity, "description" | "weight" | "recurrence" | "scheduledDate" | "deadlineTime">>
): Promise<Activity> {
  const res = await fetch(`${API}/activities`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await handleResponse<{ activity: Activity }>(res);
  return data.activity;
}

export async function updateActivity(id: string, input: Partial<Activity>): Promise<Activity> {
  const res = await fetch(`${API}/activities/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await handleResponse<{ activity: Activity }>(res);
  return data.activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`${API}/activities/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json() as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
}

export async function markCompletion(
  activityId: string,
  date: string,
  completed: boolean
): Promise<ActivityCompletion> {
  const res = await fetch(`${API}/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ activityId, date, completed }),
  });
  const data = await handleResponse<{ completion: ActivityCompletion }>(res);
  return data.completion;
}

export async function listCompletions(date: string): Promise<ActivityCompletion[]> {
  const url = new URL(`${API}/completions`);
  url.searchParams.set("date", date);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  const data = await handleResponse<{ completions: ActivityCompletion[] }>(res);
  return data.completions;
}
