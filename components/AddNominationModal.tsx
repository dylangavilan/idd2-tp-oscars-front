"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Category, Movie, Professional, NomineeType } from "@/lib/types";
import { addNominacion } from "@/lib/actions/ceremonies";

interface Props {
  ceremonyId: string;
  categories: Category[];
  movies: Movie[];
  professionals: Professional[];
}

const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring disabled:opacity-50";

export function AddNominationModal({ ceremonyId, categories, movies, professionals }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState("");
  const [tipo, setTipo] = useState<NomineeType>(NomineeType.PELICULA);
  const [peliculaId, setPeliculaId] = useState("");
  const [profesionalId, setProfesionalId] = useState("");

  function resetForm() {
    setCategoryId("");
    setTipo(NomineeType.PELICULA);
    setPeliculaId("");
    setProfesionalId("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetForm();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cat = categories.find((c) => c._id === categoryId);
    if (!cat) { toast.error("Seleccioná una categoría"); return; }

    startTransition(async () => {
      try {
        if (tipo === NomineeType.PELICULA) {
          const movie = movies.find((m) => m._id === peliculaId);
          if (!movie) { toast.error("Seleccioná una película"); return; }
          await addNominacion(ceremonyId, {
            categoria: { id: cat._id, nombre: cat.nombre },
            pelicula: { id: movie._id, titulo: movie.titulo },
          });
        } else {
          const prof = professionals.find((p) => p._id === profesionalId);
          if (!prof) { toast.error("Seleccioná un profesional"); return; }
          await addNominacion(ceremonyId, {
            categoria: { id: cat._id, nombre: cat.nombre },
            profesional: { id: prof._id, nombreCompleto: `${prof.nombre} ${prof.apellido}` },
          });
        }
        toast.success("Nominación agregada");
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al agregar nominación");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>
        + Agregar nominación
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nominación</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <select
              className={selectClass}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Seleccionar categoría…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de nominado</Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === NomineeType.PELICULA}
                  onChange={() => { setTipo(NomineeType.PELICULA); setPeliculaId(""); setProfesionalId(""); }}
                />
                Película
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === NomineeType.PROFESIONAL}
                  onChange={() => { setTipo(NomineeType.PROFESIONAL); setPeliculaId(""); setProfesionalId(""); }}
                />
                Profesional
              </label>
            </div>
          </div>

          {tipo === NomineeType.PELICULA ? (
            <div className="space-y-1.5">
              <Label>Película</Label>
              <select
                className={selectClass}
                value={peliculaId}
                onChange={(e) => setPeliculaId(e.target.value)}
                required
              >
                <option value="">Seleccionar película…</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.titulo} ({m.anioEstreno})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Profesional</Label>
              <select
                className={selectClass}
                value={profesionalId}
                onChange={(e) => setProfesionalId(e.target.value)}
                required
              >
                <option value="">Seleccionar profesional…</option>
                {professionals.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nombre} {p.apellido}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {isPending ? "Guardando…" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
