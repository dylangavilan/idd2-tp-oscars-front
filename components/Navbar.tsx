"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AuthUser, UserRole } from "@/lib/types";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const mainLinks = [
  { href: "/ceremonies", label: "Ceremonias" },
  { href: "/movies", label: "Películas" },
  { href: "/professionals", label: "Profesionales" },
  { href: "/categories", label: "Categorías" },
  { href: "/votes", label: "Votaciones" },
];

interface NavbarProps {
  user?: AuthUser | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 max-w-6xl flex items-center gap-4 h-14">
        <Link href="/" className="font-semibold text-sm tracking-tight shrink-0 hover:opacity-80 transition-opacity">
          Premios Oscar
        </Link>

        {user ? (
          <>
            <nav className="flex items-center gap-1 overflow-x-auto flex-1">
              {mainLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
                    "px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors",
                    pathname.startsWith("/audit")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  Auditoría
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.nombre}{" "}
                <span className="opacity-50 text-xs">({user.rol})</span>
              </span>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  Cerrar sesión
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-end gap-2">
            <Link href="/register">
              <Button size="sm">Crear cuenta</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
