"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Calendar, Users } from "lucide-react";
import { useState } from "react";

const localeMap: Record<string, string> = {
  lt: "lt-LT",
  lv: "lv-LV",
  ee: "et-EE",
  en: "en-GB",
};

export type TournamentListItem = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  accent_colors: string[] | null;
  logo_url: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  teams?: { count: number }[];
};

type TournamentCategory = "ongoing" | "upcoming" | "past";

const categoryVariant: Record<TournamentCategory, "default" | "secondary" | "outline"> = {
  ongoing: "default",
  upcoming: "secondary",
  past: "outline",
};

function CategoryBadge({ category }: { category: TournamentCategory }) {
  const t = useTranslations("Tournaments");
  const labelMap: Record<TournamentCategory, string> = {
    ongoing: "LIVE",
    upcoming: t("categoryUpcoming"),
    past: t("categoryPast"),
  };
  return <Badge variant={categoryVariant[category]}>{labelMap[category]}</Badge>;
}

function TournamentCard({ tournament, category }: { tournament: TournamentListItem; category: TournamentCategory }) {
  const locale = useLocale();
  const dateLocale = localeMap[locale] ?? locale;
  const ac = tournament.accent_colors ?? [];
  const primary = ac[0] ?? null;
  const organizer =
    tournament.profiles?.full_name || tournament.profiles?.email || null;
  const teamCount = tournament.teams?.[0]?.count ?? 0;
  const startFmt = tournament.start_date
    ? new Date(tournament.start_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const endFmt = tournament.end_date
    ? new Date(tournament.end_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const dateStr = startFmt
    ? endFmt && endFmt !== startFmt
      ? `${startFmt} – ${endFmt}`
      : startFmt
    : null;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
    >
      {tournament.logo_url ? (
        <img
          src={tournament.logo_url}
          alt=""
          className="h-16 w-16 rounded-lg object-cover shrink-0"
        />
      ) : primary ? (
        <span
          className="w-1 rounded-full shrink-0 self-stretch"
          style={{ backgroundColor: primary }}
        />
      ) : null}
      <div className="flex-1 min-w-0 space-y-1">
        <span className="font-semibold text-sm leading-tight truncate block">
          {tournament.name}
        </span>
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
      <CategoryBadge category={category} />
    </Link>
  );
}

export function TournamentColumn({
  label,
  tournaments,
  category,
  limit,
  showViewMore = false,
}: {
  label: string;
  tournaments: TournamentListItem[];
  category: TournamentCategory;
  limit?: number;
  showViewMore?: boolean;
}) {
  const t = useTranslations("Tournaments");

  const visible = limit ? tournaments.slice(0, limit) : tournaments;
  const hasMore = limit ? tournaments.length > limit : false;

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
            {visible.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} category={category} />
            ))}
          </div>
          {hasMore && showViewMore && (
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

export function categorizeTournaments(tournaments: TournamentListItem[]) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const ongoing: TournamentListItem[] = [];
  const upcoming: TournamentListItem[] = [];
  const past: TournamentListItem[] = [];

  for (const tour of tournaments) {
    const startStr = tour.start_date?.slice(0, 10) ?? null;
    const endStr = tour.end_date?.slice(0, 10) ?? startStr;
    const isActive = ["in_progress", "group_stage", "playoffs"].includes(tour.status);
    const isCompleted = tour.status === "completed";

    if (isActive) {
      ongoing.push(tour);
    } else if (isCompleted) {
      past.push(tour);
    } else if (!startStr) {
      upcoming.push(tour);
    } else if (startStr <= todayStr && (!endStr || endStr >= todayStr)) {
      ongoing.push(tour);
    } else if (startStr > todayStr) {
      upcoming.push(tour);
    } else {
      past.push(tour);
    }
  }

  const sortAsc = (a: TournamentListItem, b: TournamentListItem) =>
    (a.start_date ?? "").localeCompare(b.start_date ?? "");
  const sortDesc = (a: TournamentListItem, b: TournamentListItem) =>
    (b.start_date ?? "").localeCompare(a.start_date ?? "");

  ongoing.sort(sortAsc);
  upcoming.sort(sortAsc);
  past.sort(sortDesc);

  return { ongoing, upcoming, past };
}

function FeaturedTournamentCard({ tournament }: { tournament: TournamentListItem }) {
  const locale = useLocale();
  const dateLocale = localeMap[locale] ?? locale;
  const ac = tournament.accent_colors ?? [];
  const primary = ac[0] ?? "oklch(0.55 0.16 195)";
  const teamCount = tournament.teams?.[0]?.count ?? 0;
  const startFmt = tournament.start_date
    ? new Date(tournament.start_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const endFmt = tournament.end_date
    ? new Date(tournament.end_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const dateStr = startFmt
    ? endFmt && endFmt !== startFmt
      ? `${startFmt} – ${endFmt}`
      : startFmt
    : null;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="card-featured-live p-6 block mb-6 animate-fade-in"
    >
      <div className="flex items-center gap-3 mb-4">
        {tournament.logo_url ? (
          <img
            src={tournament.logo_url}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover shrink-0 ring-2 ring-white/20"
          />
        ) : (
          <div
            className="h-16 w-16 rounded-2xl shrink-0 ring-2 ring-white/20"
            style={{ backgroundColor: primary }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
              Live
            </Badge>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight truncate">
            {tournament.name}
          </h3>
        </div>
      </div>
      <div className="flex items-center gap-4 text-white/80 text-sm flex-wrap">
        {dateStr && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {dateStr}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {teamCount} teams
        </span>
        {tournament.venue && (
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{tournament.venue}</span>
          </span>
        )}
      </div>
    </Link>
  );
}

function TournamentListRow({ tournament, category }: { tournament: TournamentListItem; category: TournamentCategory }) {
  const locale = useLocale();
  const dateLocale = localeMap[locale] ?? locale;
  const ac = tournament.accent_colors ?? [];
  const primary = ac[0] ?? null;
  const organizer =
    tournament.profiles?.full_name || tournament.profiles?.email || null;
  const teamCount = tournament.teams?.[0]?.count ?? 0;
  const startFmt = tournament.start_date
    ? new Date(tournament.start_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const endFmt = tournament.end_date
    ? new Date(tournament.end_date).toLocaleDateString(dateLocale, {
        day: "numeric",
        month: "short",
      })
    : null;
  const dateStr = startFmt
    ? endFmt && endFmt !== startFmt
      ? `${startFmt} – ${endFmt}`
      : startFmt
    : null;

  return (
    <Link
      href={`/tournaments/${tournament.id}`}
      className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors border-b last:border-b-0"
    >
      <div className="shrink-0">
        {tournament.logo_url ? (
          <img
            src={tournament.logo_url}
            alt=""
            className="h-12 w-12 rounded-xl object-cover"
          />
        ) : primary ? (
          <div
            className="h-12 w-12 rounded-xl"
            style={{ backgroundColor: primary }}
          />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight truncate mb-1">
          {tournament.name}
        </div>
        <div className="flex items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground flex-wrap">
          {dateStr && (
            <span className="flex items-center gap-1 whitespace-nowrap text-primary font-medium">
              <Calendar className="h-3 w-3 shrink-0" />
              {dateStr}
            </span>
          )}
          {tournament.venue && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{tournament.venue}</span>
            </span>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0.5">
          <Users className="h-3 w-3 mr-1 inline" />
          {teamCount}
        </Badge>
        <CategoryBadge category={category} />
      </div>
    </Link>
  );
}

export function TournamentsList({
  tournaments,
}: {
  tournaments: TournamentListItem[];
}) {
  const t = useTranslations("Tournaments");
  const [activeFilter, setActiveFilter] = useState<"all" | TournamentCategory>("all");

  if (tournaments.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <p className="text-muted-foreground text-lg">{t("noTournaments")}</p>
      </div>
    );
  }

  const { ongoing, upcoming, past } = categorizeTournaments(tournaments);

  const filters: Array<{ key: "all" | TournamentCategory; label: string; count: number }> = [
    { key: "all", label: t("allTournaments"), count: tournaments.length },
    { key: "ongoing", label: "LIVE", count: ongoing.length },
    { key: "upcoming", label: t("categoryUpcoming"), count: upcoming.length },
    { key: "past", label: t("categoryPast"), count: past.length },
  ];

  const filteredTournaments =
    activeFilter === "all"
      ? [...ongoing, ...upcoming, ...past]
      : activeFilter === "ongoing"
      ? ongoing
      : activeFilter === "upcoming"
      ? upcoming
      : past;

  const getCategoryForTournament = (tournament: TournamentListItem): TournamentCategory => {
    if (ongoing.includes(tournament)) return "ongoing";
    if (upcoming.includes(tournament)) return "upcoming";
    return "past";
  };

  return (
    <div className="animate-fade-in">
      {/* Pill Filter Tabs */}
      <div className="mb-6 overflow-x-auto scroll-smooth -mx-4 px-4 pb-2">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`pill-filter ${
                activeFilter === filter.key ? "pill-filter-active" : ""
              }`}
            >
              {filter.label}
              <span className="ml-1.5 opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tournament List */}
      {filteredTournaments.length > 0 ? (
        <div className="card-livescore overflow-hidden">
          {filteredTournaments.map((tournament) => (
            <TournamentListRow
              key={tournament.id}
              tournament={tournament}
              category={getCategoryForTournament(tournament)}
            />
          ))}
        </div>
      ) : (
        <div className="card-livescore p-8 text-center">
          <p className="text-muted-foreground text-sm">{t("noTournaments")}</p>
        </div>
      )}
    </div>
  );
}
