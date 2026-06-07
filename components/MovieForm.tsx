"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Professional, Movie } from "@/lib/types";
import { createMovie, updateMovie } from "@/lib/actions/movies";

const ROLES = ["Actor Principal", "Actor Secundario", "Director", "Productor"] as const;

interface CastRow {
  id: string;
  profesionalId: string;
  rol: string;
}

interface Props {
  professionals: Professional[];
  movie?: Movie;
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring disabled:opacity-50";

export function MovieForm({ professionals, movie }: Props) {
  const [cast, setCast] = useState<CastRow[]>(
    movie?.reparto.map((m, i) => ({
      id: `cast-init-${i}`,
      profesionalId: typeof m.profesionalId === "string" ? m.profesionalId : m.profesionalId._id,
      rol: m.rol,
    })) ?? [{ id: `cast-${Date.now()}`, profesionalId: "", rol: "" }]
  );
  const [isPending, startTransition] = useTransition();

  function addCastRow() {
    setCast((prev) => [...prev, { id: `cast-${Date.now()}`, profesionalId: "", rol: "" }]);
  }

  function removeCastRow(i: number) {
    setCast((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateCastRow(i: number, field: keyof CastRow, value: string) {
    setCast((prev) => prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      titulo: form.get("titulo") as string,
      anioEstreno: Number(form.get("anioEstreno")),
      genero: form.get("genero") as string,
      descripcion: form.get("descripcion") as string,
      reparto: cast.filter((c) => c.profesionalId && c.rol),
    };
    startTransition(async () => {
      try {
        if (movie) {
          await updateMovie(movie._id, payload);
        } else {
          await createMovie(payload);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" name="titulo" defaultValue={movie?.titulo} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="anioEstreno">Año de estreno</Label>
          <Input
            id="anioEstreno"
            name="anioEstreno"
            type="number"
            min={1888}
            max={new Date().getFullYear() + 2}
            defaultValue={movie?.anioEstreno}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="genero">Género</Label>
          <Input id="genero" name="genero" defaultValue={movie?.genero} />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea id="descripcion" name="descripcion" defaultValue={movie?.descripcion} rows={3} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Reparto</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCastRow}>
            + Agregar
          </Button>
        </div>
        {cast.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin reparto registrado.</p>
        )}
        {cast.map((row, i) => (
          <div key={row.id} className="flex gap-2 items-center">
            <select
              className={selectClass}
              value={row.profesionalId}
              onChange={(e) => updateCastRow(i, "profesionalId", e.target.value)}
              required
            >
              <option value="">Seleccionar profesional</option>
              {professionals.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>
            <select
              className={selectClass}
              value={row.rol}
              onChange={(e) => updateCastRow(i, "rol", e.target.value)}
              required
            >
              <option value="">Seleccionar rol</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeCastRow(i)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : movie ? "Guardar cambios" : "Crear película"}
        </Button>
        <Button variant="outline" render={<Link href="/movies" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
