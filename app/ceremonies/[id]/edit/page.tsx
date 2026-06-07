import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Ceremony } from "@/lib/types";
import { updateCeremony } from "@/lib/actions/ceremonies";

export default async function EditCeremonyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let ceremony: Ceremony;
  try {
    ceremony = await api.get<Ceremony>(`/ceremonies/${id}`);
  } catch {
    notFound();
  }

  const action = updateCeremony.bind(null, id);
  const fechaISO = ceremony.fecha ? ceremony.fecha.slice(0, 10) : "";

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar ceremonia</h1>
        <p className="text-sm text-muted-foreground mt-1">Oscar {ceremony.anio}</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            name="anio"
            type="number"
            min={1929}
            defaultValue={ceremony.anio}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fecha">Fecha de la ceremonia</Label>
          <Input id="fecha" name="fecha" type="date" defaultValue={fechaISO} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lugar">Lugar</Label>
          <Input id="lugar" name="lugar" defaultValue={ceremony.lugar} required />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Guardar cambios</Button>
          <Button variant="outline" render={<Link href={`/ceremonies/${id}`} />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
