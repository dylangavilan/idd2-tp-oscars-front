"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken, clearToken } from "@/lib/session";
import { LoginResponse } from "@/lib/types";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  try {
    const result = await api.post<LoginResponse>("/auth/login", {
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await saveToken(result.token);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Credenciales inválidas" };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout", {});
  } catch {}
  await clearToken();
  redirect("/login");
}
