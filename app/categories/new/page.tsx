import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategory } from "@/lib/actions/categories";

export default async function NewCategoryPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva categoría</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Agregá una nueva categoría de premio
        </p>
      </div>

      <form action={createCategory} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" name="nombre" placeholder="Ej: Mejor Película" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            placeholder="Descripción de la categoría"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de nominado</Label>
          <select
            id="tipo"
            name="tipo"
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring"
            required
          >
            <option value="">Seleccionar tipo...</option>
            <option value="pelicula">Solo películas</option>
            <option value="profesional">Solo profesionales</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Crear categoría</Button>
          <Button variant="outline" render={<Link href="/categories" />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
