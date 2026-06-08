import { api } from "@/lib/api";
import { AuditLog } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const accionColors: Record<string, string> = {
  LOGIN: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  CREATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  UPDATE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default async function AuditPage() {
  let logs: AuditLog[] = [];
  try {
    logs = await api.get<AuditLog[]>("/audit");
  } catch {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No tenés permisos para ver el log de auditoría.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Auditoría</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {logs.length} registro{logs.length !== 1 ? "s" : ""} de auditoría
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-lg">
          No hay registros de auditoría todavía.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Usuario ID</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id_auditoria}>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.fecha).toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-sm">{log.idUsuario}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        accionColors[log.accion] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.accion}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{log.entidad}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {log.detalle ?? "—"}
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
