"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/app-toast";
import { Label } from "@/components/ui/label";
import { Category, Movie, Professional, Nomination, NomineeType } from "@/lib/types";
import { addNominacion, updateNominacion } from "@/lib/actions/ceremonies";

interface Props {
  ceremonyId: string;
  categories: Category[];
  movies: Movie[];
  professionals: Professional[];
  nomination?: Nomination;
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring disabled:opacity-50";

export function NominationForm({ ceremonyId, categories, movies, professionals, nomination }: Props) {
  const existing: NomineeType = nomination
    ? nomination.pelicula
      ? NomineeType.PELICULA
      : NomineeType.PROFESIONAL
    : NomineeType.PELICULA;

  const [tipo, setTipo] = useState<NomineeType>(existing);
  const [categoryId, setCategoryId] = useState(nomination?.categoria.id ?? "");
  const [peliculaId, setPeliculaId] = useState(nomination?.pelicula?.id ?? "");
  const [profesionalId, setProfesionalId] = useState(nomination?.profesional?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cat = categories.find((c) => c._id === categoryId);
    if (!cat) {
      showToast({ message: "Selecciona una categoria", type: "alert" });
      return;
    }

    startTransition(async () => {
      try {
        if (tipo === NomineeType.PELICULA) {
          const movie = movies.find((m) => m._id === peliculaId);
          if (!movie) {
            showToast({ message: "Selecciona una pelicula", type: "alert" });
            return;
          }
          const data = {
            categoria: { id: cat._id, nombre: cat.nombre },
            pelicula: { id: movie._id, titulo: movie.titulo },
          };
          if (nomination) {
            await updateNominacion(ceremonyId, nomination._id, data);
          } else {
            await addNominacion(ceremonyId, data);
          }
        } else {
          const prof = professionals.find((p) => p._id === profesionalId);
          if (!prof) {
            showToast({ message: "Selecciona un profesional", type: "alert" });
            return;
          }
          const data = {
            categoria: { id: cat._id, nombre: cat.nombre },
            profesional: {
              id: prof._id,
              nombreCompleto: `${prof.nombre} ${prof.apellido}`,
            },
          };
          if (nomination) {
            await updateNominacion(ceremonyId, nomination._id, data);
          } else {
            await addNominacion(ceremonyId, data);
          }
        }
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "Error al guardar",
          type: "alert",
        });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>Categoria</Label>
        <select
          className={selectClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Seleccionar categoria</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Tipo de nominado</Label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              checked={tipo === NomineeType.PELICULA}
              onChange={() => setTipo(NomineeType.PELICULA)}
            />
            Pelicula
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              checked={tipo === NomineeType.PROFESIONAL}
              onChange={() => setTipo(NomineeType.PROFESIONAL)}
            />
            Profesional
          </label>
        </div>
      </div>

      {tipo === NomineeType.PELICULA ? (
        <div className="space-y-2">
          <Label>Pelicula</Label>
          <select
            className={selectClass}
            value={peliculaId}
            onChange={(e) => setPeliculaId(e.target.value)}
            required
          >
            <option value="">Seleccionar pelicula</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.titulo} ({m.anioEstreno})
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Profesional</Label>
          <select
            className={selectClass}
            value={profesionalId}
            onChange={(e) => setProfesionalId(e.target.value)}
            required
          >
            <option value="">Seleccionar profesional</option>
            {professionals.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando..." : nomination ? "Guardar cambios" : "Agregar nominacion"}
        </Button>
        <Button variant="outline" render={<Link href={`/ceremonies/${ceremonyId}`} />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
