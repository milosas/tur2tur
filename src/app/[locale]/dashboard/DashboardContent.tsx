"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import { DeleteDialog } from "@/components/tournament/DeleteDialog";
import { Plus, Pencil, Users, Swords } from "lucide-react";
import type { TournamentStatus } from "@/lib/types";

type DBTournament = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
  created_at: string;
};

export function DashboardContent({
  tournaments,
}: {
  tournaments: DBTournament[];
}) {
  const t = useTranslations("Dashboard");
  const tTeams = useTranslations("Teams");
  const tMatches = useTranslations("Matches");

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{t("myTournaments")}</h1>
        <Button asChild>
          <Link href="/dashboard/create">
            <Plus className="h-4 w-4 mr-2" />
            {t("createTournament")}
          </Link>
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">{t("noTournaments")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{tournament.name}</CardTitle>
                  <StatusBadge
                    status={tournament.status as TournamentStatus}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {tournament.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {tournament.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                  <Badge variant="outline">
                    {t.has(`formatOptions.${tournament.format}`)
                      ? t(`formatOptions.${tournament.format}` as any)
                      : tournament.format}
                  </Badge>
                  <span>{t("maxTeams")}: {tournament.max_teams}</span>
                  {tournament.start_date && (
                    <span>
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tournament/${tournament.id}/teams`}>
                      <Users className="h-3 w-3 mr-1" />
                      {tTeams("manageTeams")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tournament/${tournament.id}/matches`}>
                      <Swords className="h-3 w-3 mr-1" />
                      {t("manageMatches")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/edit/${tournament.id}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      {t("editTournament")}
                    </Link>
                  </Button>
                  <DeleteDialog
                    tournamentId={tournament.id}
                    tournamentName={tournament.name}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
