import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import { getSession } from "@/lib/session";
import {
  Category,
  Ceremony,
  HistoryWinner,
  NomineeType,
  TopAwardedProfessional,
  TopNominatedProfessional,
  TopParticipantCategory,
  TopVotedCeremony,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SearchValue = string | string[] | undefined;
type SearchParamsInput = Record<string, SearchValue>;

interface HistoryPageProps {
  searchParams?: Promise<SearchParamsInput>;
}

const HISTORY_LIMIT = 10;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHistoryPath(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  const serialized = query.toString();
  return serialized ? `/history?${serialized}` : "/history";
}

function nomineeTypeLabel(type: NomineeType) {
  return type === NomineeType.PELICULA ? "Pelicula" : "Profesional";
}

function selectClassName() {
  return "flex h-10 w-full rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/30 disabled:opacity-50";
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-muted/25 px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
      {message}
    </div>
  );
}

function QuerySummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: ReactNode;
}) {
  return (
    <Card size="sm" className="border-border/70 bg-card/82 py-0">
      <CardContent className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-heading text-3xl font-semibold tracking-tight">{value}</p>
        <div className="mt-2 text-sm text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function LookupResultsTable({
  rows,
  emptyMessage,
}: {
  rows: HistoryWinner[];
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ceremonia</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Ganador</TableHead>
          <TableHead>Tipo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={`${row.ceremonyId}-${row.categoryId}`}>
            <TableCell>
              <div className="space-y-1">
                <p className="font-semibold">Oscar {row.anio}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(row.fecha).toLocaleDateString("es-AR")} - {row.lugar}
                </p>
              </div>
            </TableCell>
            <TableCell className="font-medium">{row.categoryName}</TableCell>
            <TableCell>{row.winnerName}</TableCell>
            <TableCell>
              <Badge variant="outline">{nomineeTypeLabel(row.winnerType)}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RankingTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: ReactNode[];
  emptyMessage: string;
}) {
  if (!rows.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>{rows}</TableBody>
    </Table>
  );
}

