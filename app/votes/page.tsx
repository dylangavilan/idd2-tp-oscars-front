import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, VoteCountsResponse, CeremonyState } from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function VotesPage() {
  const { isAcademyMember, isCommonUser } = await getAuthContext();

  let ceremonies: Ceremony[] = [];
  try {
    ceremonies = await api.get<Ceremony[]>("/ceremonies");
  } catch {}

  const open = ceremonies
    .filter((c) => c.estado === CeremonyState.ABIERTA)
    .sort((a, b) => b.anio - a.anio);
  const closed = ceremonies
    .filter((c) => c.estado === CeremonyState.CERRADA)
    .sort((a, b) => b.anio - a.anio);

  // Fetch vote counts for open ceremonies (to show tallies)
  const totalVotesByCeremony: Record<string, number> = {};
  await Promise.all(
    open.map(async (c) => {
      try {
        const resp = await api.get<VoteCountsResponse>(
          `/votes?idCeremonia=${c._id}`,
        );
        totalVotesByCeremony[c._id] = resp.resumen.totalVotosCeremonia;
      } catch {
        totalVotesByCeremony[c._id] = 0;
      }
    }),
  );

  const totalVotes = (ceremonyId: string) =>
    totalVotesByCeremony[ceremonyId] ?? 0;

  const categoryCount = (c: Ceremony) => {
    const cats = new Set(c.nominaciones.map((n) => n.categoria.id));
    return cats.size;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Votaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isAcademyMember
            ? "Votá tus nominados favoritos en las ceremonias abiertas"
            : "Estado de votaciones por ceremonia"}
        </p>
      </div>

      {isCommonUser && (
        <div className="rounded-lg border border-muted bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Tu cuenta no tiene permisos para votar. Solo los miembros de la
          academia pueden emitir votos.
        </div>
      )}

      {/* Open ceremonies */}
      <section className="space-y-4">
        <h2 className="text-base font-medium text-muted-foreground uppercase tracking-wide text-xs">
          Abiertas para votar ({open.length})
        </h2>

        {open.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No hay ceremonias abiertas en este momento.
          </div>
        ) : (
          <div className="grid gap-3">
            {open.map((c) => {
              const cats = categoryCount(c);
              const votes = totalVotes(c._id);
              return (
                <div
                  key={c._id}
                  className="border rounded-lg p-4 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Oscar {c.anio}</span>
                      <Badge
                        variant="outline"
                        className="border-emerald-500/20 bg-emerald-500/12 text-xs text-emerald-700 dark:text-emerald-300"
                      >
                        Abierta
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {c.lugar} &mdash;{" "}
                      {new Date(c.fecha).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{c.nominaciones.length} nominaciones</span>
                      <span>{cats} categorías</span>
                      <span>{votes} votos emitidos</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    render={<Link href={`/ceremonies/${c._id}`} />}
                  >
                    {isAcademyMember ? "Votar" : "Ver ceremonia"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Closed ceremonies */}
      {closed.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Cerradas — Resultados ({closed.length})
          </h2>

          <div className="grid gap-3">
            {closed.map((c) => (
              <div
                key={c._id}
                className="border rounded-lg p-4 flex items-center justify-between gap-4 opacity-80"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Oscar {c.anio}</span>
                    <Badge
                      variant="outline"
                      className="border-red-500/20 bg-red-500/12 text-xs text-red-700 dark:text-red-300"
                    >
                      Cerrada
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.lugar}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{c.premios.length} premios otorgados</span>
                    <span>{c.nominaciones.length} nominaciones</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  render={<Link href={`/ceremonies/${c._id}`} />}
                >
                  Ver resultados
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
