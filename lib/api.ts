import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let authHeaders: HeadersInit = {};
  try {
    const store = await cookies();
    const token = store.get("oscar_token")?.value;
    if (token) authHeaders = { Authorization: `Bearer ${token}` };
  } catch {}

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders, ...init?.headers },
    ...init,
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status || 500, `Error inesperado del servidor (${res.status})`);
  }

  const body = json as Record<string, unknown> | null;

  if (!res.ok) {
    const err = body?.error;
    const message =
      typeof err === "string" ? err : (err as Record<string, unknown>)?.message as string || "Error inesperado";
    throw new ApiError(res.status, message, (err as Record<string, unknown>)?.details);
  }

  return (body as Record<string, unknown>)?.data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
