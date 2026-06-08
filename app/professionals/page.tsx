import Link from "next/link";
import { api } from "@/lib/api";
import { Professional, UserRole } from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { FlashToast } from "@/components/FlashToast";
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
import { deleteProfessional } from "@/lib/actions/professionals";

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ toastMessage?: string; type?: "alert" | "info" | "warn" | "success" }>;
}) {
  const params = (await searchParams) ?? {};
  const { session, isAdmin, isAcademyMember } = await getAuthContext();
  

  const professionals = await api.get<Professional[]>("/professionals");

  return (
    <div className="space-y-6">
      <FlashToast message={params.toastMessage} type={params.type} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Profesionales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {professionals.length} profesional{professionals.length !== 1 ? "es" : ""} registrado{professionals.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button render={<Link href="/professionals/new" />}>Nuevo profesional</Button>
        )}
      </div>

      {professionals.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No hay profesionales registrados todavía.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Nacionalidad</TableHead>
                <TableHead>Roles</TableHead>
                {isAdmin && <TableHead className="w-30">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">
                    {p.nombre} {p.apellido}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.nacionalidad || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.roles.map((r) => (
                        <Badge key={r.nombre} variant="secondary" className="text-xs">
                          {r.nombre}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" render={<Link href={`/professionals/${p._id}/edit`} />}>
                          Editar
                        </Button>
                        <DeleteButton action={deleteProfessional.bind(null, p._id)} label="profesional" />
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
