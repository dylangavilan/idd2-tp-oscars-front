import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCeremony } from "@/lib/actions/ceremonies";

export default async function NewCeremonyPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva ceremonia</h1>
        <p className="text-sm text-muted-foreground mt-1">Registrá una nueva edición de los Oscar</p>
      </div>

      <form action={createCeremony} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            name="anio"
            type="number"
            min={1929}
            max={new Date().getFullYear() + 2}
            placeholder="Ej: 2024"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de la ceremonia</Label>
          <Input id="fecha" name="fecha" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lugar">Lugar</Label>
          <Input id="lugar" name="lugar" placeholder="Ej: Dolby Theatre, Los Ángeles" required />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Crear ceremonia</Button>
          <Button variant="outline" render={<Link href="/ceremonies" />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
