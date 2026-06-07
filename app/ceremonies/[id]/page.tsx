import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import {
  Ceremony,
  VoteCount,
  Vote,
  Category,
  Movie,
  Professional,
  UserRole,
  CeremonyState,
  NomineeType,
} from "@/lib/types";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VotingPanel } from "@/components/VotingPanel";
import { AddNominationModal } from "@/components/AddNominationModal";
import { closeCeremony } from "@/lib/actions/ceremonies";

export default async function CeremonyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ceremony: Ceremony;
  try {
    ceremony = await api.get<Ceremony>(`/ceremonies/${id}`);
  } catch {
    notFound();
  }

  const session = await getSession();
  const isAdmin = session?.rol === UserRole.ADMIN;
  const isOpen = ceremony.estado === CeremonyState.ABIERTA;

  // Fetch vote data (requires auth)
  let voteCounts: VoteCount[] = [];
  const myVotes: Record<string, string> = {};

  if (session) {
    try {
      voteCounts = await api.get<VoteCount[]>(`/votes?idCeremonia=${id}`);
    } catch {}

    if (session.rol === UserRole.ACADEMY_MEMBER) {
      try {
        const allVotes = await api.get<Vote[]>(
          `/votes/my-vote?idCeremonia=${id}`,
        );
        const votesArr = Array.isArray(allVotes) ? allVotes : [allVotes];
        for (const v of votesArr) {
          myVotes[v.categoryId] = v.nominacionId;
        }
      } catch {}
    }
  }

  // For admin modal: fetch selectable data
  let categories: Category[] = [];
  let movies: Movie[] = [];
  let professionals: Professional[] = [];
  if (isAdmin && isOpen) {
    [categories, movies, professionals] = await Promise.all([
      api.get<Category[]>("/categories").catch(() => []),
      api.get<Movie[]>("/movies").catch(() => []),
      api.get<Professional[]>("/professionals").catch(() => []),
    ]);
  }

  // Group nominations by category
  const groups = Object.values(
    ceremony.nominaciones.reduce<
      Record<
        string,
        {
          categoryId: string;
          categoryName: string;
          nominations: typeof ceremony.nominaciones;
        }
      >
    >((acc, nom) => {
      const catId = nom.categoria.id;
      if (!acc[catId])
        acc[catId] = {
          categoryId: catId,
          categoryName: nom.categoria.nombre,
          nominations: [],
        };
      acc[catId].nominations.push(nom);
      return acc;
    }, {}),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Oscar {ceremony.anio}</h1>
            <Badge variant={isOpen ? "default" : "secondary"}>
              {isOpen ? "Abierta" : "Cerrada"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(ceremony.fecha).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            — {ceremony.lugar}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/ceremonies/${id}/edit`} />}
            >
              Editar
            </Button>
            {isOpen && (
              <form action={closeCeremony.bind(null, id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Cerrar ceremonia
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Actuaciones */}
      {ceremony.actuaciones.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Actuaciones musicales</h2>
          <div className="grid gap-2">
            {ceremony.actuaciones.map((act, i) => (
              <div key={i} className="border rounded-lg px-4 py-3">
                <p className="font-medium text-sm">{act.tipoActuacion}</p>
                <p className="text-sm text-muted-foreground">
                  {act.artistas
                    .map((a) => `${a.nombre} (${a.tipo})`)
                    .join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nominations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            Nominaciones
            <span className="text-muted-foreground font-normal text-sm ml-2">
              ({ceremony.nominaciones.length})
            </span>
          </h2>
          {isAdmin && isOpen && (
            <AddNominationModal
              ceremonyId={id}
              categories={categories}
              movies={movies}
              professionals={professionals}
            />
          )}
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No hay nominaciones todavía.{" "}
            {isAdmin && isOpen && "Usá el botón para agregar la primera."}
          </div>
        ) : (
          <VotingPanel
            ceremonyId={id}
            isOpen={isOpen}
            userRole={session?.rol ?? null}
            isAdmin={isAdmin}
            groups={groups}
            voteCounts={voteCounts}
            myVotes={myVotes}
          />
        )}
      </section>

      {/* Awards */}
      {ceremony.premios.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-medium">Premios</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {ceremony.premios.map((award, i) => (
              <div
                key={i}
                className="border rounded-lg px-4 py-3 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900"
              >
                <p className="text-xs text-muted-foreground">
                  {award.categoria.nombre}
                </p>
                <p className="font-medium mt-0.5">
                  {award.ganador.tipo === NomineeType.PELICULA
                    ? award.ganador.pelicula?.titulo
                    : award.ganador.profesional?.nombreCompleto}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
