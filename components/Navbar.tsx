"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthUser, UserRole } from "@/lib/types";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const mainLinks = [
  { href: "/ceremonies", label: "Ceremonias" },
  { href: "/movies", label: "Peliculas" },
  { href: "/professionals", label: "Profesionales" },
  { href: "/categories", label: "Categorias/Premios" },
  { href: "/votes", label: "Votaciones" },
];

interface NavbarProps {
  user?: AuthUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/25 via-primary/8 to-transparent text-sm font-semibold text-primary shadow-sm">
              OA
            </div>
            <div className="min-w-0">
              <div className="font-heading text-lg font-semibold tracking-tight">Premios Oscar</div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Academy Dashboard
              </div>
            </div>
          </div>
        </Link>

        {user ? (
          <>
            <nav className="flex flex-1 items-center gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm">
              {mainLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(196,148,52,0.95)]"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}

              {user.rol === UserRole.ADMIN && (
                <Link
                  href="/audit"
                  className={cn(
                    "whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-all",
                    pathname.startsWith("/audit")
                      ? "bg-primary text-primary-foreground shadow-[0_12px_30px_-18px_rgba(196,148,52,0.95)]"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  Auditoria
                </Link>
              )}
            </nav>

            <div className="shrink-0 rounded-2xl border border-border/60 bg-card/80 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium">
                    {user.nombre} {user.apellido}
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {user.rol}
                  </div>
                </div>
                <form action={logout}>
                  <Button type="submit" variant="outline" size="sm">
                    Cerrar sesion
                  </Button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 justify-end gap-2">
            <Link href="/register">
              <Button size="sm">Crear cuenta</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar sesion
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
