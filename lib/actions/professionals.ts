"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function createProfessional(formData: FormData): Promise<void> {
  await api.post("/professionals", {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    nacionalidad: formData.get("nacionalidad") || "",
    roles: (formData.getAll("roles") as string[]).map((r) => ({ nombre: r })),
  });
  revalidatePath("/professionals");
  redirect("/professionals?toastMessage=Profesional%20creado&type=success");
}

export async function updateProfessional(id: string, formData: FormData): Promise<void> {
  await api.put(`/professionals/${id}`, {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    nacionalidad: formData.get("nacionalidad") || "",
    roles: (formData.getAll("roles") as string[]).map((r) => ({ nombre: r })),
  });
  revalidatePath("/professionals");
  redirect("/professionals?toastMessage=Profesional%20actualizado&type=info");
}

export async function deleteProfessional(id: string): Promise<void> {
  await api.delete(`/professionals/${id}`);
  revalidatePath("/professionals");
}
