import { api } from "@/lib/api";
import { Professional } from "@/lib/types";
import { MovieForm } from "@/components/MovieForm";

export default async function NewMoviePage() {

  const professionals = await api.get<Professional[]>("/professionals");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Nueva película</h1>
        <p className="text-sm text-muted-foreground mt-1">Registrá una nueva película</p>
      </div>
      <MovieForm professionals={professionals} />
    </div>
  );
}
