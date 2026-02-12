"use client";

import { useTranslations } from "next-intl";
import { MatchCard } from "./MatchCard";
import type { Match, Group, TeamNameMap } from "@/lib/types";

interface MatchListProps {
  matches: Match[];
  groups: Group[];
  teamNames: TeamNameMap;
  onTeamClick?: (teamId: string) => void;
}

export function MatchList({ matches, groups, teamNames, onTeamClick }: MatchListProps) {
  const t = useTranslations("Tournaments");

  // Group matches by round
  const rounds = new Map<number, Match[]>();
  for (const m of matches) {
    const list = rounds.get(m.round) ?? [];
    list.push(m);
    rounds.set(m.round, list);
  }

  const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);

  // Map groupId to group name for labels
  const groupNameMap = new Map(groups.map((g) => [g.id, g.name]));

  return (
    <div className="space-y-5 sm:space-y-6">
      {sortedRounds.map(([round, roundMatches]) => (
        <div key={round}>
          <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3">
            {t("match.round", { round })}
          </h3>
          <div className="space-y-2">
            {roundMatches.map((m) => (
              <div key={m.id}>
                {/* Group label: above card on mobile, inline on desktop */}
                {m.groupId && (
                  <div className="text-[10px] sm:hidden text-muted-foreground mb-0.5 px-1">
                    {t("group", { name: groupNameMap.get(m.groupId) ?? "" })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {m.groupId && (
                    <span className="text-xs text-muted-foreground w-16 shrink-0 hidden sm:block">
                      {t("group", { name: groupNameMap.get(m.groupId) ?? "" })}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <MatchCard match={m} teamNames={teamNames} onTeamClick={onTeamClick} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
