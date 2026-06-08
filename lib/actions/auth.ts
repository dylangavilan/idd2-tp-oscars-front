"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, api } from "@/lib/api";
import { saveToken, clearToken } from "@/lib/session";
import { LoginResponse } from "@/lib/types";

const REGISTER_ROLES = new Set(["ADMIN", "ACADEMY_MEMBER", "COMMON_USER"]);

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
  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const rol = String(formData.get("rol") ?? "COMMON_USER");

  if (password !== confirmPassword) {
    return { error: "Las contrasenas no coinciden" };
  }

  if (!REGISTER_ROLES.has(rol)) {
    return { error: "El rol seleccionado no es valido" };
  }

  try {
    await api.post("/users", {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      email: formData.get("email"),
      password,
      rol,
    });

    const result = await api.post<LoginResponse>("/auth/login", {
      email: formData.get("email"),
      password,
    });
    await saveToken(result.token);
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      return { error: err.message };
    }
    return { error: err instanceof Error ? err.message : "No se pudo completar el registro" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout", {});
  } catch {}
  await clearToken();
  revalidatePath("/", "layout");
  redirect("/login");
}
