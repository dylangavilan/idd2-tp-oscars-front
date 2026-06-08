import Link from "next/link";
import { api } from "@/lib/api";
import { Ceremony, CeremonyState, UserRole } from "@/lib/types";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const session = await getSession();

  let recentCeremonies: Ceremony[] = [];
  try {
    const all = await api.get<Ceremony[]>("/ceremonies");
    recentCeremonies = all.slice(-5).reverse();
  } catch {}

  const quickLinks = [
    { href: "/ceremonies", label: "Ceremonias", desc: "Gestionar ediciones y resultados", adminOnly: false },
    { href: "/movies", label: "Peliculas", desc: "Catalogo y reparto", adminOnly: false },
    { href: "/professionals", label: "Profesionales", desc: "Actores, directores y productores", adminOnly: false },
    { href: "/categories", label: "Categorias/Premios", desc: "Definir los premios disponibles", adminOnly: false },
    { href: "/votes", label: "Votaciones", desc: "Emitir y consultar votos", adminOnly: false },
    { href: "/history", label: "Historicos", desc: "Explorar ganadores y rankings consolidados", adminOnly: false },
    { href: "/audit", label: "Auditoria", desc: "Trazabilidad de acciones", adminOnly: true },
  ];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(249,243,229,0.92))] p-6 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(210,159,53,0.2),transparent_62%)] lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <Badge variant="secondary" className="w-fit">
              Plataforma de gestion cinematografica
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-none tracking-tight text-balance sm:text-5xl">
                Un panel mas claro para administrar ceremonias, nominaciones y votaciones.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Visualiza cada edicion con mas contraste, mejor jerarquia y acciones rapidas sin alterar
                el flujo actual del sistema.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/ceremonies" />}>
                Explorar ceremonias
              </Button>
              <Button size="lg" variant="outline" render={<Link href="/votes" />}>
                Ir a votaciones
              </Button>
            </div>

            {session && (
              <div className="rounded-2xl border border-border/70 bg-background/65 px-4 py-3 shadow-sm backdrop-blur-sm">
                <p className="text-sm text-muted-foreground">
                  Sesion activa:
                  <span className="ml-2 font-medium text-foreground">
                    {session.nombre} {session.apellido}
                  </span>
                  <span className="ml-2 text-xs uppercase tracking-[0.16em]">{session.rol}</span>
                </p>
              </div>
            )}
          </div>

          <Card className="border-border/70 bg-card/78 py-0">
            <CardContent className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Ceremonias visibles
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                {recentCeremonies.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">Accesos principales</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Entradas directas a las secciones mas usadas del sistema.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks
            .filter(({ adminOnly }) => !adminOnly || session?.rol === UserRole.ADMIN)
            .map(({ href, label, desc }) => (
              <Link key={href} href={href} className="block">
                <Card className="h-full cursor-pointer border-border/70 bg-card/82 py-0">
                  <CardContent className="flex h-full flex-col justify-between p-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-heading text-xl font-semibold tracking-tight">{label}</p>
                        <span className="text-lg text-primary">+</span>
                      </div>
                      <p className="max-w-sm text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                    <div className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                      Abrir seccion
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </section>

      {recentCeremonies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight">Ceremonias recientes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ultimas ediciones disponibles para consulta rapida.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {recentCeremonies.map((c) => (
              <Link key={c._id} href={`/ceremonies/${c._id}`}>
                <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-card/80 px-5 py-4 shadow-[0_16px_45px_-38px_rgba(15,23,42,0.52)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-heading text-2xl font-semibold tracking-tight">Oscar {c.anio}</span>
                      <Badge variant={c.estado === CeremonyState.CERRADA ? "secondary" : "default"}>
                        {c.estado === CeremonyState.CERRADA ? "Cerrada" : "Abierta"}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{c.lugar}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="font-heading text-2xl font-semibold">{c.nominaciones.length}</div>
                    <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      nominaciones
                    </div>
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
