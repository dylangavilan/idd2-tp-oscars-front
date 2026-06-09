"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";

export async function castVote(idCeremonia: string, nominacionId: string): Promise<void> {
  await api.post("/votes", { idCeremonia, nominacionId });
  revalidatePath(`/ceremonies/${idCeremonia}`);
}

export async function changeVote(idCeremonia: string, nominacionId: string): Promise<void> {
  await api.put("/votes", { idCeremonia, nominacionId });
  revalidatePath(`/ceremonies/${idCeremonia}`);
}
