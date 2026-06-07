import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Category, Ceremony, Movie, Professional } from "@/lib/types";
import { NominationForm } from "@/components/NominationForm";

export default async function EditNominacionPage({
  params,
}: {
  params: Promise<{ id: string; nomId: string }>;
}) {
  const { id, nomId } = await params;

  let ceremony: Ceremony;
  let categories: Category[], movies: Movie[], professionals: Professional[];
  try {
    [ceremony, categories, movies, professionals] = await Promise.all([
      api.get<Ceremony>(`/ceremonies/${id}`),
      api.get<Category[]>("/categories"),
      api.get<Movie[]>("/movies"),
      api.get<Professional[]>("/professionals"),
    ]);
  } catch {
    notFound();
  }

  const nomination = ceremony.nominaciones.find((n) => n._id === nomId);
  if (!nomination) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar nominación</h1>
        <p className="text-sm text-muted-foreground mt-1">{nomination.categoria.nombre}</p>
      </div>
      <NominationForm
        ceremonyId={id}
        categories={categories}
        movies={movies}
        professionals={professionals}
        nomination={nomination}
      />
    </div>
  );
}
