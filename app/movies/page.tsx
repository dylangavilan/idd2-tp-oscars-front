import Link from "next/link";
import { api } from "@/lib/api";
import { Movie, Professional } from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { FlashToast } from "@/components/FlashToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function getCastName(member: Movie["reparto"][number]) {
  if (typeof member.profesionalId === "string") {
    return "Profesional no disponible";
  }

  const professional = member.profesionalId as Professional;
  return `${professional.nombre} ${professional.apellido}`;
}

function getCastPreview(reparto: Movie["reparto"]) {
  return reparto
    .slice(0, 2)
    .map((member) => getCastName(member))
    .join(", ");
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: Promise<{ toastMessage?: string; type?: "alert" | "info" | "warn" | "success" }>;
}) {
  const params = (await searchParams) ?? {};
  const { isAdmin } = await getAuthContext();

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
                  <TableCell>
                    {movie.reparto.length === 0 ? (
                      <span className="text-muted-foreground">Sin reparto</span>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          {movie.reparto.length} integrante{movie.reparto.length !== 1 ? "s" : ""}
                        </div>
                        <p className="text-sm text-foreground">
                          {getCastPreview(movie.reparto)}
                          {movie.reparto.length > 2 && (
                            <span className="text-muted-foreground">
                              {" "}
                              y {movie.reparto.length - 2} mas
                            </span>
                          )}
                        </p>
                        <details className="group rounded-md border border-border/60 bg-muted/20">
                          <summary className="cursor-pointer list-none px-2.5 py-2 text-sm font-medium text-primary">
                            <span className="group-open:hidden">Ver mas</span>
                            <span className="hidden group-open:inline">Ver menos</span>
                          </summary>
                          <div className="space-y-1.5 border-t border-border/60 px-2.5 py-2">
                            {movie.reparto.map((member, index) => (
                              <div
                                key={`${movie._id}-${index}`}
                                className="flex items-center justify-between gap-3 rounded-md bg-background px-2.5 py-2"
                              >
                                <span className="min-w-0 truncate text-sm font-medium">
                                  {getCastName(member)}
                                </span>
                                <Badge variant="secondary" className="shrink-0 text-[11px]">
                                  {member.rol}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
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
