import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProfessional } from "@/lib/actions/professionals";

const ROLES = ["Actor Principal", "Actor Secundario", "Director", "Productor", "Otro"];

export default async function NewProfessionalPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nuevo profesional</h1>
        <p className="text-sm text-muted-foreground mt-1">Registrá un actor, director o productor</p>
      </div>

      <form action={createProfessional} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nacionalidad">Nacionalidad</Label>
          <Input id="nacionalidad" name="nacionalidad" placeholder="Ej: Argentina" />
        </div>
        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((rol) => (
              <label key={rol} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="roles" value={rol} className="rounded" />
                {rol}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Crear profesional</Button>
          <Button variant="outline" render={<Link href="/professionals" />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
