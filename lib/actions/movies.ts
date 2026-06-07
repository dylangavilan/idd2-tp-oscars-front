"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";

interface MoviePayload {
  titulo: string;
  anioEstreno: number;
  genero: string;
  descripcion: string;
  reparto: { profesionalId: string; rol: string }[];
}

export async function createMovie(data: MoviePayload): Promise<void> {
  await api.post("/movies", data);
  revalidatePath("/movies");
  redirect("/movies");
}

export async function updateMovie(id: string, data: MoviePayload): Promise<void> {
  await api.put(`/movies/${id}`, data);
  revalidatePath("/movies");
  redirect("/movies");
}

export async function deleteMovie(id: string): Promise<void> {
  await api.delete(`/movies/${id}`);
  revalidatePath("/movies");
}
