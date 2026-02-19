"use client";

import { useTranslations, useFormatter } from "next-intl";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import type { PlayoffRound, Match, TeamNameMap } from "@/lib/types";

interface PlayoffBracketProps {
  rounds: PlayoffRound[];
  teamNames: TeamNameMap;
  onTeamClick?: (teamId: string) => void;
}

function BracketMatch({ match, teamNames, onTeamClick }: { match: Match; teamNames: TeamNameMap; onTeamClick?: (teamId: string) => void }) {
  const t = useTranslations("Tournaments.playoff");
  const format = useFormatter();
  const homeName = match.homeTeamId ? (teamNames[match.homeTeamId] ?? t("tbd")) : t("tbd");
  const awayName = match.awayTeamId ? (teamNames[match.awayTeamId] ?? t("tbd")) : t("tbd");
  const isCompleted = match.status === "completed";
  const hasPenalty = match.penaltyHome != null && match.penaltyAway != null;
  const homeWins = isCompleted && match.homeScore !== null && match.awayScore !== null && (
    match.homeScore > match.awayScore || (match.homeScore === match.awayScore && hasPenalty && match.penaltyHome! > match.penaltyAway!)
  );
  const awayWins = isCompleted && match.homeScore !== null && match.awayScore !== null && (
    match.awayScore > match.homeScore || (match.homeScore === match.awayScore && hasPenalty && match.penaltyAway! > match.penaltyHome!)
  );

  return (
    <div className="rounded-lg border bg-card w-44 sm:w-56 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 border-b ${
          homeWins ? "bg-green-50 dark:bg-green-950/30" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.homeTeamId && <TeamColorDot teamId={match.homeTeamId} teamNames={teamNames} />}
          {onTeamClick && match.homeTeamId ? (
            <button type="button" className={`text-xs sm:text-sm truncate hover:underline cursor-pointer tap-target ${homeWins ? "font-bold" : ""}`} onClick={() => onTeamClick(match.homeTeamId)}>
              {homeName}
            </button>
          ) : (
            <span className={`text-xs sm:text-sm truncate ${homeWins ? "font-bold" : ""} ${!match.homeTeamId ? "text-muted-foreground italic" : ""}`}>
              {homeName}
            </span>
          )}
        </div>
        {match.homeScore !== null && (
          <span className={`font-mono text-xs sm:text-sm ml-2 ${homeWins ? "font-bold" : ""}`}>
            {match.homeScore}
          </span>
        )}
      </div>
      <div
        className={`flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 ${
          awayWins ? "bg-green-50 dark:bg-green-950/30" : ""
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {match.awayTeamId && <TeamColorDot teamId={match.awayTeamId} teamNames={teamNames} />}
          {onTeamClick && match.awayTeamId ? (
            <button type="button" className={`text-xs sm:text-sm truncate hover:underline cursor-pointer tap-target ${awayWins ? "font-bold" : ""}`} onClick={() => onTeamClick(match.awayTeamId)}>
              {awayName}
            </button>
          ) : (
            <span className={`text-xs sm:text-sm truncate ${awayWins ? "font-bold" : ""} ${!match.awayTeamId ? "text-muted-foreground italic" : ""}`}>
              {awayName}
            </span>
          )}
        </div>
        {match.awayScore !== null && (
          <span className={`font-mono text-xs sm:text-sm ml-2 ${awayWins ? "font-bold" : ""}`}>
            {match.awayScore}
          </span>
        )}
      </div>
      {isCompleted && hasPenalty && (
        <div className="px-2.5 sm:px-3 py-0.5 text-[10px] text-muted-foreground border-t text-center">
          *({match.penaltyLabel || t("penalty")}: {match.penaltyHome}-{match.penaltyAway})
        </div>
      )}
      {match.scheduledAt && (
        <div className="px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-muted-foreground border-t bg-muted/30 text-center">
          {format.dateTime(new Date(match.scheduledAt), {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

function getRoundName(roundIndex: number, totalRounds: number, t: ReturnType<typeof useTranslations>) {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return t("final");
  if (remaining === 2) return t("semifinals");
  if (remaining === 3) return t("quarterfinals");
  return t("round", { round: roundIndex + 1 });
}

export function PlayoffBracket({ rounds, teamNames, onTeamClick }: PlayoffBracketProps) {
  const t = useTranslations("Tournaments.playoff");

  return (
    <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-4 scroll-smooth -mx-4 px-4 snap-x">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="flex flex-col gap-3 sm:gap-4 shrink-0 snap-start">
          <h3 className="font-semibold text-xs sm:text-sm text-center text-muted-foreground">
            {getRoundName(roundIndex, rounds.length, t)}
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4 justify-around flex-1">
            {round.matches.map((match) => (
              <BracketMatch key={match.id} match={match} teamNames={teamNames} onTeamClick={onTeamClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
