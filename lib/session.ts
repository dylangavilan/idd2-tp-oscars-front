import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthUser, UserRole } from "./types";

const TOKEN_COOKIE = "oscar_token";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export async function getToken(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(TOKEN_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export const getSession = cache(async (): Promise<AuthUser | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as AuthUser;
  } catch {
    return null;
  }
});

export async function saveToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60,
    path: "/",
    sameSite: "lax",
  });
}

export async function getAuthContext() {
  const session = await getSession();
  return {
    session,
    isAdmin: session?.rol === UserRole.ADMIN,
    isAcademyMember: session?.rol === UserRole.ACADEMY_MEMBER,
    isCommonUser: session?.rol === UserRole.COMMON_USER,
  };
}

export async function requireAdmin(): Promise<AuthUser> {
  const session = await getSession();
  if (session?.rol !== UserRole.ADMIN) redirect("/");
  return session;
}

export async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
