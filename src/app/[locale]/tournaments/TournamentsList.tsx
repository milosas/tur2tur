"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import type { TournamentStatus } from "@/lib/types";

type DBTournament = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
};

export function TournamentsList({
  tournaments,
}: {
  tournaments: DBTournament[];
}) {
  const t = useTranslations("Tournaments");
  const tDash = useTranslations("Dashboard");

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-muted-foreground text-lg">{t("noTournaments")}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
      {tournaments.map((tournament) => (
        <Link key={tournament.id} href={`/tournaments/${tournament.id}`}>
          <Card className="hover-lift cursor-pointer h-full transition-all active:scale-[0.98]">
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base sm:text-lg leading-tight">{tournament.name}</CardTitle>
                <StatusBadge
                  status={tournament.status as TournamentStatus}
                />
              </div>
            </CardHeader>
            <CardContent>
              {tournament.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {tournament.description}
                </p>
              )}
              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {tDash.has(`formatOptions.${tournament.format}`)
                    ? tDash(`formatOptions.${tournament.format}` as any)
                    : tournament.format}
                </Badge>
                <span>{t("teams", { count: tournament.max_teams })}</span>
                {tournament.start_date && (
                  <span>
                    {t("startDate", {
                      date: new Date(
                        tournament.start_date
                      ).toLocaleDateString(),
                    })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
