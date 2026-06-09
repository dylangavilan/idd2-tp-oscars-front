"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/ui/app-toast";
import { DeleteButton } from "@/components/DeleteButton";
import { Nomination, CategoryLeaderboard, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { castVote, changeVote } from "@/lib/actions/votes";
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
  ceremonyId,
  isOpen,
  userRole,
  isAdmin,
  groups,
  voteCountMap,
  leaderboards,
  myVotes,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canVote = isOpen && userRole === UserRole.ACADEMY_MEMBER;

  const normalizeId = (value: unknown) => String(value ?? "");

  function handleVote(nominacionId: string, isChanging: boolean) {
    startTransition(async () => {
      try {
        if (isChanging) {
          await changeVote(ceremonyId, nominacionId);
          showToast({ message: "Voto cambiado", type: "success" });
        } else {
          await castVote(ceremonyId, nominacionId);
          showToast({ message: "Voto registrado", type: "success" });
        }
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al votar";
        showToast({ message, type: "alert" });
      }
    });
  }

  const nomineeLabel = (nom: Nomination) =>
    nom.pelicula ? nom.pelicula.titulo : nom.profesional?.nombreCompleto ?? "-";

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const categoryId = normalizeId(group.categoryId);
        const lb = leaderboards[categoryId];
        const votedNominationId = normalizeId(myVotes[categoryId]);
        const totalVotos = lb?.resumen.totalVotosCategoria ?? 0;
        const categoryHasVote = Boolean(votedNominationId);
        const selectedNomination = group.nominations.find(
          (nomination) => normalizeId(nomination._id) === votedNominationId
        );
        const selectedNomineeLabel = selectedNomination ? nomineeLabel(selectedNomination) : null;

        return (
          <div key={categoryId} className="overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-wide text-foreground">
                  {group.categoryName}
                </h3>
                {selectedNomineeLabel && (
                  <p className="mt-1 text-xs text-green-700">Votaste por: {selectedNomineeLabel}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {totalVotos > 0 && (
                  <span className="text-xs text-muted-foreground">{totalVotos} votos</span>
                )}
                {categoryHasVote && (
                  <Badge variant="default" className="text-xs">
                    Tu voto registrado
                  </Badge>
                )}
              </div>
            </div>

            <div className="divide-y">
              {group.nominations.map((nom) => {
                const nominationId = normalizeId(nom._id);
                const isMyVote = votedNominationId === nominationId;
                const votes = voteCountMap[nominationId] ?? 0;
                const pct = totalVotos > 0 ? Math.round((votes / totalVotos) * 100) : 0;
                const showBar = Boolean(lb);
                const rowClassName = cn(
                  "space-y-1.5 px-4 py-3 transition-colors",
                  isMyVote && "border-l-4 border-l-green-600 bg-green-50/70",
                  !isMyVote && canVote && !categoryHasVote && "border-l-4 border-l-amber-400 bg-amber-50/50",
                  !isMyVote && categoryHasVote && "bg-muted/20"
                );

                return (
                  <div key={nominationId} className={rowClassName}>
                    <div className="flex items-center gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <span className={cn("truncate text-sm", nom.esGanador && "font-semibold")}>
                          {nomineeLabel(nom)}
                        </span>

                        <Badge variant="outline" className="shrink-0 text-xs">
                          {nom.pelicula ? "Pelicula" : "Profesional"}
                        </Badge>

                        {nom.esGanador && (
                          <Badge className="shrink-0 bg-yellow-500 text-xs text-black hover:bg-yellow-500">
                            Ganador
                          </Badge>
                        )}

                        {isMyVote && (
                          <Badge className="shrink-0 bg-green-600 text-xs hover:bg-green-600">
                            Tu voto
                          </Badge>
                        )}

                        {!categoryHasVote && canVote && (
                          <Badge
                            variant="outline"
                            className="shrink-0 border-amber-300 bg-amber-50 text-xs text-amber-900"
                          >
                            Pendiente
                          </Badge>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {showBar && (
                          <span className="w-20 text-right text-xs text-muted-foreground">
                            {votes} voto{votes !== 1 ? "s" : ""} ({pct}%)
                          </span>
                        )}

                        {canVote && !isMyVote && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(nominationId, categoryHasVote)}
                            disabled={isPending}
                          >
                            {categoryHasVote ? "Cambiar voto" : "Votar"}
                          </Button>
                        )}

                        {isAdmin && (
                          <DeleteButton
                            action={deleteNominacion.bind(null, ceremonyId, nominationId)}
                            label="nominacion"
                          />
                        )}
                      </div>
                    </div>

                    {showBar && (
                      <div className="h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-green-500/70 transition-all duration-500"
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
