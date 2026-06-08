import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import {
  Ceremony,
  VoteCountsResponse,
  VotingStatus,
  CeremonyResults,
  CategoryLeaderboard,
  Category,
  Movie,
  Professional,
  CeremonyState,
} from "@/lib/types";
import { getAuthContext } from "@/lib/session";
import { FlashToast } from "@/components/FlashToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VotingPanel } from "@/components/VotingPanel";
import { VotingProgress } from "@/components/VotingProgress";
import { CeremonyResultsView } from "@/components/CeremonyResultsView";
import { AddNominationModal } from "@/components/AddNominationModal";
import { MusicalPerformancesSection } from "@/components/MusicalPerformancesSection";
import { closeCeremony } from "@/lib/actions/ceremonies";

interface TieCategoryDetail {
  categoryId: string;
  categoryName: string;
  votes: number;
  nominations: {
    id: string;
    label: string;
    tipo: "pelicula" | "profesional";
  }[];
}

export default async function CeremonyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    toastMessage?: string;
    type?: "alert" | "info" | "warn" | "success";
    tieDetails?: string;
  }>;
}) {
  const { id } = await params;
  const toastParams = (await searchParams) ?? {};
  let tieCategories: TieCategoryDetail[] = [];

  if (toastParams.tieDetails) {
    try {
      const parsed = JSON.parse(decodeURIComponent(toastParams.tieDetails)) as {
        categories?: TieCategoryDetail[];
      };
      tieCategories = parsed.categories ?? [];
    } catch {}
  }

  let ceremony: Ceremony;
  try {
    ceremony = await api.get<Ceremony>(`/ceremonies/${id}`);
  } catch {
    notFound();
  }

  const { session, isAdmin, isAcademyMember } = await getAuthContext();
  
  
  const isOpen = ceremony.estado === CeremonyState.ABIERTA;

  // Vote counts (flat map por nominación para VotingPanel)
  const voteCountMap: Record<string, number> = {};
  let totalVotosCeremonia = 0;

  // My votes (for academy member voting state)
  const myVotes: Record<string, string> = {};

  // Voting status progress (academy member, open ceremony)
  let votingStatus: VotingStatus | null = null;

  // Results (closed ceremony, all authenticated)
  let results: CeremonyResults | null = null;

  // Leaderboard per category (admin always, others only when closed)
  const leaderboards: Record<string, CategoryLeaderboard> = {};

  if (session) {
    // Vote counts always fetched for authenticated users
    try {
      const countsResp = await api.get<VoteCountsResponse>(`/votes?idCeremonia=${id}`);
      totalVotosCeremonia = countsResp.resumen.totalVotosCeremonia;
      for (const r of countsResp.resultados) {
        voteCountMap[r.nominacion.id] = r.votos;
      }
    } catch {}

    // My votes (academy member)
    if (isAcademyMember) {
      try {
        const myVotesResp = await api.get<{
          voto: { id: string };
          nominacion: { id: string; categoria: { id: string } };
        }[]>(
          `/votes/my-votes?idCeremonia=${id}`
        );
        for (const v of myVotesResp) {
          myVotes[v.nominacion.categoria.id] = v.nominacion.id;
        }
      } catch {}
    }

    // Voting progress (academy member + open)
    if (isAcademyMember && isOpen) {
      try {
        votingStatus = await api.get<VotingStatus>(`/votes/me/status?idCeremonia=${id}`);
      } catch {}
    }

    // Results (closed ceremony)
    if (!isOpen) {
      try {
        results = await api.get<CeremonyResults>(`/ceremonies/${id}/results`);
      } catch {}
    }

    // Leaderboard per category (admin always, all when closed)
    if (isAdmin || !isOpen) {
      const categoryIds = [...new Set(ceremony.nominaciones.map((n) => n.categoria.id))];
      await Promise.all(
        categoryIds.map(async (catId) => {
          try {
            leaderboards[catId] = await api.get<CategoryLeaderboard>(
              `/ceremonies/${id}/categories/${catId}/leaderboard`
            );
          } catch {}
        })
      );
    }
  }

  // For admin modal: fetch selectable data
  let categories: Category[] = [];
  let movies: Movie[] = [];
  let professionals: Professional[] = [];
  if (isAdmin && isOpen) {
    [categories, movies, professionals] = await Promise.all([
      api.get<Category[]>("/categories").catch(() => []),
      api.get<Movie[]>("/movies").catch(() => []),
      api.get<Professional[]>("/professionals").catch(() => []),
    ]);
  }

  // Group nominations by category
  const groups = Object.values(
    ceremony.nominaciones.reduce<
      Record<string, { categoryId: string; categoryName: string; nominations: typeof ceremony.nominaciones }>
    >((acc, nom) => {
      const catId = nom.categoria.id;
      if (!acc[catId])
        acc[catId] = { categoryId: catId, categoryName: nom.categoria.nombre, nominations: [] };
      acc[catId].nominations.push(nom);
      return acc;
    }, {})
  );

  return (
    <div className="space-y-8">
      <FlashToast message={toastParams.toastMessage} type={toastParams.type} />
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Oscar {ceremony.anio}</h1>
            <Badge variant={isOpen ? "default" : "secondary"}>
              {isOpen ? "Abierta" : "Cerrada"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(ceremony.fecha).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            — {ceremony.lugar}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" render={<Link href={`/ceremonies/${id}/edit`} />}>
              Editar
            </Button>
            {isOpen && (
              <form action={closeCeremony.bind(null, id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Cerrar ceremonia
                </Button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Voting progress (academy member, open ceremony) */}
      {votingStatus && <VotingProgress status={votingStatus} />}

      {isAdmin && isOpen && tieCategories.length > 0 && (
        <section className="rounded-[1.6rem] border border-red-500/20 bg-red-500/8 px-5 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="border-red-500/20 bg-red-500/12 text-red-700 dark:text-red-300">
                Cierre bloqueado
              </Badge>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                La ceremonia no puede cerrarse mientras existan empates en primer lugar.
              </p>
            </div>
            <div className="space-y-3">
              {tieCategories.map((item) => (
                <div
                  key={item.categoryId}
                  className="rounded-2xl border border-red-500/15 bg-background/75 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">{item.categoryName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.votes} votos en empate entre {item.nominations.length} nominaciones.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.nominations.map((nomination) => (
                      <Badge key={nomination.id} variant="outline" className="border-red-500/20 bg-red-500/6">
                        {nomination.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <MusicalPerformancesSection
        ceremonyId={id}
        performances={ceremony.actuaciones}
        isAdmin={isAdmin}
        isOpen={isOpen}
      />

      {/* Nominations + leaderboard */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              Nominaciones
              <span className="text-muted-foreground font-normal text-sm ml-2">
                ({ceremony.nominaciones.length})
              </span>
            </h2>
            {session && isOpen && totalVotosCeremonia > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalVotosCeremonia} {totalVotosCeremonia === 1 ? "voto emitido" : "votos emitidos"}
              </p>
            )}
          </div>
          {isAdmin && isOpen && (
            <AddNominationModal
              ceremonyId={id}
              categories={categories}
              movies={movies}
              professionals={professionals}
            />
          )}
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No hay nominaciones todavía.{" "}
            {isAdmin && isOpen && "Usá el botón para agregar la primera."}
          </div>
        ) : (
          <VotingPanel
            ceremonyId={id}
            isOpen={isOpen}
            userRole={session?.rol ?? null}
            isAdmin={isAdmin}
            groups={groups}
            voteCountMap={voteCountMap}
            leaderboards={leaderboards}
            myVotes={myVotes}
          />
        )}
      </section>

      {/* Results (closed ceremony) */}
      {results && <CeremonyResultsView results={results} />}
    </div>
  );
}
