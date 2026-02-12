"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/tournament/StatusBadge";
import { GroupStandings } from "@/components/tournament/GroupStandings";
import { MatchList } from "@/components/tournament/MatchList";
import { PlayoffBracket } from "@/components/tournament/PlayoffBracket";
import { TeamDetailDialog } from "@/components/tournament/TeamDetailDialog";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Mail, Phone } from "lucide-react";
import type { TournamentStatus, DBMatch, DBGroup, TeamNameMap, Group, Match, PlayoffRound, DBProfile } from "@/lib/types";
import { dbMatchToMatch, dbGroupToGroup } from "@/lib/types";

type DBTeam = {
  id: string;
  name: string;
  logo_url: string | null;
  team_players: { id: string; name: string; number: number | null }[];
};

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

export function TournamentDetail({
  tournament,
  teams,
  groups: dbGroups,
  matches: dbMatches,
  organizer,
  organizerTournamentCount,
}: {
  tournament: DBTournament;
  teams: DBTeam[];
  groups: DBGroup[];
  matches: DBMatch[];
  organizer?: DBProfile | null;
  organizerTournamentCount?: number;
}) {
  const t = useTranslations("Tournaments");
  const tCommon = useTranslations("Common");
  const tDash = useTranslations("Dashboard");

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const selectedTeam = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) ?? null : null;

  const handleTeamClick = (teamId: string) => setSelectedTeamId(teamId);

  const formatLabel =
    tDash.has(`formatOptions.${tournament.format}`)
      ? tDash(`formatOptions.${tournament.format}` as any)
      : tournament.format;

  // Build team name map
  const teamNames: TeamNameMap = {};
  for (const team of teams) {
    teamNames[team.id] = team.name;
  }

  // Convert DB types to app types
  const groups: Group[] = dbGroups.map(dbGroupToGroup);
  const allMatches: Match[] = dbMatches.map(dbMatchToMatch);

  const groupMatches = allMatches.filter((m) => m.stage === "group");
  const playoffMatches = allMatches.filter((m) => m.stage === "playoff");
  const rrMatches = allMatches.filter((m) => m.stage === "round_robin");
  const elimMatches = allMatches.filter((m) => m.stage === "elimination");
  const reclassMatches = allMatches.filter((m) => m.stage === "reclass");

  const hasMatchData = allMatches.length > 0;
  const isDraftOrReg = tournament.status === "draft" || tournament.status === "registration";

  // Build playoff rounds for bracket display
  function buildPlayoffRounds(matches: Match[]): PlayoffRound[] {
    const roundMap = new Map<number, Match[]>();
    for (const m of matches) {
      const list = roundMap.get(m.round) ?? [];
      list.push(m);
      roundMap.set(m.round, list);
    }
    return Array.from(roundMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([, ms]) => ({ name: "", matches: ms }));
  }

  function renderGroupPlayoff() {
    return (
      <Tabs defaultValue="groups">
        <TabsList>
          <TabsTrigger value="groups">{t("tabs.groups")}</TabsTrigger>
          <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
          <TabsTrigger value="playoff">{t("tabs.playoff")}</TabsTrigger>
        </TabsList>
        <TabsContent value="groups" className="space-y-4 mt-4">
          {groups.map((group) => {
            const gMatches = groupMatches.filter((m) => m.groupId === group.id);
            return (
              <GroupStandings
                key={group.id}
                groupName={group.name}
                teamIds={group.teamIds}
                matches={gMatches}
                teamNames={teamNames}
                onTeamClick={handleTeamClick}
              />
            );
          })}
          {groups.length === 0 && (
            <p className="text-muted-foreground">{t("noTeamsYet")}</p>
          )}
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <MatchList matches={groupMatches} groups={groups} teamNames={teamNames} onTeamClick={handleTeamClick} />
        </TabsContent>
        <TabsContent value="playoff" className="mt-4">
          {playoffMatches.length > 0 ? (
            <PlayoffBracket rounds={buildPlayoffRounds(playoffMatches)} teamNames={teamNames} onTeamClick={handleTeamClick} />
          ) : (
            <p className="text-muted-foreground">{t("noTeamsYet")}</p>
          )}
        </TabsContent>
      </Tabs>
    );
  }

  function renderRoundRobin() {
    return (
      <Tabs defaultValue="standings">
        <TabsList>
          <TabsTrigger value="standings">{t("tabs.standings")}</TabsTrigger>
          <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
        </TabsList>
        <TabsContent value="standings" className="mt-4">
          <GroupStandings
            groupName={tournament.name}
            teamIds={teams.map((t) => t.id)}
            matches={rrMatches}
            teamNames={teamNames}
            qualifyCount={0}
            onTeamClick={handleTeamClick}
          />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <MatchList matches={rrMatches} groups={[]} teamNames={teamNames} onTeamClick={handleTeamClick} />
        </TabsContent>
      </Tabs>
    );
  }

  // Groups used for reclassification display
  const initialGroups = groups.filter((g) =>
    !["Gold", "Silver", "Bronze", "Consolation"].includes(g.name)
  );
  const reclassGroups = groups.filter((g) =>
    ["Gold", "Silver", "Bronze", "Consolation"].includes(g.name)
  );

  function renderGroupReclass() {
    return (
      <Tabs defaultValue="stage1">
        <TabsList>
          <TabsTrigger value="stage1">{t("tabs.stage1")}</TabsTrigger>
          <TabsTrigger value="stage2">{t("tabs.stage2")}</TabsTrigger>
          <TabsTrigger value="schedule">{t("tabs.schedule")}</TabsTrigger>
        </TabsList>
        <TabsContent value="stage1" className="space-y-4 mt-4">
          {initialGroups.map((group) => {
            const gMatches = groupMatches.filter((m) => m.groupId === group.id);
            return (
              <GroupStandings
                key={group.id}
                groupName={group.name}
                teamIds={group.teamIds}
                matches={gMatches}
                teamNames={teamNames}
                onTeamClick={handleTeamClick}
              />
            );
          })}
          {initialGroups.length === 0 && (
            <p className="text-muted-foreground">{t("noTeamsYet")}</p>
          )}
        </TabsContent>
        <TabsContent value="stage2" className="space-y-4 mt-4">
          {reclassGroups.length > 0 ? (
            reclassGroups.map((group) => {
              const gMatches = reclassMatches.filter((m) => m.groupId === group.id);
              return (
                <GroupStandings
                  key={group.id}
                  groupName={group.name}
                  teamIds={group.teamIds}
                  matches={gMatches}
                  teamNames={teamNames}
                  qualifyCount={0}
                  onTeamClick={handleTeamClick}
                />
              );
            })
          ) : (
            <p className="text-muted-foreground">{t("noTeamsYet")}</p>
          )}
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <MatchList
            matches={[...groupMatches, ...reclassMatches]}
            groups={groups}
            teamNames={teamNames}
            onTeamClick={handleTeamClick}
          />
        </TabsContent>
      </Tabs>
    );
  }

  function renderSingleElimination() {
    return (
      <PlayoffBracket rounds={buildPlayoffRounds(elimMatches)} teamNames={teamNames} onTeamClick={handleTeamClick} />
    );
  }

  function renderTeamsList() {
    return (
      <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("teams", { count: teams.length })}
        </h2>

        {teams.length === 0 ? (
          <p className="text-muted-foreground">{t("noTeamsYet")}</p>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {teams.map((team) => (
              <Card
                key={team.id}
                className="hover-lift cursor-pointer transition-all active:scale-[0.98]"
                onClick={() => handleTeamClick(team.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="text-sm sm:text-base">{team.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {team.team_players.length > 0 ? (
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-0.5 sm:space-y-1">
                      {team.team_players.map((player) => (
                        <li key={player.id}>
                          {player.number != null && (
                            <span className="font-mono mr-2">#{player.number}</span>
                          )}
                          {player.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 animate-fade-in">
        <Button asChild variant="ghost" size="sm" className="tap-target">
          <Link href="/tournaments">&larr; {tCommon("back")}</Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold">{tournament.name}</h1>
        <StatusBadge status={tournament.status as TournamentStatus} />
      </div>

      {tournament.description && (
        <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base animate-fade-in-up" style={{ animationDelay: "50ms" }}>{tournament.description}</p>
      )}

      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8 flex-wrap animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <Badge variant="outline" className="text-xs">{formatLabel}</Badge>
        <span>{t("teams", { count: teams.length })}</span>
        {tournament.start_date && (
          <span>
            {t("startDate", {
              date: new Date(tournament.start_date).toLocaleDateString(),
            })}
          </span>
        )}
      </div>

      {/* Show match/bracket view when tournament has started */}
      {hasMatchData && tournament.format === "group_playoff" && renderGroupPlayoff()}
      {hasMatchData && tournament.format === "round_robin" && renderRoundRobin()}
      {hasMatchData && tournament.format === "single_elimination" && renderSingleElimination()}
      {hasMatchData && tournament.format === "group_reclass" && renderGroupReclass()}

      {/* Show teams list when no matches yet or always below */}
      {(!hasMatchData || isDraftOrReg) && renderTeamsList()}

      {/* Organizer card */}
      {organizer && (
        <Card className="mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("organizer.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-medium text-sm sm:text-base">
              {organizer.full_name || organizer.email || t("organizer.anonymous")}
            </div>
            {organizer.bio && (
              <p className="text-xs sm:text-sm text-muted-foreground">{organizer.bio}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              {organizer.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{organizer.email}</span>
                </span>
              )}
              {organizer.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {organizer.phone}
                </span>
              )}
              {organizerTournamentCount != null && organizerTournamentCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 shrink-0" />
                  {t("organizer.tournamentCount", { count: organizerTournamentCount })}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team detail modal */}
      <TeamDetailDialog
        team={selectedTeam}
        allMatches={allMatches}
        teamNames={teamNames}
        open={selectedTeamId !== null}
        onClose={() => setSelectedTeamId(null)}
      />
    </>
  );
}
