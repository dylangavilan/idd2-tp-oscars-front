import Link from "next/link";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteCategory } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await api.get<Category[]>("/categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""} registrada{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<Link href="/categories/new" />}>
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No hay categorías registradas todavía.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-30">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">{cat.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {cat.descripcion || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" render={<Link href={`/categories/${cat._id}/edit`} />}>
                        Editar
                      </Button>
                      <DeleteButton
                        action={deleteCategory.bind(null, cat._id)}
                        label="categoría"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
