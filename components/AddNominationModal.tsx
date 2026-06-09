"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/app-toast";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Category, CategoryTipo, Movie, Professional, NomineeType } from "@/lib/types";
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

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const categoryTipo = selectedCategory?.tipo;

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

  function handleCategoryChange(id: string) {
    setCategoryId(id);
    setPeliculaId("");
    setProfesionalId("");
    const cat = categories.find((c) => c._id === id);
    setTipo(cat?.tipo === CategoryTipo.PROFESIONAL ? NomineeType.PROFESIONAL : NomineeType.PELICULA);
  }

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
          await addNominacion(ceremonyId, {
            categoria: { id: cat._id, nombre: cat.nombre },
            pelicula: { id: movie._id, titulo: movie.titulo },
          });
        } else {
          const prof = professionals.find((p) => p._id === profesionalId);
          if (!prof) {
            showToast({ message: "Selecciona un profesional", type: "alert" });
            return;
          }
          await addNominacion(ceremonyId, {
            categoria: { id: cat._id, nombre: cat.nombre },
            profesional: {
              id: prof._id,
              nombreCompleto: `${prof.nombre} ${prof.apellido}`,
            },
          });
        }

        showToast({ message: "Nominacion agregada", type: "success" });
        setOpen(false);
        resetForm();
        router.refresh();
      } catch (err) {
        showToast({
          message: err instanceof Error ? err.message : "Error al agregar nominacion",
          type: "alert",
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" />}>+ Agregar nominacion</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar nominacion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <select
              className={selectClass}
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              required
            >
              <option value="">Seleccionar categoria...</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.nombre}
                  {c.tipo === CategoryTipo.PELICULA ? " (solo películas)" : c.tipo === CategoryTipo.PROFESIONAL ? " (solo profesionales)" : ""}
                </option>
              ))}
            </select>
          </div>

          {categoryTipo && (
            <p className="text-xs text-muted-foreground">
              Esta categoría solo admite{" "}
              <span className="font-medium">
                {categoryTipo === CategoryTipo.PELICULA ? "películas" : "profesionales"}
              </span>
              .
            </p>
          )}

          {tipo === NomineeType.PELICULA ? (
            <div className="space-y-1.5">
              <Label>Pelicula</Label>
              <select
                className={selectClass}
                value={peliculaId}
                onChange={(e) => setPeliculaId(e.target.value)}
                required
              >
                <option value="">Seleccionar pelicula...</option>
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
                <option value="">Seleccionar profesional...</option>
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
              {isPending ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
