import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, CeremonyState, UserRole } from "@/lib/types";
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
          <p className="mt-2 text-muted-foreground">
            Bienvenido, <span className="font-medium">{session.nombre} {session.apellido}</span>{" "}
            <span className="text-xs opacity-60">({session.rol})</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {[
          { href: "/ceremonies", label: "Ceremonias", desc: "Gestionar ediciones", adminOnly: false },
          { href: "/movies", label: "Peliculas", desc: "Catalogo de films", adminOnly: false },
          { href: "/professionals", label: "Profesionales", desc: "Actores y directores", adminOnly: false },
          { href: "/categories", label: "Categorias/Premios", desc: "Tipos de premios", adminOnly: false },
          { href: "/votes", label: "Votaciones", desc: "Votar nominaciones", adminOnly: false },
          { href: "/audit", label: "Auditoria", desc: "Log de actividad", adminOnly: true },
        ]
          .filter(({ adminOnly }) => !adminOnly || session?.rol === UserRole.ADMIN)
          .map(({ href, label, desc }) => (
            <Link key={href} href={href}>
              <Card className="h-full cursor-pointer p-4 transition-colors hover:bg-accent">
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
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
                <div className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-accent">
                  <div>
                    <span className="font-medium">Oscar {c.anio}</span>
                    <span className="ml-3 text-sm text-muted-foreground">{c.lugar}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{c.nominaciones.length} nominaciones</span>
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
