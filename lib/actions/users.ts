"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function createUser(formData: FormData): Promise<void> {
  await api.post("/users", {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol") || "COMMON_USER",
  });
  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(id: string, formData: FormData): Promise<void> {
  const body: Record<string, unknown> = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    rol: formData.get("rol"),
    isActive: formData.get("isActive") === "true",
  };
  const password = formData.get("password");
  if (password) body.password = password;

  await api.put(`/users/${id}`, body);
  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
  revalidatePath("/users");
}
