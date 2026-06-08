"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Music2 } from "lucide-react";
import { Performance } from "@/lib/types";
import { deleteActuacion } from "@/lib/actions/ceremonies";
import { showToast } from "@/components/ui/app-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MusicalPerformanceModal } from "@/components/MusicalPerformanceModal";

interface MusicalPerformancesSectionProps {
  ceremonyId: string;
  performances: Performance[];
  isAdmin: boolean;
  isOpen: boolean;
}

function DeletePerformanceButton({
  ceremonyId,
  performanceId,
}: {
  ceremonyId: string;
  performanceId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteActuacion(ceremonyId, performanceId);
        showToast({ message: "Actuacion eliminada", type: "success" });
        setOpen(false);
        router.refresh();
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "No se pudo eliminar la actuacion",
          type: "alert",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Eliminar</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar actuacion musical</DialogTitle>
          <DialogDescription>
            Esta accion elimina la actuacion de la ceremonia. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MusicalPerformancesSection({
  ceremonyId,
  performances,
  isAdmin,
  isOpen,
}: MusicalPerformancesSectionProps) {
  const canManage = isAdmin && isOpen;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <Music2 className="size-5 text-primary" />
            Actuaciones musicales
            <span className="text-sm font-normal text-muted-foreground">({performances.length})</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Artistas invitados y momentos musicales asociados a esta ceremonia.
          </p>
        </div>

        {canManage && <MusicalPerformanceModal ceremonyId={ceremonyId} />}
      </div>

      {performances.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No hay actuaciones musicales cargadas.
          {canManage && " Usa el boton para agregar la primera."}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {performances.map((performance, index) => (
            <article
              key={performance._id ?? `${performance.tipoActuacion}-${index}`}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge variant="secondary">{performance.tipoActuacion}</Badge>
                  <div>
                    <h3 className="text-sm font-medium">Actuacion #{index + 1}</h3>
                    <p className="text-xs text-muted-foreground">
                      {performance.artistas.length}{" "}
                      {performance.artistas.length === 1 ? "artista asignado" : "artistas asignados"}
                    </p>
                  </div>
                </div>

                {canManage && performance._id && (
                  <div className="flex shrink-0 gap-2">
                    <MusicalPerformanceModal ceremonyId={ceremonyId} performance={performance} />
                    <DeletePerformanceButton ceremonyId={ceremonyId} performanceId={performance._id} />
                  </div>
                )}
              </div>

              <div className="mt-4 grid gap-2">
                {performance.artistas.map((artist) => (
                  <div
                    key={`${performance._id ?? index}-${artist.nombre}-${artist.tipo}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{artist.nombre}</span>
                    <Badge variant="outline">{artist.tipo}</Badge>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
