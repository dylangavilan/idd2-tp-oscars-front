"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/DeleteButton";
import { Nomination, VoteCount, UserRole } from "@/lib/types";
import { castVote } from "@/lib/actions/votes";
import { deleteNominacion } from "@/lib/actions/ceremonies";

interface CategoryGroup {
  categoryId: string;
  categoryName: string;
  nominations: Nomination[];
}

interface Props {
  ceremonyId: string;
  isOpen: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  groups: CategoryGroup[];
  voteCounts: VoteCount[];
  myVotes: Record<string, string>;
}

export function VotingPanel({ ceremonyId, isOpen, userRole, isAdmin, groups, voteCounts, myVotes }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canVote = isOpen && userRole === UserRole.ACADEMY_MEMBER;

  const countMap: Record<string, number> = {};
  for (const vc of voteCounts) {
    countMap[vc.nominacionId] = vc.votos;
  }

  function handleVote(nominacionId: string) {
    startTransition(async () => {
      try {
        await castVote(ceremonyId, nominacionId);
        toast.success("Voto registrado");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error al votar");
      }
    });
  }

  const nomineeLabel = (nom: Nomination) =>
    nom.pelicula ? nom.pelicula.titulo : nom.profesional?.nombreCompleto ?? "—";

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.categoryId} className="border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/40 flex items-center justify-between">
            <h3 className="font-medium text-sm">{group.categoryName}</h3>
            {myVotes[group.categoryId] && (
              <Badge variant="default" className="text-xs">Tu voto registrado</Badge>
            )}
          </div>

          <div className="divide-y">
            {group.nominations.map((nom) => {
              const isMyVote = myVotes[group.categoryId] === nom._id;
              const votes = countMap[nom._id] ?? 0;

              return (
                <div key={nom._id} className="px-4 py-3 flex items-center gap-3">
                  {/* Left: nominee info */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className={`text-sm truncate ${nom.esGanador ? "font-semibold" : ""}`}>
                      {nomineeLabel(nom)}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {nom.pelicula ? "Película" : "Profesional"}
                    </Badge>
                    {nom.esGanador && (
                      <Badge className="text-xs shrink-0 bg-yellow-500 text-black hover:bg-yellow-500">
                        Ganador
                      </Badge>
                    )}
                  </div>

                  {/* Right: votes + actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {votes} voto{votes !== 1 ? "s" : ""}
                    </span>

                    {canVote && (
                      <Button
                        size="sm"
                        variant={isMyVote ? "default" : "outline"}
                        onClick={() => handleVote(nom._id)}
                        disabled={isPending}
                      >
                        {isMyVote ? "Votado" : "Votar"}
                      </Button>
                    )}

                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <Link href={`/ceremonies/${ceremonyId}/nominaciones/${nom._id}/edit`} />
                          }
                        >
                          Editar
                        </Button>
                        <DeleteButton
                          action={deleteNominacion.bind(null, ceremonyId, nom._id)}
                          label="nominación"
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
