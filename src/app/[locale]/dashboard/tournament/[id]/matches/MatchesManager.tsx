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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Play, Trophy, CheckCircle, Clock, Calendar, X, ExternalLink } from "lucide-react";
import { TeamColorDot } from "@/components/tournament/TeamColorDot";
import { generateGroupPlayoff, generateRoundRobin, generateSingleElimination, generateGroupReclass } from "@/lib/bracket";
import { calculateStandings } from "@/lib/standings";
import type { DBMatch, DBGroup, TeamNameMap } from "@/lib/types";
import { dbMatchToMatch } from "@/lib/types";

import { Label } from "@/components/ui/label";

type Team = { id: string; name: string };
type Tournament = {
  id: string;
  name: string;
  format: string;
  status: string;
  max_teams: number;
  start_date?: string | null;
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
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [clearingSchedule, setClearingSchedule] = useState(false);
  const [editingTimeMatch, setEditingTimeMatch] = useState<string | null>(null);
  const [swappingTeam, setSwappingTeam] = useState<string | null>(null);

  const tTeams = useTranslations("Teams");

  // Schedule form state
  const defaultStart = tournament.start_date
    ? new Date(tournament.start_date).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 11) + "10:00";
  const [scheduleStart, setScheduleStart] = useState(defaultStart);
  const [matchDuration, setMatchDuration] = useState(30);
  const [breakDuration, setBreakDuration] = useState(5);
  const [parallelGroups, setParallelGroups] = useState(true);

  // Score editing state: matchId -> { home, away }
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  // Tiebreaker state: matchId -> { home, away, label }
  const [penalties, setPenalties] = useState<Record<string, { home: string; away: string; label: string }>>({});

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
  const hasScheduledTimes = matches.some((m) => m.scheduled_at);
  const hasGroupFormat = ["group_playoff", "group_reclass"].includes(tournament.format);

  // Reorder matches so no team plays back-to-back (best effort).
  // Takes a flat list of matches and returns them reordered.
  function orderWithRest(matchList: DBMatch[]): DBMatch[] {
    if (matchList.length <= 1) return matchList;

    const result: DBMatch[] = [];
    const remaining = [...matchList];
    const lastPlayedSlot = new Map<string, number>(); // teamId -> last slot index

    for (let slot = 0; remaining.length > 0; slot++) {
      // Find the best match: one where neither team played in the previous slot
      let bestIdx = -1;
      let bestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const m = remaining[i];
        const homeSlot = lastPlayedSlot.get(m.home_team_id ?? "") ?? -999;
        const awaySlot = lastPlayedSlot.get(m.away_team_id ?? "") ?? -999;
        const homeGap = slot - homeSlot;
        const awayGap = slot - awaySlot;
        const minGap = Math.min(homeGap, awayGap);

        // Higher score = more rest for both teams
        if (minGap > bestScore) {
          bestScore = minGap;
          bestIdx = i;
        }
        // If we found a match where both teams rested at least 2 slots, good enough
        if (minGap >= 2) break;
      }

      if (bestIdx === -1) bestIdx = 0;
      const chosen = remaining.splice(bestIdx, 1)[0];
      result.push(chosen);

      if (chosen.home_team_id) lastPlayedSlot.set(chosen.home_team_id, slot);
      if (chosen.away_team_id) lastPlayedSlot.set(chosen.away_team_id, slot);
    }

    return result;
  }

  async function handleGenerateSchedule() {
    setGeneratingSchedule(true);
    try {
      const start = new Date(scheduleStart);
      const slotMs = (matchDuration + breakDuration) * 60 * 1000;

      // Separate matches by group
      const groupedByGroup = new Map<string, DBMatch[]>();
      const nonGroupMatches: DBMatch[] = [];

      for (const m of matches) {
        if (m.group_id) {
          const list = groupedByGroup.get(m.group_id) ?? [];
          list.push(m);
          groupedByGroup.set(m.group_id, list);
        } else {
          nonGroupMatches.push(m);
        }
      }

      const sortMatches = (a: DBMatch, b: DBMatch) =>
        a.round - b.round || a.match_number - b.match_number;

      const updates: { id: string; scheduled_at: string }[] = [];

      if (parallelGroups && groupedByGroup.size > 0) {
        // Each group runs its own timeline starting at startTime
        let latestEnd = start.getTime();
        for (const [, gMatches] of groupedByGroup) {
          gMatches.sort(sortMatches);
          const ordered = orderWithRest(gMatches);
          let time = start.getTime();
          for (const m of ordered) {
            updates.push({ id: m.id, scheduled_at: new Date(time).toISOString() });
            time += slotMs;
          }
          if (time > latestEnd) latestEnd = time;
        }
        // Non-group matches (playoff) start after latest group ends
        let time = latestEnd;
        nonGroupMatches.sort(sortMatches);
        const orderedNonGroup = orderWithRest(nonGroupMatches);
        for (const m of orderedNonGroup) {
          updates.push({ id: m.id, scheduled_at: new Date(time).toISOString() });
          time += slotMs;
        }
      } else {
        // All matches in sequence — sort by stage, then reorder with rest
        const allSorted = [...matches].sort((a, b) => {
          const stagePriority: Record<string, number> = {
            group: 0, round_robin: 0, reclass: 1, playoff: 2, elimination: 2,
          };
          const sa = stagePriority[a.stage ?? ""] ?? 1;
          const sb = stagePriority[b.stage ?? ""] ?? 1;
          return sa - sb || a.round - b.round || a.match_number - b.match_number;
        });

        // Group by stage, reorder within each stage, then concatenate
        const stages = new Map<string, DBMatch[]>();
        for (const m of allSorted) {
          const key = m.stage ?? "other";
          const list = stages.get(key) ?? [];
          list.push(m);
          stages.set(key, list);
        }

        const ordered: DBMatch[] = [];
        for (const [, stageMatches] of stages) {
          ordered.push(...orderWithRest(stageMatches));
        }

        let time = start.getTime();
        for (const m of ordered) {
          updates.push({ id: m.id, scheduled_at: new Date(time).toISOString() });
          time += slotMs;
        }
      }

      // Batch update DB
      for (const up of updates) {
        await supabase.from("matches").update({ scheduled_at: up.scheduled_at }).eq("id", up.id);
      }

      // Update local state
      setMatches((prev) =>
        prev.map((m) => {
          const upd = updates.find((u) => u.id === m.id);
          return upd ? { ...m, scheduled_at: upd.scheduled_at } : m;
        })
      );
      setScheduleOpen(false);
    } finally {
      setGeneratingSchedule(false);
    }
  }

  async function handleClearSchedule() {
    setClearingSchedule(true);
    try {
      for (const m of matches) {
        if (m.scheduled_at) {
          await supabase.from("matches").update({ scheduled_at: null }).eq("id", m.id);
        }
      }
      setMatches((prev) => prev.map((m) => ({ ...m, scheduled_at: null })));
    } finally {
      setClearingSchedule(false);
    }
  }

  async function handleUpdateMatchTime(matchId: string, newTime: string) {
    const scheduled_at = newTime ? new Date(newTime).toISOString() : null;
    await supabase.from("matches").update({ scheduled_at }).eq("id", matchId);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, scheduled_at } : m))
    );
    setEditingTimeMatch(null);
  }

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

    const match = matches.find((m) => m.id === matchId);
    const isKnockout = match && (match.stage === "playoff" || match.stage === "elimination");
    const isTied = homeScore === awayScore;
    const pen = penalties[matchId];

    // If tied in knockout and no valid tiebreaker yet — don't save
    if (isKnockout && isTied) {
      if (!pen || pen.home === "" || pen.away === "") return;
      const penHome = parseInt(pen.home);
      const penAway = parseInt(pen.away);
      if (isNaN(penHome) || isNaN(penAway) || penHome < 0 || penAway < 0 || penHome === penAway) return;
    }

    setSavingMatch(matchId);
    try {
      const updateData: Record<string, unknown> = {
        home_score: homeScore,
        away_score: awayScore,
        status: "completed",
        completed_at: new Date().toISOString(),
      };

      // Save tiebreaker if tied in knockout
      if (isKnockout && isTied && pen) {
        updateData.penalty_home = parseInt(pen.home);
        updateData.penalty_away = parseInt(pen.away);
        updateData.penalty_label = pen.label || null;
      } else {
        // Clear any existing tiebreaker if score is no longer tied
        updateData.penalty_home = null;
        updateData.penalty_away = null;
        updateData.penalty_label = null;
      }

      await supabase
        .from("matches")
        .update(updateData)
        .eq("id", matchId);

      let updatedMatches = matches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              home_score: homeScore,
              away_score: awayScore,
              status: "completed",
              penalty_home: (updateData.penalty_home as number | null) ?? null,
              penalty_away: (updateData.penalty_away as number | null) ?? null,
              penalty_label: (updateData.penalty_label as string | null) ?? null,
            }
          : m
      );

      // Determine winner for auto-advance
      let winnerId: string | null = null;
      if (match && isKnockout) {
        if (!isTied) {
          winnerId = homeScore > awayScore ? match.home_team_id : match.away_team_id;
        } else if (pen) {
          const penHome = parseInt(pen.home);
          const penAway = parseInt(pen.away);
          winnerId = penHome > penAway ? match.home_team_id : match.away_team_id;
        }
      }

      // Auto-advance winner in playoff/elimination stages
      if (match && winnerId && isKnockout) {
        const stageMatches = updatedMatches
          .filter((m) => m.stage === match.stage)
          .sort((a, b) => a.round - b.round || a.match_number - b.match_number);

        const roundMatches = stageMatches.filter((m) => m.round === match.round);
        const nextRoundMatches = stageMatches.filter((m) => m.round === match.round + 1);

        if (nextRoundMatches.length > 0) {
          const posInRound = roundMatches.findIndex((m) => m.id === matchId);
          const targetMatchIdx = Math.floor(posInRound / 2);
          const side = posInRound % 2 === 0 ? "home_team_id" : "away_team_id";

          if (targetMatchIdx < nextRoundMatches.length) {
            const targetMatch = nextRoundMatches[targetMatchIdx];

            await supabase
              .from("matches")
              .update({ [side]: winnerId })
              .eq("id", targetMatch.id);

            updatedMatches = updatedMatches.map((m) =>
              m.id === targetMatch.id ? { ...m, [side]: winnerId } : m
            );
          }
        }
      }

      setMatches(updatedMatches);
      setScores((prev) => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
      setPenalties((prev) => {
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

  async function handleSwapTeam(matchId: string, side: "home" | "away", newTeamId: string) {
    const field = side === "home" ? "home_team_id" : "away_team_id";
    const value = newTeamId === "__none__" ? null : newTeamId;
    await supabase.from("matches").update({ [field]: value }).eq("id", matchId);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    );
    setSwappingTeam(null);
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
    const homeSwapKey = `${match.id}-home`;
    const awaySwapKey = `${match.id}-away`;
    const isKnockout = match.stage === "playoff" || match.stage === "elimination";
    const hasPenalty = match.penalty_home !== null && match.penalty_away !== null;
    const isTiedInput = (() => {
      const s = scores[match.id];
      if (s) return s.home !== "" && s.away !== "" && parseInt(s.home) === parseInt(s.away);
      return match.home_score !== null && match.away_score !== null && match.home_score === match.away_score;
    })();
    const showPenaltyInputs = isKnockout && canEdit && isTiedInput;

    // Determine winner for highlighting
    let winnerId: string | null = null;
    if (isCompleted && match.home_score !== null && match.away_score !== null) {
      if (match.home_score > match.away_score) winnerId = match.home_team_id;
      else if (match.away_score > match.home_score) winnerId = match.away_team_id;
      else if (hasPenalty) {
        winnerId = match.penalty_home! > match.penalty_away! ? match.home_team_id : match.away_team_id;
      }
    }

    const scheduledTime = match.scheduled_at
      ? new Date(match.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : null;
    const scheduledDatetimeLocal = match.scheduled_at
      ? new Date(match.scheduled_at).toISOString().slice(0, 16)
      : "";

    const homeIsWinner = winnerId && winnerId === match.home_team_id;
    const awayIsWinner = winnerId && winnerId === match.away_team_id;

    return (
      <div key={match.id} className="rounded-lg border p-3 space-y-2">
        <div className="flex items-center gap-2">
          {/* Scheduled time display / editor */}
          <div className="w-20 shrink-0">
            {editingTimeMatch === match.id ? (
              <Input
                type="datetime-local"
                className="h-7 text-xs px-1"
                defaultValue={scheduledDatetimeLocal}
                autoFocus
                onBlur={(e) => handleUpdateMatchTime(match.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateMatchTime(match.id, (e.target as HTMLInputElement).value);
                  if (e.key === "Escape") setEditingTimeMatch(null);
                }}
              />
            ) : scheduledTime ? (
              <button
                onClick={() => setEditingTimeMatch(match.id)}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                title={t("editTime")}
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm font-bold text-foreground">{scheduledTime}</span>
              </button>
            ) : null}
          </div>
          {/* Home team — clickable to swap */}
          <div className="flex-1 flex items-center justify-end gap-2 text-sm font-medium">
            {swappingTeam === homeSwapKey ? (
              <Select
                value={match.home_team_id ?? "__none__"}
                onValueChange={(val) => handleSwapTeam(match.id, "home", val)}
              >
                <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
                  <SelectValue placeholder={tTeams("selectTeam")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">TBD</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                onClick={() => setSwappingTeam(homeSwapKey)}
                className={`hover:underline cursor-pointer text-right ${homeIsWinner ? "font-bold text-green-600 dark:text-green-400" : ""}`}
                title={tTeams("swapTeam")}
              >
                {homeName}
              </button>
            )}
            {match.home_team_id && <TeamColorDot teamId={match.home_team_id} teamNames={teamNames} />}
          </div>
          {/* Score inputs */}
          <div className="flex items-center gap-1 justify-center">
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
              </>
            ) : (
              <Badge variant="outline">TBD</Badge>
            )}
          </div>
          {/* Away team — clickable to swap */}
          <div className="flex-1 flex items-center gap-2 text-sm font-medium">
            {match.away_team_id && <TeamColorDot teamId={match.away_team_id} teamNames={teamNames} />}
            {swappingTeam === awaySwapKey ? (
              <Select
                value={match.away_team_id ?? "__none__"}
                onValueChange={(val) => handleSwapTeam(match.id, "away", val)}
              >
                <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs">
                  <SelectValue placeholder={tTeams("selectTeam")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">TBD</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                onClick={() => setSwappingTeam(awaySwapKey)}
                className={`hover:underline cursor-pointer ${awayIsWinner ? "font-bold text-green-600 dark:text-green-400" : ""}`}
                title={tTeams("swapTeam")}
              >
                {awayName}
              </button>
            )}
          </div>
          {/* Save + status — after away team */}
          <div className="flex items-center gap-1 shrink-0">
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                disabled={savingMatch === match.id}
                onClick={() => handleSaveScore(match.id)}
              >
                {savingMatch === match.id ? "..." : t("saveScore")}
              </Button>
            )}
            {isCompleted && (
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Penalty/tiebreaker input row — shown when tied in knockout */}
        {showPenaltyInputs && !isCompleted && (
          <div className="flex items-center gap-2 pl-20 text-sm">
            <span className="text-muted-foreground">{t("penaltyLabel")}:</span>
            <Input
              type="text"
              placeholder={t("penaltyLabelPlaceholder")}
              className="h-7 w-40 text-xs"
              value={penalties[match.id]?.label ?? ""}
              onChange={(e) =>
                setPenalties((prev) => ({
                  ...prev,
                  [match.id]: { ...prev[match.id], home: prev[match.id]?.home ?? "", away: prev[match.id]?.away ?? "", label: e.target.value },
                }))
              }
            />
            <Input
              type="number"
              min={0}
              className="w-14 text-center h-7"
              placeholder="0"
              value={penalties[match.id]?.home ?? ""}
              onChange={(e) =>
                setPenalties((prev) => ({
                  ...prev,
                  [match.id]: { ...prev[match.id], home: e.target.value, away: prev[match.id]?.away ?? "", label: prev[match.id]?.label ?? "" },
                }))
              }
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              className="w-14 text-center h-7"
              placeholder="0"
              value={penalties[match.id]?.away ?? ""}
              onChange={(e) =>
                setPenalties((prev) => ({
                  ...prev,
                  [match.id]: { ...prev[match.id], home: prev[match.id]?.home ?? "", away: e.target.value, label: prev[match.id]?.label ?? "" },
                }))
              }
            />
          </div>
        )}

        {/* Penalty display for completed matches */}
        {isCompleted && hasPenalty && (
          <div className="pl-20 text-xs text-muted-foreground">
            *({match.penalty_label || t("penaltyDefault")}: {match.penalty_home}-{match.penalty_away})
          </div>
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <Button asChild variant="outline" size="sm">
              <Link href={`/tournaments/${tournament.id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t("tournamentPage")}
              </Link>
            </Button>
          </div>
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
          {hasMatches && (
            <>
              <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("generateSchedule")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("generateSchedule")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>{t("startTime")}</Label>
                      <Input
                        type="datetime-local"
                        value={scheduleStart}
                        onChange={(e) => setScheduleStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("matchDuration")}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={matchDuration}
                        onChange={(e) => setMatchDuration(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("breakDuration")}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    {hasGroupFormat && (
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={parallelGroups}
                            onChange={(e) => setParallelGroups(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">{t("parallelGroups")}</span>
                        </label>
                        <p className="text-xs text-muted-foreground">{t("parallelGroupsHint")}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                      {tDash("cancel")}
                    </Button>
                    <Button onClick={handleGenerateSchedule} disabled={generatingSchedule}>
                      {generatingSchedule ? t("generatingSchedule") : t("generateSchedule")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {hasScheduledTimes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSchedule}
                  disabled={clearingSchedule}
                >
                  <X className="h-4 w-4 mr-1" />
                  {clearingSchedule ? t("clearingSchedule") : t("clearSchedule")}
                </Button>
              )}
            </>
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
