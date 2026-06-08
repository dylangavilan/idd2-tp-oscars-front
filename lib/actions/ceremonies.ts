"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

export async function createCeremony(formData: FormData): Promise<void> {
  await api.post("/ceremonies", {
    anio: Number(formData.get("anio")),
    fecha: formData.get("fecha"),
    lugar: formData.get("lugar"),
  });
  revalidatePath("/ceremonies");
  redirect("/ceremonies?toastMessage=Ceremonia%20creada&type=success");
}

export async function updateCeremony(id: string, formData: FormData): Promise<void> {
  await api.put(`/ceremonies/${id}`, {
    anio: Number(formData.get("anio")),
    fecha: formData.get("fecha"),
    lugar: formData.get("lugar"),
  });
  revalidatePath("/ceremonies");
  redirect(`/ceremonies/${id}?toastMessage=Ceremonia%20actualizada&type=info`);
}

export async function deleteCeremony(id: string): Promise<void> {
  await api.delete(`/ceremonies/${id}`);
  revalidatePath("/ceremonies");
}

export async function closeCeremony(id: string): Promise<void> {
  await api.post(`/ceremonies/${id}/close`, {});
  revalidatePath("/ceremonies");
  revalidatePath(`/ceremonies/${id}`);
  redirect(`/ceremonies/${id}?toastMessage=Ceremonia%20cerrada&type=success`);
}

interface NominationPayload {
  categoria: { id: string; nombre: string };
  pelicula?: { id: string; titulo: string };
  profesional?: { id: string; nombreCompleto: string };
}

export async function addNominacion(ceremonyId: string, data: NominationPayload): Promise<void> {
  await api.post(`/ceremonies/${ceremonyId}/nominaciones`, data);
  revalidatePath(`/ceremonies/${ceremonyId}`);
}

export async function updateNominacion(
  ceremonyId: string,
  nomId: string,
  data: Partial<NominationPayload>
): Promise<void> {
  await api.put(`/ceremonies/${ceremonyId}/nominaciones/${nomId}`, data);
  revalidatePath(`/ceremonies/${ceremonyId}`);
  redirect(`/ceremonies/${ceremonyId}`);
}

export async function deleteNominacion(ceremonyId: string, nomId: string): Promise<void> {
  await api.delete(`/ceremonies/${ceremonyId}/nominaciones/${nomId}`);
  revalidatePath(`/ceremonies/${ceremonyId}`);
}