async function safeGet<T>(path: string) {
  try {
    return { data: await api.get<T>(path), error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo cargar la informacion.";
    return { data: null, error: message };
  }
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const params = (await searchParams) ?? {};
  const winnerCeremonyId = firstValue(params.winnerCeremonyId);
  const winnerCategoryId = firstValue(params.winnerCategoryId);
  const awardCeremonyId = firstValue(params.awardCeremonyId);
  const awardCategoryId = firstValue(params.awardCategoryId);

  const [
    ceremoniesResult,
    categoriesResult,
    topNominatedResult,
    topAwardedResult,
    topVotedResult,
    topParticipantsResult,
  ] = await Promise.all([
    safeGet<Ceremony[]>("/ceremonies"),
    safeGet<Category[]>("/categories"),
    safeGet<TopNominatedProfessional[]>(
      `/history/professionals/top-nominated?limit=${HISTORY_LIMIT}`
    ),
    safeGet<TopAwardedProfessional[]>(
      `/history/professionals/top-awarded?limit=${HISTORY_LIMIT}`
    ),
    safeGet<TopVotedCeremony[]>(
      `/history/ceremonies/top-voted?limit=${HISTORY_LIMIT}`
    ),
    safeGet<TopParticipantCategory[]>(
      `/history/categories/top-participants?limit=${HISTORY_LIMIT}`
    ),
  ]);

  const ceremonies = ceremoniesResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const closedCeremonies = ceremonies
    .filter((ceremony) => ceremony.estado === "cerrada")
    .sort((left, right) => right.anio - left.anio);
  const closedCeremonyById = new Map(closedCeremonies.map((ceremony) => [ceremony._id, ceremony]));

  const winnerSelectedCeremony = winnerCeremonyId ? closedCeremonyById.get(winnerCeremonyId) : null;
  const awardSelectedCeremony = awardCeremonyId ? closedCeremonyById.get(awardCeremonyId) : null;

  const winnerCategories = winnerSelectedCeremony
    ? Array.from(
        new Map(
          winnerSelectedCeremony.nominaciones.map((nomination) => [
            nomination.categoria.id,
            { _id: nomination.categoria.id, nombre: nomination.categoria.nombre, descripcion: "" },
          ])
        ).values()
      ).sort((left, right) => left.nombre.localeCompare(right.nombre))
    : [...categories].sort((left, right) => left.nombre.localeCompare(right.nombre));

  const awardCategories = awardSelectedCeremony
    ? Array.from(
        new Map(
          awardSelectedCeremony.nominaciones.map((nomination) => [
            nomination.categoria.id,
            { _id: nomination.categoria.id, nombre: nomination.categoria.nombre, descripcion: "" },
          ])
        ).values()
      ).sort((left, right) => left.nombre.localeCompare(right.nombre))
    : [...categories].sort((left, right) => left.nombre.localeCompare(right.nombre));

  const winnersQuery = new URLSearchParams();
  if (winnerCeremonyId) winnersQuery.set("ceremonyId", winnerCeremonyId);
  if (winnerCategoryId) winnersQuery.set("categoryId", winnerCategoryId);

  const awardsQuery = new URLSearchParams();
  if (awardCeremonyId) awardsQuery.set("ceremonyId", awardCeremonyId);
  if (awardCategoryId) awardsQuery.set("categoryId", awardCategoryId);

  const winnersLookup = await safeGet<HistoryWinner[]>(
    winnersQuery.size > 0 ? `/history/winners?${winnersQuery.toString()}` : "/history/winners"
  );

  const awardsLookup = await safeGet<HistoryWinner[]>(
    awardsQuery.size > 0 ? `/history/awards?${awardsQuery.toString()}` : "/history/awards"
  );

  const winnerClearHref = buildHistoryPath({
    awardCeremonyId,
    awardCategoryId,
  });
  const awardClearHref = buildHistoryPath({
    winnerCeremonyId,
    winnerCategoryId,
  });

  const topNominated = topNominatedResult.data ?? [];
  const topAwarded = topAwardedResult.data ?? [];
  const topVoted = topVotedResult.data ?? [];
  const topParticipants = topParticipantsResult.data ?? [];
  const topAwardCount = topAwarded[0]?.awardCount ?? 0;
  const topAwardLeaders = topAwarded.filter((row) => row.awardCount === topAwardCount);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(238,244,250,0.95))] p-6 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(52,113,196,0.18),transparent_62%)] lg:block" />
        <div className="relative space-y-4">
          <Badge variant="secondary" className="w-fit">
            Historicos y reportes
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-4xl font-heading text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
              Consulta resultados historicos y rankings consolidados desde Cassandra.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Accede a ganadores, premios y reportes agregados sobre ceremonias cerradas desde una
              vista unificada para cualquier perfil autenticado.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuerySummaryCard
          label="Ceremonias cerradas"
          value={closedCeremonies.length}
          hint="Base historica disponible para reportes."
        />
        <QuerySummaryCard
          label="Categorias activas"
          value={categories.length}
          hint="Categorias consultables en rankings y filtros."
        />
        <QuerySummaryCard
          label="Top votos"
          value={topVoted[0]?.totalVotes ?? 0}
          hint={topVoted[0] ? `Maximo registrado en la ceremonia Oscar ${topVoted[0].anio}.` : "Sin registros historicos."}
        />
        <QuerySummaryCard
          label="Top premios"
          value={topAwarded[0]?.awardCount ?? 0}
          hint={
            topAwardLeaders.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topAwardLeaders.map((row) => (
                  <Badge
                    key={row.professionalId}
                    variant="outline"
                    className="border-primary/20 bg-primary/8 text-primary"
                  >
                    {row.nombreCompleto}
                  </Badge>
                ))}
              </div>
            ) : (
              "Sin profesionales premiados aun."
            )
          }
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Ganadores historicos</CardTitle>
            <CardDescription>
              Filtra por ceremonia, categoria o ambas para recuperar los ganadores almacenados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <form action="/history" className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="winnerCeremonyId" className="text-sm font-medium">
                  Ceremonia
                </label>
                <select
                  id="winnerCeremonyId"
                  name="winnerCeremonyId"
                  defaultValue={winnerCeremonyId ?? ""}
                  className={selectClassName()}
                >
                  <option value="">Todas</option>
                  {closedCeremonies.map((ceremony) => (
                    <option key={ceremony._id} value={ceremony._id}>
                      Oscar {ceremony.anio} - {ceremony.lugar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="winnerCategoryId" className="text-sm font-medium">
                  Categoria
                </label>
                <select
                  id="winnerCategoryId"
                  name="winnerCategoryId"
                  defaultValue={winnerCategoryId ?? ""}
                  className={selectClassName()}
                >
                  <option value="">Todas</option>
                  {winnerCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {awardCeremonyId ? <input type="hidden" name="awardCeremonyId" value={awardCeremonyId} /> : null}
              {awardCategoryId ? <input type="hidden" name="awardCategoryId" value={awardCategoryId} /> : null}

              <Button type="submit" variant="outline">
                Consultar
              </Button>
              <Button variant="ghost" render={<Link href={winnerClearHref} />}>
                Limpiar
              </Button>
            </form>

            {winnersLookup.error ? <ErrorState message={winnersLookup.error} /> : null}

            <LookupResultsTable
              rows={winnersLookup.data ?? []}
              emptyMessage="No se encontraron ganadores para el filtro seleccionado."
            />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Historial de premios</CardTitle>
            <CardDescription>
              Repite la consulta sobre la proyeccion historica de premios otorgados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <form action="/history" className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <div className="space-y-2">
                <label htmlFor="awardCeremonyId" className="text-sm font-medium">
                  Ceremonia
                </label>
                <select
                  id="awardCeremonyId"
                  name="awardCeremonyId"
                  defaultValue={awardCeremonyId ?? ""}
                  className={selectClassName()}
                >
                  <option value="">Todas</option>
                  {closedCeremonies.map((ceremony) => (
                    <option key={ceremony._id} value={ceremony._id}>
                      Oscar {ceremony.anio} - {ceremony.lugar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="awardCategoryId" className="text-sm font-medium">
                  Categoria
                </label>
                <select
                  id="awardCategoryId"
                  name="awardCategoryId"
                  defaultValue={awardCategoryId ?? ""}
                  className={selectClassName()}
                >
                  <option value="">Todas</option>
                  {awardCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {winnerCeremonyId ? <input type="hidden" name="winnerCeremonyId" value={winnerCeremonyId} /> : null}
              {winnerCategoryId ? <input type="hidden" name="winnerCategoryId" value={winnerCategoryId} /> : null}

              <Button type="submit" variant="outline">
                Consultar
              </Button>
              <Button variant="ghost" render={<Link href={awardClearHref} />}>
                Limpiar
              </Button>
            </form>

            {awardsLookup.error ? <ErrorState message={awardsLookup.error} /> : null}

            <LookupResultsTable
              rows={awardsLookup.data ?? []}
              emptyMessage="No se encontraron premios para el filtro seleccionado."
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Profesionales mas nominados</CardTitle>
            <CardDescription>
              Ranking consolidado de nominaciones historicas registradas en ceremonias cerradas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {topNominatedResult.error ? (
              <ErrorState message={topNominatedResult.error} />
            ) : (
              <RankingTable
                headers={["Profesional", "Nominaciones"]}
                emptyMessage="Todavia no hay nominaciones historicas sincronizadas."
                rows={topNominated.map((row) => (
                  <TableRow key={row.professionalId}>
                    <TableCell className="font-medium">{row.nombreCompleto}</TableCell>
                    <TableCell>{row.nominationCount}</TableCell>
                  </TableRow>
                ))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Profesionales mas premiados</CardTitle>
            <CardDescription>
              Premios obtenidos y suma de votos recibidos en cada nominacion ganada.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {topAwardedResult.error ? (
              <ErrorState message={topAwardedResult.error} />
            ) : (
              <RankingTable
                headers={["Profesional", "Premios", "Votos ganadores"]}
                emptyMessage="Todavia no hay premios historicos sincronizados."
                rows={topAwarded.map((row) => (
                  <TableRow key={row.professionalId}>
                    <TableCell className="font-medium">{row.nombreCompleto}</TableCell>
                    <TableCell>{row.awardCount}</TableCell>
                    <TableCell>{row.winningVotesTotal}</TableCell>
                  </TableRow>
                ))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Ceremonias mas votadas</CardTitle>
            <CardDescription>
              Ceremonias cerradas ordenadas por volumen total de votos emitidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {topVotedResult.error ? (
              <ErrorState message={topVotedResult.error} />
            ) : (
              <RankingTable
                headers={["Ceremonia", "Lugar", "Votos"]}
                emptyMessage="No hay ceremonias cerradas con votos historicos todavia."
                rows={topVoted.map((row) => (
                  <TableRow key={row.ceremonyId}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">Oscar {row.anio}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(row.fecha).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{row.lugar}</TableCell>
                    <TableCell>{row.totalVotes}</TableCell>
                  </TableRow>
                ))}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/84 py-0">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Categorias con mas participantes</CardTitle>
            <CardDescription>
              Cantidad de nominaciones registradas por categoria dentro de cada ceremonia cerrada.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            {topParticipantsResult.error ? (
              <ErrorState message={topParticipantsResult.error} />
            ) : (
              <RankingTable
                headers={["Categoria", "Ceremonia", "Participantes"]}
                emptyMessage="No hay categorias historicas sincronizadas todavia."
                rows={topParticipants.map((row) => (
                  <TableRow key={`${row.ceremonyId}-${row.categoryId}`}>
                    <TableCell className="font-medium">{row.categoryName}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold">Oscar {row.anio}</p>
                        <p className="text-xs text-muted-foreground">{row.lugar}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.participantCount}</TableCell>
                  </TableRow>
                ))}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
