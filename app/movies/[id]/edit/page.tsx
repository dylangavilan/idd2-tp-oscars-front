import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Movie, Professional } from "@/lib/types";
import { MovieForm } from "@/components/MovieForm";

export default async function EditMoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let movie: Movie;
  try {
    movie = await api.get<Movie>(`/movies/${id}`);
  } catch {
    notFound();
  }

  const professionals = await api.get<Professional[]>("/professionals");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar película</h1>
        <p className="text-sm text-muted-foreground mt-1">{movie.titulo}</p>
      </div>
      <MovieForm professionals={professionals} movie={movie} />
    </div>
  );
}
