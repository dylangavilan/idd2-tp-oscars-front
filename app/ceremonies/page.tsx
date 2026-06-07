import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, CeremonyState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteCeremony } from "@/lib/actions/ceremonies";

export default async function CeremoniesPage() {
  const ceremonies = await api.get<Ceremony[]>("/ceremonies");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ceremonias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ceremonies.length} ceremonia{ceremonies.length !== 1 ? "s" : ""} registrada{ceremonies.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<Link href="/ceremonies/new" />}>Nueva ceremonia</Button>
      </div>

      {ceremonies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No hay ceremonias registradas todavía.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Año</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Nominaciones</TableHead>
                <TableHead className="w-36">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ceremonies.map((c) => (
                <TableRow key={c._id}>
                  <TableCell className="font-semibold">{c.anio}</TableCell>
                  <TableCell>{new Date(c.fecha).toLocaleDateString("es-AR")}</TableCell>
                  <TableCell className="text-muted-foreground">{c.lugar}</TableCell>
                  <TableCell>
                    <Badge variant={c.estado === CeremonyState.CERRADA ? "secondary" : "default"}>
                      {c.estado === CeremonyState.CERRADA ? "Cerrada" : "Abierta"}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.nominaciones.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" render={<Link href={`/ceremonies/${c._id}`} />}>
                        Ver
                      </Button>
                      <DeleteButton action={deleteCeremony.bind(null, c._id)} label="ceremonia" />
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
