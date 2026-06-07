import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, CeremonyState } from "@/lib/types";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getSession();

  let recentCeremonies: Ceremony[] = [];
  try {
    const all = await api.get<Ceremony[]>("/ceremonies");
    recentCeremonies = all.slice(-5).reverse();
  } catch {}

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Sistema de Premios Oscar</h1>
        {session && (
          <p className="text-muted-foreground mt-2">
            Bienvenido, <span className="font-medium">{session.nombre} {session.apellido}</span>
            {" "}
            <span className="text-xs opacity-60">({session.rol})</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[
          { href: "/ceremonies", label: "Ceremonias", desc: "Gestionar ediciones" },
          { href: "/movies", label: "Películas", desc: "Catálogo de films" },
          { href: "/professionals", label: "Profesionales", desc: "Actores y directores" },
          { href: "/categories", label: "Categorías", desc: "Tipos de premios" },
          { href: "/users", label: "Usuarios", desc: "Gestión de cuentas" },
          { href: "/audit", label: "Auditoría", desc: "Log de actividad" },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href}>
            <Card className="p-4 h-full hover:bg-accent transition-colors cursor-pointer">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {recentCeremonies.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Ceremonias recientes</h2>
          <div className="grid gap-3">
            {recentCeremonies.map((c) => (
              <Link key={c._id} href={`/ceremonies/${c._id}`}>
                <div className="border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors">
                  <div>
                    <span className="font-medium">Oscar {c.anio}</span>
                    <span className="text-sm text-muted-foreground ml-3">{c.lugar}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {c.nominaciones.length} nominaciones
                    </span>
                    <Badge variant={c.estado === CeremonyState.CERRADA ? "secondary" : "default"}>
                      {c.estado === CeremonyState.CERRADA ? "Cerrada" : "Abierta"}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Button variant="outline" size="sm" render={<Link href="/ceremonies" />}>
            Ver todas las ceremonias
          </Button>
        </section>
      )}
    </div>
  );
}
