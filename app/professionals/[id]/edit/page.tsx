import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { Professional } from "@/lib/types";
import { updateProfessional } from "@/lib/actions/professionals";

const ROLES = ["Actor Principal", "Actor Secundario", "Director", "Productor"] as const;

export default async function EditProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  let professional: Professional;
  try {
    professional = await api.get<Professional>(`/professionals/${id}`);
  } catch {
    notFound();
  }

  const action = updateProfessional.bind(null, id);
  const currentRoles = professional.roles.map((r) => r.nombre);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Editar profesional</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {professional.nombre} {professional.apellido}
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" defaultValue={professional.nombre} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" defaultValue={professional.apellido} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nacionalidad">Nacionalidad</Label>
          <Input id="nacionalidad" name="nacionalidad" defaultValue={professional.nacionalidad} />
        </div>
        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((rol) => (
              <label key={rol} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  name="roles"
                  value={rol}
                  defaultChecked={currentRoles.includes(rol)}
                  className="rounded"
                />
                {rol}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Guardar cambios</Button>
          <Button variant="outline" render={<Link href="/professionals" />}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
