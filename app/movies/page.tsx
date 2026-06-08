import Link from "next/link";
import { api } from "@/lib/api";
import { Movie, UserRole } from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { FlashToast } from "@/components/FlashToast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteMovie } from "@/lib/actions/movies";

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ toastMessage?: string; type?: "alert" | "info" | "warn" | "success" }>;
}) {
  const params = (await searchParams) ?? {};
  const { session, isAdmin, isAcademyMember } = await getAuthContext();
  

  const movies = await api.get<Movie[]>("/movies");

  return (
    <div className="space-y-6">
      <FlashToast message={params.toastMessage} type={params.type} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Películas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {movies.length} película{movies.length !== 1 ? "s" : ""} registrada{movies.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button render={<Link href="/movies/new" />}>Nueva película</Button>
        )}
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No hay películas registradas todavía.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Reparto</TableHead>
                {isAdmin && <TableHead className="w-30">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {movies.map((movie) => (
                <TableRow key={movie._id}>
                  <TableCell className="font-medium">{movie.titulo}</TableCell>
                  <TableCell>{movie.anioEstreno}</TableCell>
                  <TableCell className="text-muted-foreground">{movie.genero || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {movie.reparto.length} miembro{movie.reparto.length !== 1 ? "s" : ""}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" render={<Link href={`/movies/${movie._id}/edit`} />}>
                          Editar
                        </Button>
                        <DeleteButton action={deleteMovie.bind(null, movie._id)} label="película" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
