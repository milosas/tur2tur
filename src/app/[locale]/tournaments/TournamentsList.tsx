"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import { User, MapPin, Calendar, Users } from "lucide-react";
import type { TournamentStatus } from "@/lib/types";

type DBTournament = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
  venue: string | null;
  accent_colors: string[] | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  teams?: { count: number }[];
};

const COLUMN_LIMIT = 5;

function TournamentColumn({
  label,
  tournaments,
}: {
  label: string;
  tournaments: DBTournament[];
}) {
  const t = useTranslations("Tournaments");
  const tDash = useTranslations("Dashboard");

  const visible = tournaments.slice(0, COLUMN_LIMIT);
  const hasMore = tournaments.length > COLUMN_LIMIT;

  return (
    <div className="flex flex-col min-w-0">
      <h2 className="text-sm font-bold mb-3 flex items-center gap-2 px-1">
        {label}
        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
          {tournaments.length}
        </Badge>
      </h2>

      {tournaments.length === 0 ? (
        <div className="border rounded-lg p-6 text-center flex-1">
          <p className="text-xs text-muted-foreground">{t("noTournaments")}</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="divide-y flex-1">
            {visible.map((tournament) => {
              const ac = tournament.accent_colors ?? [];
              const primary = ac[0] ?? null;
              const organizer =
                tournament.profiles?.full_name ||
                tournament.profiles?.email ||
                null;
              const teamCount = tournament.teams?.[0]?.count ?? 0;
              const dateStr = tournament.start_date
                ? new Date(tournament.start_date).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                  })
                : null;

              return (
                <Link
                  key={tournament.id}
                  href={`/tournaments/${tournament.id}`}
                  className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
                >
                  {primary && (
                    <span
                      className="w-1 rounded-full shrink-0 self-stretch"
                      style={{ backgroundColor: primary }}
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Name */}
                    <span className="font-semibold text-sm leading-tight truncate block">
                      {tournament.name}
                    </span>

                    {/* Meta row */}
                    <div className="flex items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground flex-wrap">
                      {dateStr && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {dateStr}
                        </span>
                      )}
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Users className="h-3 w-3 shrink-0" />
                        {teamCount}
                      </span>
                      {tournament.venue && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{tournament.venue}</span>
                        </span>
                      )}
                      {organizer && (
                        <span className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{organizer}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge
                    status={tournament.status as TournamentStatus}
                  />
                </Link>
              );
            })}
          </div>
          {hasMore && (
            <div className="border-t p-2 text-center mt-auto">
              <Link
                href="/tournaments"
                className="text-xs text-primary hover:underline"
              >
                {t("viewMore")} →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TournamentsList({
  tournaments,
}: {
  tournaments: DBTournament[];
}) {
  const t = useTranslations("Tournaments");

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-muted-foreground text-lg">{t("noTournaments")}</p>
      </div>
    );
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  const ongoing: DBTournament[] = [];
  const upcoming: DBTournament[] = [];
  const past: DBTournament[] = [];

  for (const tour of tournaments) {
    const isActive = ["in_progress", "group_stage", "playoffs"].includes(tour.status);
    if (!tour.start_date) {
      upcoming.push(tour);
      continue;
    }
    const dateStr = tour.start_date.slice(0, 10);
    if (isActive || dateStr === todayStr) {
      ongoing.push(tour);
    } else if (dateStr > todayStr) {
      upcoming.push(tour);
    } else {
      past.push(tour);
    }
  }

  const sortAsc = (a: DBTournament, b: DBTournament) =>
    (a.start_date ?? "").localeCompare(b.start_date ?? "");
  const sortDesc = (a: DBTournament, b: DBTournament) =>
    (b.start_date ?? "").localeCompare(a.start_date ?? "");

  ongoing.sort(sortAsc);
  upcoming.sort(sortAsc);
  past.sort(sortDesc);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TournamentColumn label={t("ongoingTournaments")} tournaments={ongoing} />
      <TournamentColumn label={t("upcomingTournaments")} tournaments={upcoming} />
      <TournamentColumn label={t("pastTournaments")} tournaments={past} />
    </div>
  );
}
