"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function createCategory(formData: FormData) {
  await api.post("/categories", {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || "",
    tipo: formData.get("tipo"),
  });
  revalidatePath("/categories");
  redirect("/categories?toastMessage=Categoria%20creada&type=success");
}

export async function updateCategory(id: string, formData: FormData) {
  await api.put(`/categories/${id}`, {
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion") || "",
    tipo: formData.get("tipo"),
  });
  revalidatePath("/categories");
  redirect("/categories?toastMessage=Categoria%20actualizada&type=info");
}

export async function deleteCategory(id: string) {
  await api.delete(`/categories/${id}`);
  revalidatePath("/categories");
}
