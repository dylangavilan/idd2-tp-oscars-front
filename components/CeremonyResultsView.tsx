import { CeremonyResults } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface Props {
  results: CeremonyResults;
}

function nomineeName(nom: { pelicula: { titulo: string } | null; profesional: { nombreCompleto: string } | null }) {
  return nom.pelicula?.titulo ?? nom.profesional?.nombreCompleto ?? "—";
}

export function CeremonyResultsView({ results }: Props) {
  const { resumen, categorias } = results;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Resultados</h2>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{resumen.totalVotosCeremonia} votos totales</span>
          <span>{resumen.totalCategoriasConGanador}/{resumen.totalCategorias} categorías con ganador</span>
        </div>
      </div>

      <div className="space-y-3">
        {categorias.map((cat) => {
          const total = cat.totalVotosCategoria;
          return (
            <div key={cat.categoria.id} className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 flex items-center justify-between">
                <span className="font-medium text-sm">{cat.categoria.nombre}</span>
                <span className="text-xs text-muted-foreground">{total} votos</span>
              </div>

              <div className="divide-y">
                {cat.nominaciones.map(({ votos, nominacion }) => {
                  const pct = total > 0 ? Math.round((votos / total) * 100) : 0;
                  const isWinner = nominacion.esGanador;

                  return (
                    <div key={nominacion.id} className={`px-4 py-2.5 ${isWinner ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-sm truncate ${isWinner ? "font-semibold" : ""}`}>
                            {nomineeName(nominacion)}
                          </span>
                          {nominacion.pelicula
                            ? <Badge variant="outline" className="text-xs shrink-0">Película</Badge>
                            : <Badge variant="outline" className="text-xs shrink-0">Profesional</Badge>
                          }
                          {isWinner && (
                            <Badge className="text-xs shrink-0 bg-yellow-500 text-black hover:bg-yellow-500">
                              Ganador
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {votos} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isWinner ? "bg-yellow-500" : "bg-primary/40"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
