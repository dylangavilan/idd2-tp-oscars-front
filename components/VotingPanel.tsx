"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/app-toast";
import { DeleteButton } from "@/components/DeleteButton";
import { Nomination, CategoryLeaderboard, UserRole } from "@/lib/types";
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
  voteCountMap: Record<string, number>;
  leaderboards: Record<string, CategoryLeaderboard>;
  myVotes: Record<string, string>;
}

export function VotingPanel({
  ceremonyId, isOpen, userRole, isAdmin, groups, voteCountMap, leaderboards, myVotes,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canVote = isOpen && userRole === UserRole.ACADEMY_MEMBER;

  function handleVote(nominacionId: string) {
    startTransition(async () => {
      try {
        await castVote(ceremonyId, nominacionId);
        showToast({ message: "Voto registrado", type: "success" });
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al votar";
        const type = message.includes("ya emitio un voto") ? "warn" : "alert";
        showToast({ message, type });
      }
    });
  }

  const nomineeLabel = (nom: Nomination) =>
    nom.pelicula ? nom.pelicula.titulo : nom.profesional?.nombreCompleto ?? "—";

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const lb = leaderboards[group.categoryId];
        const totalVotos = lb?.resumen.totalVotosCategoria ?? 0;

        return (
          <div key={group.categoryId} className="border rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 flex items-center justify-between">
              <h3 className="font-medium text-sm">{group.categoryName}</h3>
              <div className="flex items-center gap-3">
                {totalVotos > 0 && (
                  <span className="text-xs text-muted-foreground">{totalVotos} votos</span>
                )}
                {myVotes[group.categoryId] && (
                  <Badge variant="default" className="text-xs">Tu voto registrado</Badge>
                )}
              </div>
            </div>

            <div className="divide-y">
              {group.nominations.map((nom) => {
                const isMyVote = myVotes[group.categoryId] === nom._id;
                const votes = voteCountMap[nom._id] ?? 0;
                const pct = totalVotos > 0 ? Math.round((votes / totalVotos) * 100) : 0;
                const showBar = !!lb;

                return (
                  <div key={nom._id} className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center gap-3">
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
                        {showBar && (
                          <span className="text-xs text-muted-foreground w-20 text-right">
                            {votes} voto{votes !== 1 ? "s" : ""} ({pct}%)
                          </span>
                        )}

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
                          <DeleteButton
                            action={deleteNominacion.bind(null, ceremonyId, nom._id)}
                            label="nominación"
                          />
                        )}
                      </div>
                    </div>

                    {/* Vote bar */}
                    {showBar && (
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/50 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
