"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import { getTeamIcon } from "@/lib/team-icons";
import type { Match, TeamNameMap } from "@/lib/types";

type TeamWithPlayers = {
  id: string;
  name: string;
  logo_url: string | null;
  team_players: { id: string; name: string; number: number | null }[];
};

interface TeamDetailDialogProps {
  team: TeamWithPlayers | null;
  allMatches: Match[];
  teamNames: TeamNameMap;
  open: boolean;
  onClose: () => void;
}

export function TeamDetailDialog({
  team,
  allMatches,
  teamNames,
  open,
  onClose,
}: TeamDetailDialogProps) {
  const t = useTranslations("Tournaments.teamDetail");

  if (!team) return null;

  const teamMatches = allMatches.filter(
    (m) => m.homeTeamId === team.id || m.awayTeamId === team.id
  );

  const completed = teamMatches.filter((m) => m.status === "completed");
  const upcoming = teamMatches.filter((m) => m.status !== "completed");

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of completed) {
    const isHome = m.homeTeamId === team.id;
    const scored = isHome ? m.homeScore! : m.awayScore!;
    const conceded = isHome ? m.awayScore! : m.homeScore!;
    goalsFor += scored;
    goalsAgainst += conceded;
    if (scored > conceded) wins++;
    else if (scored === conceded) draws++;
    else losses++;
  }

  const icon = getTeamIcon(team.id, teamNames);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 sm:gap-3 text-base sm:text-lg">
            <svg width="22" height="22" viewBox="0 0 20 20" className="shrink-0">
              <path d={icon.path} fill={icon.color} />
            </svg>
            {team.name}
          </DialogTitle>
        </DialogHeader>

        {/* Stats summary */}
        {completed.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center animate-fade-in">
            <div className="rounded-lg bg-muted p-1.5 sm:p-2">
              <div className="text-base sm:text-lg font-bold">{completed.length}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{t("played")}</div>
            </div>
            <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-1.5 sm:p-2">
              <div className="text-base sm:text-lg font-bold text-green-600">{wins}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{t("won")}</div>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-1.5 sm:p-2">
              <div className="text-base sm:text-lg font-bold text-yellow-600">{draws}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{t("drawn")}</div>
            </div>
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-1.5 sm:p-2">
              <div className="text-base sm:text-lg font-bold text-red-600">{losses}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">{t("lost")}</div>
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground text-center">
            {t("goals")}: {goalsFor} — {goalsAgainst} ({goalsFor - goalsAgainst > 0 ? "+" : ""}{goalsFor - goalsAgainst})
          </div>
        )}

        {/* Players */}
        {team.team_players.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
            <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">{t("roster")}</h4>
            <div className="space-y-0.5 sm:space-y-1">
              {team.team_players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 text-xs sm:text-sm">
                  {player.number != null && (
                    <span className="font-mono text-muted-foreground w-7 sm:w-8 text-right">#{player.number}</span>
                  )}
                  <span>{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed matches */}
        {completed.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">{t("results")}</h4>
            <div className="space-y-1 sm:space-y-1.5">
              {completed.map((m) => {
                const isHome = m.homeTeamId === team.id;
                const scored = isHome ? m.homeScore! : m.awayScore!;
                const conceded = isHome ? m.awayScore! : m.homeScore!;
                const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                const opponentName = teamNames[opponentId] ?? "—";
                const result = scored > conceded ? "W" : scored === conceded ? "D" : "L";
                const resultColor =
                  result === "W"
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : result === "D"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";

                return (
                  <div key={m.id} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Badge variant="outline" className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs p-0 shrink-0 ${resultColor}`}>
                      {result}
                    </Badge>
                    <span className="font-mono font-medium">{scored}-{conceded}</span>
                    <span className="text-muted-foreground">{isHome ? t("vs") : t("at")}</span>
                    <TeamColorDot teamId={opponentId} teamNames={teamNames} />
                    <span className="truncate">{opponentName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming matches */}
        {upcoming.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <h4 className="font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2">{t("upcoming")}</h4>
            <div className="space-y-1 sm:space-y-1.5">
              {upcoming.map((m) => {
                const isHome = m.homeTeamId === team.id;
                const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
                const opponentName = opponentId ? (teamNames[opponentId] ?? "—") : "TBD";

                return (
                  <div key={m.id} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Badge variant="outline" className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs p-0 shrink-0">
                      —
                    </Badge>
                    <span className="text-muted-foreground">{isHome ? t("vs") : t("at")}</span>
                    {opponentId && <TeamColorDot teamId={opponentId} teamNames={teamNames} />}
                    <span className="truncate">{opponentName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {teamMatches.length === 0 && (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-4">{t("noMatches")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
