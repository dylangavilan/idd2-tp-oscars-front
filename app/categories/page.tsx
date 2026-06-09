import Link from "next/link";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { FlashToast } from "@/components/FlashToast";
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

function categoryTipoLabel(tipo: Category["tipo"]) {
  return tipo === "pelicula" ? "Pelicula" : "Profesional";
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ toastMessage?: string; type?: "alert" | "info" | "warn" | "success" }>;
}) {
  const params = (await searchParams) ?? {};
  const { isAdmin } = await getAuthContext();
  const categories = await api.get<Category[]>("/categories");

  return (
    <div className="space-y-6">
      <FlashToast message={params.toastMessage} type={params.type} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categorias/Premios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categoria{categories.length !== 1 ? "s" : ""} registrada
            {categories.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isAdmin && (
          <Button render={<Link href="/categories/new" />}>Nueva categoria</Button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border py-16 text-center text-muted-foreground">
          No hay categorias registradas todavia.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descripcion</TableHead>
                {isAdmin && <TableHead className="w-30">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell className="font-medium">{cat.nombre}</TableCell>
                  <TableCell>{categoryTipoLabel(cat.tipo)}</TableCell>
                  <TableCell className="text-muted-foreground">{cat.descripcion || "-"}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          render={<Link href={`/categories/${cat._id}/edit`} />}
                        >
                          Editar
                        </Button>
                        <DeleteButton action={deleteCategory.bind(null, cat._id)} label="categoria" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
