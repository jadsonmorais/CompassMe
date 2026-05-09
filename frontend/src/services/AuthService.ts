const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
}

function saveTokens(tokens: AuthTokens): void {
  localStorage.setItem("access_token", tokens.accessToken);
  localStorage.setItem("refresh_token", tokens.refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<UserProfile> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
  });
  const data = await res.json() as { user?: UserProfile; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Registration failed");
  return data.user!;
}

export async function login(email: string, password: string): Promise<UserProfile> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as (AuthTokens & { error?: string });
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  saveTokens(data);
  // Decode user from JWT payload (base64)
  const payload = JSON.parse(atob(data.accessToken.split(".")[1])) as {
    sub: string;
    email: string;
  };
  return { id: payload.sub, email: payload.email, displayName: null };
}

export async function logout(): Promise<void> {
  const token = getAccessToken();
  const refreshToken = localStorage.getItem("refresh_token");
  try {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearTokens();
  }
}
