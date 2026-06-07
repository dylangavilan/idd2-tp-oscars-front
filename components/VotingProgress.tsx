"use client";

import { VotingStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface Props {
  status: VotingStatus;
}

export function VotingProgress({ status }: Props) {
  const { resumen, pendientes } = status;
  const pct = resumen.totalCategorias > 0
    ? Math.round((resumen.totalCategoriasVotadas / resumen.totalCategorias) * 100)
    : 0;

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Tu progreso de votación
        </p>
        <span className="text-sm text-muted-foreground">
          {resumen.totalCategoriasVotadas} / {resumen.totalCategorias} categorías
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {resumen.completo ? (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          ¡Votaste en todas las categorías!
        </p>
      ) : pendientes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Pendientes:</p>
          <div className="flex flex-wrap gap-1.5">
            {pendientes.map((cat) => (
              <Badge key={cat.id} variant="outline" className="text-xs">
                {cat.nombre}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
