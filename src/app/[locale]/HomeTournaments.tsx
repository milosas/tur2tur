"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  categorizeTournaments,
  type TournamentListItem,
} from "./tournaments/TournamentsList";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

const HOME_LIMIT = 5;

function TournamentColumnClean({
  label,
  tournaments,
  category,
  limit,
  showViewMore,
}: {
  label: string;
  tournaments: TournamentListItem[];
  category: "ongoing" | "upcoming" | "past";
  limit?: number;
  showViewMore?: boolean;
}) {
  const t = useTranslations("Tournaments");
  const visible = limit ? tournaments.slice(0, limit) : tournaments;
  const hasMore = limit ? tournaments.length > limit : false;

  const categoryVariant: Record<
    "ongoing" | "upcoming" | "past",
    "default" | "secondary" | "outline"
  > = {
    ongoing: "default",
    upcoming: "secondary",
    past: "outline",
  };

  return (
    <div className="flex flex-col min-w-0">
      <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
        {label}
        <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
          {tournaments.length}
        </Badge>
      </h2>

      {tournaments.length === 0 ? (
        <div className="card-livescore p-6 text-center flex-1">
          <p className="text-xs text-muted-foreground">{t("noTournaments")}</p>
        </div>
      ) : (
        <div className="card-livescore overflow-hidden flex-1 flex flex-col">
          <div className="divide-y flex-1">
            {visible.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
              >
                {tournament.logo_url ? (
                  <Image
                    src={tournament.logo_url}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover shrink-0"
                  />
                ) : tournament.accent_colors?.[0] ? (
                  <div
                    className="h-10 w-10 rounded-lg shrink-0"
                    style={{ backgroundColor: tournament.accent_colors[0] }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight truncate">
                    {tournament.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {tournament.teams?.[0]?.count ?? 0} teams
                  </div>
                </div>
                <Badge variant={categoryVariant[category]} className="text-[10px] shrink-0">
                  {category === "ongoing"
                    ? t("categoryOngoing")
                    : category === "upcoming"
                    ? t("categoryUpcoming")
                    : t("categoryPast")}
                </Badge>
              </Link>
            ))}
          </div>
          {hasMore && showViewMore && (
            <div className="border-t p-2 text-center mt-auto">
              <Link
                href="/tournaments"
                className="text-xs text-primary hover:underline font-medium"
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

export function HomeTournaments({
  tournaments,
}: {
  tournaments: TournamentListItem[];
}) {
  const t = useTranslations("Tournaments");

  const { ongoing, upcoming, past } = categorizeTournaments(tournaments);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TournamentColumnClean
        label={t("ongoingTournaments")}
        tournaments={ongoing}
        category="ongoing"
        limit={HOME_LIMIT}
        showViewMore
      />
      <TournamentColumnClean
        label={t("upcomingTournaments")}
        tournaments={upcoming}
        category="upcoming"
        limit={HOME_LIMIT}
        showViewMore
      />
      <TournamentColumnClean
        label={t("pastTournaments")}
        tournaments={past}
        category="past"
        limit={HOME_LIMIT}
        showViewMore
      />
    </div>
  );
}
