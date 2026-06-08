"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArtistType, Performance, PerformanceType } from "@/lib/types";
import { addActuacion, updateActuacion } from "@/lib/actions/ceremonies";
import { showToast } from "@/components/ui/app-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MusicalPerformanceModalProps {
  ceremonyId: string;
  performance?: Performance;
}

interface ArtistForm {
  localId: string;
  nombre: string;
  tipo: ArtistType;
}

const performanceTypes = Object.values(PerformanceType);
const artistTypes = Object.values(ArtistType);

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring disabled:opacity-50";

const inputClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring disabled:opacity-50";

function newArtist(): ArtistForm {
  return {
    localId: Math.random().toString(36).slice(2),
    nombre: "",
    tipo: ArtistType.SOLISTA,
  };
}

function buildInitialArtists(performance?: Performance): ArtistForm[] {
  if (!performance?.artistas.length) {
    return [newArtist()];
  }

  return performance.artistas.map((artist) => ({
    localId: Math.random().toString(36).slice(2),
    nombre: artist.nombre,
    tipo: artist.tipo,
  }));
}

export function MusicalPerformanceModal({ ceremonyId, performance }: MusicalPerformanceModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [tipoActuacion, setTipoActuacion] = useState<PerformanceType>(
    performance?.tipoActuacion ?? PerformanceType.MUSICAL
  );
  const [artistas, setArtistas] = useState<ArtistForm[]>(() => buildInitialArtists(performance));

  const isEditing = Boolean(performance?._id);

  function resetForm() {
    setTipoActuacion(performance?.tipoActuacion ?? PerformanceType.MUSICAL);
    setArtistas(buildInitialArtists(performance));
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function updateArtist(localId: string, patch: Partial<ArtistForm>) {
    setArtistas((current) =>
      current.map((artist) => (artist.localId === localId ? { ...artist, ...patch } : artist))
    );
  }

  function removeArtist(localId: string) {
    setArtistas((current) =>
      current.length === 1 ? current : current.filter((artist) => artist.localId !== localId)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      tipoActuacion,
      artistas: artistas.map((artist) => ({
        nombre: artist.nombre.trim(),
        tipo: artist.tipo,
      })),
    };

    if (payload.artistas.some((artist) => !artist.nombre)) {
      showToast({ message: "Completa el nombre de todos los artistas", type: "alert" });
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing && performance?._id) {
          await updateActuacion(ceremonyId, performance._id, payload);
          showToast({ message: "Actuacion actualizada", type: "success" });
        } else {
          await addActuacion(ceremonyId, payload);
          showToast({ message: "Actuacion agregada", type: "success" });
        }

        setOpen(false);
        resetForm();
        router.refresh();
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "No se pudo guardar la actuacion",
          type: "alert",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant={isEditing ? "outline" : "default"} />}>
        {isEditing ? "Editar" : "+ Agregar actuacion"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar actuacion musical" : "Agregar actuacion musical"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label>Tipo de actuacion</Label>
            <select
              className={selectClass}
              value={tipoActuacion}
              onChange={(event) => setTipoActuacion(event.target.value as PerformanceType)}
              disabled={isPending}
              required
            >
              {performanceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Artistas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setArtistas((current) => [...current, newArtist()])}
                disabled={isPending}
              >
                + Agregar artista
              </Button>
            </div>

            <div className="space-y-2">
              {artistas.map((artist, index) => (
                <div
                  key={artist.localId}
                  className="grid gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-[1fr_180px_auto]"
                >
                  <div className="space-y-1.5">
                    <Label>Nombre #{index + 1}</Label>
                    <input
                      className={inputClass}
                      value={artist.nombre}
                      onChange={(event) => updateArtist(artist.localId, { nombre: event.target.value })}
                      placeholder="Ej: Billie Eilish"
                      disabled={isPending}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <select
                      className={selectClass}
                      value={artist.tipo}
                      onChange={(event) =>
                        updateArtist(artist.localId, { tipo: event.target.value as ArtistType })
                      }
                      disabled={isPending}
                      required
                    >
                      {artistTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArtist(artist.localId)}
                      disabled={isPending || artistas.length === 1}
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
