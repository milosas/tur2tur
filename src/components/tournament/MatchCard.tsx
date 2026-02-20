"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import type { Match, TeamNameMap } from "@/lib/types";

interface MatchCardProps {
  match: Match;
  teamNames: TeamNameMap;
  onTeamClick?: (teamId: string) => void;
}

function TeamName({
  teamId,
  name,
  isWinner,
  onTeamClick,
}: {
  teamId: string;
  name: string;
  isWinner: boolean;
  onTeamClick?: (teamId: string) => void;
}) {
  if (onTeamClick && teamId) {
    return (
      <button
        type="button"
        className={`hover:underline cursor-pointer truncate tap-target text-left ${isWinner ? "font-bold" : ""}`}
        onClick={() => onTeamClick(teamId)}
      >
        {name}
      </button>
    );
  }
  return <span className={`truncate ${isWinner ? "font-bold" : ""}`}>{name}</span>;
}

export function MatchCard({ match, teamNames, onTeamClick }: MatchCardProps) {
  const t = useTranslations("Tournaments.match");
  const tPlayoff = useTranslations("Tournaments.playoff");
  const format = useFormatter();
  const homeName = match.homeTeamId ? (teamNames[match.homeTeamId] ?? tPlayoff("tbd")) : tPlayoff("tbd");
  const awayName = match.awayTeamId ? (teamNames[match.awayTeamId] ?? tPlayoff("tbd")) : tPlayoff("tbd");
  const isCompleted = match.status === "completed";
  const hasPenalty = match.penaltyHome != null && match.penaltyAway != null;
  const homeWins = isCompleted && match.homeScore !== null && match.awayScore !== null && (
    match.homeScore > match.awayScore || (match.homeScore === match.awayScore && hasPenalty && match.penaltyHome! > match.penaltyAway!)
  );
  const awayWins = isCompleted && match.homeScore !== null && match.awayScore !== null && (
    match.awayScore > match.homeScore || (match.homeScore === match.awayScore && hasPenalty && match.penaltyAway! > match.penaltyHome!)
  );

  return (
    <div className="rounded-lg border transition-colors hover:bg-muted/30 overflow-hidden">
      {/* Mobile: single row layout */}
      <div className="sm:hidden px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
            <span className="text-xs truncate text-right">
              <TeamName teamId={match.homeTeamId} name={homeName} isWinner={homeWins} onTeamClick={onTeamClick} />
            </span>
            {match.homeTeamId && <TeamColorDot teamId={match.homeTeamId} teamNames={teamNames} />}
          </div>
          <div className="shrink-0 min-w-[52px] text-center">
            {isCompleted ? (
              <span className="font-mono font-bold text-sm">
                {match.homeScore} - {match.awayScore}
              </span>
            ) : match.scheduledAt ? (
              <span className="text-[10px] text-muted-foreground leading-tight block">
                {format.dateTime(new Date(match.scheduledAt), {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">—</span>
            )}
          </div>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {match.awayTeamId && <TeamColorDot teamId={match.awayTeamId} teamNames={teamNames} />}
            <span className="text-xs truncate">
              <TeamName teamId={match.awayTeamId} name={awayName} isWinner={awayWins} onTeamClick={onTeamClick} />
            </span>
          </div>
        </div>
        {isCompleted && hasPenalty && (
          <div className="text-center mt-1">
            <span className="text-[10px] text-muted-foreground">
              *({match.penaltyLabel || t("penalty")}: {match.penaltyHome}-{match.penaltyAway})
            </span>
          </div>
        )}
      </div>

      {/* Desktop: horizontal layout */}
      <div className="hidden sm:flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <TeamName teamId={match.homeTeamId} name={homeName} isWinner={homeWins} onTeamClick={onTeamClick} />
          {match.homeTeamId && <TeamColorDot teamId={match.homeTeamId} teamNames={teamNames} />}
        </div>
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          {isCompleted ? (
            <>
              <span className="font-mono font-bold text-lg">
                {match.homeScore} - {match.awayScore}
              </span>
              {hasPenalty && (
                <span className="text-[10px] text-muted-foreground">
                  *({match.penaltyLabel || t("penalty")}: {match.penaltyHome}-{match.penaltyAway})
                </span>
              )}
            </>
          ) : (
            <Badge variant="outline" className="text-xs">{t(match.status)}</Badge>
          )}
          {match.scheduledAt && (
            <span className="text-xs text-muted-foreground">
              {format.dateTime(new Date(match.scheduledAt), {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {match.awayTeamId && <TeamColorDot teamId={match.awayTeamId} teamNames={teamNames} />}
          <TeamName teamId={match.awayTeamId} name={awayName} isWinner={awayWins} onTeamClick={onTeamClick} />
        </div>
      </div>
    </div>
  );
}
