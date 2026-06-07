import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, VoteCount, UserRole, CeremonyState } from "@/lib/types";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function VotesPage() {
  const session = await getSession();
  const isAcademyMember = session?.rol === UserRole.ACADEMY_MEMBER;

  let ceremonies: Ceremony[] = [];
  try {
    ceremonies = await api.get<Ceremony[]>("/ceremonies");
  } catch {}

  const open = ceremonies.filter((c) => c.estado === CeremonyState.ABIERTA).sort((a, b) => b.anio - a.anio);
  const closed = ceremonies.filter((c) => c.estado === CeremonyState.CERRADA).sort((a, b) => b.anio - a.anio);

  // Fetch vote counts for open ceremonies (to show tallies)
  const voteCountsByCeremony: Record<string, VoteCount[]> = {};
  await Promise.all(
    open.map(async (c) => {
      try {
        voteCountsByCeremony[c._id] = await api.get<VoteCount[]>(`/votes?idCeremonia=${c._id}`);
      } catch {
        voteCountsByCeremony[c._id] = [];
      }
    })
  );

  const totalVotes = (ceremonyId: string) =>
    (voteCountsByCeremony[ceremonyId] ?? []).reduce((sum, v) => sum + v.votos, 0);

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
                      <Badge variant="default" className="text-xs">Abierta</Badge>
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
                    <Badge variant="secondary" className="text-xs">Cerrada</Badge>
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
