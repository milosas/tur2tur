"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateStandings } from "@/lib/standings";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import type { Match, TeamNameMap } from "@/lib/types";

interface GroupStandingsProps {
  groupName: string;
  teamIds: string[];
  matches: Match[];
  teamNames: TeamNameMap;
  qualifyCount?: number;
  onTeamClick?: (teamId: string) => void;
}

export function GroupStandings({
  groupName,
  teamIds,
  matches,
  teamNames,
  qualifyCount = 2,
  onTeamClick,
}: GroupStandingsProps) {
  const t = useTranslations("Tournaments");
  const standings = calculateStandings(teamIds, matches);

  return (
    <div className="rounded-lg border overflow-hidden animate-fade-in">
      <div className="bg-muted/50 px-3 sm:px-4 py-2 font-semibold text-sm sm:text-base">
        {t("group", { name: groupName })}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.pos")}</TableHead>
              <TableHead className="min-w-[100px]">{t("standings.team")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.played")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.won")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.drawn")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.lost")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center hidden sm:table-cell">{t("standings.goalsFor")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center hidden sm:table-cell">{t("standings.goalsAgainst")}</TableHead>
              <TableHead className="w-8 sm:w-10 text-center">{t("standings.goalDiff")}</TableHead>
              <TableHead className="w-10 sm:w-12 text-center font-bold">{t("standings.points")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((s, i) => {
              const name = teamNames[s.teamId] ?? "—";
              const qualifies = i < qualifyCount;
              return (
                <TableRow
                  key={s.teamId}
                  className={`transition-colors ${qualifies ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                >
                  <TableCell className="text-center font-medium text-xs sm:text-sm">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <TeamColorDot teamId={s.teamId} teamNames={teamNames} />
                      {onTeamClick ? (
                        <button
                          type="button"
                          className="hover:underline text-left cursor-pointer tap-target truncate"
                          onClick={() => onTeamClick(s.teamId)}
                        >
                          {name}
                        </button>
                      ) : (
                        <span className="truncate">{name}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">{s.played}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">{s.won}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">{s.drawn}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">{s.lost}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">{s.goalsFor}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm hidden sm:table-cell">{s.goalsAgainst}</TableCell>
                  <TableCell className="text-center text-xs sm:text-sm">
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                  </TableCell>
                  <TableCell className="text-center font-bold text-xs sm:text-sm">{s.points}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
