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
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          Premios Oscar
        </Link>

        {user ? (
          <>
            <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
              {mainLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
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
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors",
                    pathname.startsWith("/audit")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  Auditoria
                </Link>
              )}
            </nav>

            <div className="shrink-0 flex items-center gap-3">
              <span className="hidden text-sm text-muted-foreground sm:block">
                {user.nombre} {user.apellido} <span className="text-xs opacity-50">({user.rol})</span>
              </span>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Cerrar sesion
                </Button>
              </form>
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
