import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { updateCategory } from "@/lib/actions/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  let category: Category;
  try {
    category = await api.get<Category>(`/categories/${id}`);
  } catch {
    notFound();
  }

  const action = updateCategory.bind(null, id);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar categoría</h1>
        <p className="text-sm text-muted-foreground mt-1">{category.nombre}</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            name="nombre"
            defaultValue={category.nombre}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            name="descripcion"
            defaultValue={category.descripcion}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de nominado</Label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={category.tipo}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus:border-ring"
          >
            <option value="pelicula">Solo películas</option>
            <option value="profesional">Solo profesionales</option>
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Guardar cambios</Button>
          <Button variant="outline" render={<Link href="/categories" />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
