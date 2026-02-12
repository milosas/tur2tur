"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Play, Trophy, CheckCircle } from "lucide-react";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import { generateGroupPlayoff, generateRoundRobin, generateSingleElimination, generateGroupReclass } from "@/lib/bracket";
import { calculateStandings } from "@/lib/standings";
import type { DBMatch, DBGroup, TeamNameMap } from "@/lib/types";
import { dbMatchToMatch } from "@/lib/types";

type Team = { id: string; name: string };
type Tournament = {
  id: string;
  name: string;
  format: string;
  status: string;
  max_teams: number;
};

export function MatchesManager({
  tournament,
  teams,
  initialGroups,
  initialMatches,
}: {
  tournament: Tournament;
  teams: Team[];
  initialGroups: DBGroup[];
  initialMatches: DBMatch[];
}) {
  const t = useTranslations("Matches");
  const tDash = useTranslations("Dashboard");
  const router = useRouter();
  const supabase = createClient();

  const [groups, setGroups] = useState<DBGroup[]>(initialGroups);
  const [matches, setMatches] = useState<DBMatch[]>(initialMatches);
  const [generating, setGenerating] = useState(false);
  const [savingMatch, setSavingMatch] = useState<string | null>(null);
  const [fillingPlayoff, setFillingPlayoff] = useState(false);
  const [fillingReclass, setFillingReclass] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Score editing state: matchId -> { home, away }
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});

  const teamNames: TeamNameMap = {};
  for (const team of teams) {
    teamNames[team.id] = team.name;
  }

  const hasMatches = matches.length > 0;

  const groupMatches = matches.filter((m) => m.stage === "group");
  const playoffMatches = matches.filter((m) => m.stage === "playoff");
  const rrMatches = matches.filter((m) => m.stage === "round_robin");
  const elimMatches = matches.filter((m) => m.stage === "elimination");
  const reclassMatches = matches.filter((m) => m.stage === "reclass");

  const allGroupComplete = groupMatches.length > 0 && groupMatches.every((m) => m.status === "completed");
  const groupRemaining = groupMatches.filter((m) => m.status !== "completed").length;
  const playoffEmpty = playoffMatches.every((m) => !m.home_team_id && !m.away_team_id);

  async function handleGenerate() {
    if (teams.length < 2) return;
    setGenerating(true);

    try {
      const teamIds = teams.map((t) => t.id);
      let result;

      if (tournament.format === "group_playoff") {
        result = generateGroupPlayoff(teamIds, tournament.id);
      } else if (tournament.format === "round_robin") {
        result = generateRoundRobin(teamIds, tournament.id);
      } else if (tournament.format === "group_reclass") {
        result = generateGroupReclass(teamIds, tournament.id);
      } else {
        result = generateSingleElimination(teamIds, tournament.id);
      }

      // Insert groups first (if any)
      let groupIdMap: Record<string, string> = {};
      if (result.groups.length > 0) {
        const { data: insertedGroups } = await supabase
          .from("tournament_groups")
          .insert(result.groups)
          .select();

        if (insertedGroups) {
          insertedGroups.forEach((g, i) => {
            groupIdMap[result.groupPlaceholders[i]] = g.id;
          });
        }
      }

      // Replace placeholder group IDs in matches
      const matchInserts = result.matches.map((m) => {
        const group_id = m.group_id ? (groupIdMap[m.group_id] ?? null) : null;
        return {
          tournament_id: m.tournament_id,
          group_id,
          round: m.round,
          match_number: m.match_number,
          home_team_id: m.home_team_id,
          away_team_id: m.away_team_id,
          status: m.status,
          stage: m.stage,
        };
      });

      const { data: insertedMatches } = await supabase
        .from("matches")
        .insert(matchInserts)
        .select();

      // Update tournament status
      await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", tournament.id);

      // Refresh state
      if (insertedMatches) setMatches(insertedMatches);
      const { data: freshGroups } = await supabase
        .from("tournament_groups")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("name");
      if (freshGroups) setGroups(freshGroups);

      setConfirmOpen(false);
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveScore(matchId: string) {
    const s = scores[matchId];
    if (!s) return;
    const homeScore = parseInt(s.home);
    const awayScore = parseInt(s.away);
    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) return;

    setSavingMatch(matchId);
    try {
      await supabase
        .from("matches")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", matchId);

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, home_score: homeScore, away_score: awayScore, status: "completed" }
            : m
        )
      );
      // Clear the score inputs for this match
      setScores((prev) => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
    } finally {
      setSavingMatch(null);
    }
  }

  async function handleFillPlayoff() {
    if (!allGroupComplete || !playoffEmpty) return;
    setFillingPlayoff(true);

    try {
      // Calculate standings per group, get top 2 from each
      const qualifiedTeams: string[] = [];
      for (const group of groups) {
        const gMatches = groupMatches
          .filter((m) => m.group_id === group.id)
          .map(dbMatchToMatch);
        const standings = calculateStandings(group.team_ids, gMatches);
        qualifiedTeams.push(standings[0]?.teamId, standings[1]?.teamId);
      }

      // Fill playoff round 1 matches
      const round1Playoff = playoffMatches
        .filter((m) => m.round === 1)
        .sort((a, b) => a.match_number - b.match_number);

      // Cross-match: 1st from group A vs 2nd from group B, etc.
      const updates: { id: string; home_team_id: string; away_team_id: string }[] = [];
      for (let i = 0; i < round1Playoff.length && i * 2 + 1 < qualifiedTeams.length; i++) {
        const home = qualifiedTeams[i * 2]; // 1st from group i
        const awayGroupIdx = (i % 2 === 0 ? i + 1 : i - 1);
        const away = qualifiedTeams[awayGroupIdx * 2 + 1] ?? qualifiedTeams[i * 2 + 1]; // 2nd from paired group
        if (home && away) {
          updates.push({
            id: round1Playoff[i].id,
            home_team_id: home,
            away_team_id: away,
          });
        }
      }

      // If simple case (not enough groups for cross-matching), just pair sequentially
      if (updates.length === 0) {
        for (let i = 0; i < round1Playoff.length; i++) {
          const home = qualifiedTeams[i * 2];
          const away = qualifiedTeams[i * 2 + 1];
          if (home && away) {
            updates.push({
              id: round1Playoff[i].id,
              home_team_id: home,
              away_team_id: away,
            });
          }
        }
      }

      for (const up of updates) {
        await supabase
          .from("matches")
          .update({ home_team_id: up.home_team_id, away_team_id: up.away_team_id })
          .eq("id", up.id);
      }

      // Refresh matches
      const { data: freshMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("stage")
        .order("round")
        .order("match_number");
      if (freshMatches) setMatches(freshMatches);
    } finally {
      setFillingPlayoff(false);
    }
  }

  const allGroupCompleteReclass =
    tournament.format === "group_reclass" &&
    groupMatches.length > 0 &&
    groupMatches.every((m) => m.status === "completed");
  const reclassEmpty = reclassMatches.length === 0;

  async function handleFillReclass() {
    if (!allGroupCompleteReclass || !reclassEmpty) return;
    setFillingReclass(true);

    try {
      // Calculate standings per group, collect teams by placement
      const placementBuckets: string[][] = []; // index = placement (0=1st, 1=2nd, etc.)

      for (const group of groups) {
        const gMatches = groupMatches
          .filter((m) => m.group_id === group.id)
          .map(dbMatchToMatch);
        const standings = calculateStandings(group.team_ids, gMatches);
        standings.forEach((s, idx) => {
          if (!placementBuckets[idx]) placementBuckets[idx] = [];
          placementBuckets[idx].push(s.teamId);
        });
      }

      const reclassGroupNames = ["Gold", "Silver", "Bronze", "Consolation"];
      const newGroups: { tournament_id: string; name: string; team_ids: string[] }[] = [];
      const newMatches: {
        tournament_id: string;
        group_id: string;
        round: number;
        match_number: number;
        home_team_id: string;
        away_team_id: string;
        status: string;
        stage: string;
      }[] = [];

      let matchNum = 1;

      for (let i = 0; i < placementBuckets.length && i < 4; i++) {
        const bucketTeams = placementBuckets[i];
        if (!bucketTeams || bucketTeams.length < 2) continue;

        const groupName = reclassGroupNames[i] ?? `Reclass ${i + 1}`;
        const placeholder = `__RECLASS_${i}__`;

        newGroups.push({
          tournament_id: tournament.id,
          name: groupName,
          team_ids: bucketTeams,
        });

        // Generate round-robin pairings for this reclass group
        const ids = [...bucketTeams];
        if (ids.length % 2 !== 0) ids.push("");
        const n = ids.length;
        for (let r = 0; r < n - 1; r++) {
          for (let j = 0; j < n / 2; j++) {
            const home = ids[j];
            const away = ids[n - 1 - j];
            if (home && away) {
              newMatches.push({
                tournament_id: tournament.id,
                group_id: placeholder,
                round: r + 1,
                match_number: matchNum++,
                home_team_id: home,
                away_team_id: away,
                status: "scheduled",
                stage: "reclass",
              });
            }
          }
          const last = ids.pop()!;
          ids.splice(1, 0, last);
        }
      }

      // Insert reclass groups
      const groupIdMap: Record<string, string> = {};
      if (newGroups.length > 0) {
        const { data: insertedGroups } = await supabase
          .from("tournament_groups")
          .insert(newGroups)
          .select();

        if (insertedGroups) {
          insertedGroups.forEach((g, i) => {
            groupIdMap[`__RECLASS_${i}__`] = g.id;
          });
        }
      }

      // Replace placeholder group IDs and insert matches
      if (newMatches.length > 0) {
        const matchInserts = newMatches.map((m) => ({
          ...m,
          group_id: groupIdMap[m.group_id] ?? null,
        }));
        await supabase.from("matches").insert(matchInserts);
      }

      // Refresh state
      const { data: freshMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("stage")
        .order("round")
        .order("match_number");
      if (freshMatches) setMatches(freshMatches);

      const { data: freshGroups } = await supabase
        .from("tournament_groups")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("name");
      if (freshGroups) setGroups(freshGroups);

      router.refresh();
    } finally {
      setFillingReclass(false);
    }
  }

  function getScoreValue(matchId: string, side: "home" | "away"): string {
    const match = matches.find((m) => m.id === matchId);
    if (scores[matchId]) return scores[matchId][side];
    if (match && match[`${side}_score`] !== null) return String(match[`${side}_score`]);
    return "";
  }

  function setScoreValue(matchId: string, side: "home" | "away", value: string) {
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        home: side === "home" ? value : (prev[matchId]?.home ?? getScoreValue(matchId, "home")),
        away: side === "away" ? value : (prev[matchId]?.away ?? getScoreValue(matchId, "away")),
      },
    }));
  }

  function renderMatchRow(match: DBMatch) {
    const homeName = match.home_team_id ? (teamNames[match.home_team_id] ?? "?") : "TBD";
    const awayName = match.away_team_id ? (teamNames[match.away_team_id] ?? "?") : "TBD";
    const isCompleted = match.status === "completed";
    const canEdit = match.home_team_id && match.away_team_id;

    return (
      <div key={match.id} className="flex items-center gap-2 rounded-lg border p-3">
        <div className="flex-1 flex items-center justify-end gap-2 text-sm font-medium">
          <span>{homeName}</span>
          {match.home_team_id && <TeamColorDot teamId={match.home_team_id} teamNames={teamNames} />}
        </div>
        <div className="flex items-center gap-1 min-w-[140px] justify-center">
          {canEdit ? (
            <>
              <Input
                type="number"
                min={0}
                className="w-14 text-center h-8"
                value={getScoreValue(match.id, "home")}
                onChange={(e) => setScoreValue(match.id, "home", e.target.value)}
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="number"
                min={0}
                className="w-14 text-center h-8"
                value={getScoreValue(match.id, "away")}
                onChange={(e) => setScoreValue(match.id, "away", e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                disabled={savingMatch === match.id}
                onClick={() => handleSaveScore(match.id)}
              >
                {savingMatch === match.id ? "..." : t("saveScore")}
              </Button>
            </>
          ) : (
            <Badge variant="outline">TBD</Badge>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2 text-sm font-medium">
          {match.away_team_id && <TeamColorDot teamId={match.away_team_id} teamNames={teamNames} />}
          <span>{awayName}</span>
        </div>
        {isCompleted && (
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
        )}
      </div>
    );
  }

  function renderMatchesByStage(stageMatches: DBMatch[], stageLabel: string) {
    if (stageMatches.length === 0) return null;

    // Group by round
    const rounds = new Map<number, DBMatch[]>();
    for (const m of stageMatches) {
      const list = rounds.get(m.round) ?? [];
      list.push(m);
      rounds.set(m.round, list);
    }
    const sortedRounds = Array.from(rounds.entries()).sort(([a], [b]) => a - b);

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{stageLabel}</h3>
        {sortedRounds.map(([round, roundMatches]) => (
          <div key={round}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {t("round", { round })}
            </h4>
            <div className="space-y-2">
              {roundMatches.map(renderMatchRow)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {tDash("dashboard")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <p className="text-muted-foreground">{t("title")}</p>
        </div>
        <div className="flex items-center gap-2">
          {!hasMatches && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button disabled={teams.length < 2}>
                  <Play className="h-4 w-4 mr-2" />
                  {t("generateBracket")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("confirmGenerate")}</DialogTitle>
                  <DialogDescription>{t("confirmGenerateDesc")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    {tDash("cancel")}
                  </Button>
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? t("generating") : t("generateBracket")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {tournament.format === "group_playoff" && allGroupComplete && playoffEmpty && (
            <Button onClick={handleFillPlayoff} disabled={fillingPlayoff}>
              <Trophy className="h-4 w-4 mr-2" />
              {fillingPlayoff ? t("fillingPlayoff") : t("fillPlayoff")}
            </Button>
          )}
          {tournament.format === "group_reclass" && allGroupCompleteReclass && reclassEmpty && (
            <Button onClick={handleFillReclass} disabled={fillingReclass}>
              <Trophy className="h-4 w-4 mr-2" />
              {fillingReclass ? t("fillingReclass") : t("fillReclass")}
            </Button>
          )}
        </div>
      </div>

      {teams.length < 2 && !hasMatches && (
        <p className="text-muted-foreground">{t("needMinTeams")}</p>
      )}

      {!hasMatches && teams.length >= 2 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("noMatches")}
          </CardContent>
        </Card>
      )}

      {hasMatches && (
        <div className="space-y-8">
          {/* Group stage status bar */}
          {tournament.format === "group_playoff" && groupMatches.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {allGroupComplete ? (
                <Badge variant="default">{t("allGroupMatchesComplete")}</Badge>
              ) : (
                <Badge variant="secondary">
                  {t("groupMatchesRemaining", { count: groupRemaining })}
                </Badge>
              )}
            </div>
          )}

          {/* Group stage matches */}
          {renderMatchesByStage(groupMatches, t("groupStage"))}

          {/* Playoff matches */}
          {renderMatchesByStage(playoffMatches, t("playoffStage"))}

          {/* Reclass status bar */}
          {tournament.format === "group_reclass" && groupMatches.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {allGroupCompleteReclass ? (
                reclassEmpty ? (
                  <Badge variant="default">{t("allGroupMatchesCompleteReclass")}</Badge>
                ) : (
                  <Badge variant="default">{t("reclassFilled")}</Badge>
                )
              ) : (
                <Badge variant="secondary">
                  {t("groupMatchesRemaining", { count: groupMatches.filter((m) => m.status !== "completed").length })}
                </Badge>
              )}
            </div>
          )}

          {/* Reclass matches */}
          {renderMatchesByStage(reclassMatches, t("reclassStage"))}

          {/* Round robin matches */}
          {renderMatchesByStage(rrMatches, t("roundRobinStage"))}

          {/* Elimination matches */}
          {renderMatchesByStage(elimMatches, t("eliminationStage"))}
        </div>
      )}
    </>
  );
}
