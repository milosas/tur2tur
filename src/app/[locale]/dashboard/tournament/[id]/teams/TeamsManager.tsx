"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users, ArrowLeft, Play } from "lucide-react";
import {
  generateGroupPlayoff,
  generateRoundRobin,
  generateSingleElimination,
  generateGroupReclass,
} from "@/lib/bracket";
import type { DBMatch, DBGroup } from "@/lib/types";

type Player = {
  id: string;
  name: string;
  number: number | null;
};

type Team = {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  team_players: Player[];
};

type Tournament = {
  id: string;
  name: string;
  format: string;
  status: string;
  max_teams: number;
  start_date?: string | null;
};

export function TeamsManager({
  tournament,
  initialTeams,
  initialGroups,
  initialMatches,
}: {
  tournament: Tournament;
  initialTeams: Team[];
  initialGroups: DBGroup[];
  initialMatches: DBMatch[];
}) {
  const t = useTranslations("Teams");
  const tMatches = useTranslations("Matches");
  const tDash = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const supabase = createClient();

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [players, setPlayers] = useState<{ name: string; number: string }[]>([]);

  // Bracket generation state
  const [groups, setGroups] = useState<DBGroup[]>(initialGroups);
  const [matches, setMatches] = useState<DBMatch[]>(initialMatches);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isFull = teams.length >= tournament.max_teams;
  const hasMatches = matches.length > 0;

  function openCreate() {
    setSelectedTeam(null);
    setTeamName("");
    setLogoUrl("");
    setPlayers([]);
    setEditOpen(true);
  }

  function openEdit(team: Team) {
    setSelectedTeam(team);
    setTeamName(team.name);
    setLogoUrl(team.logo_url ?? "");
    setPlayers(
      team.team_players.map((p) => ({
        name: p.name,
        number: p.number?.toString() ?? "",
      }))
    );
    setEditOpen(true);
  }

  function addPlayerRow() {
    setPlayers([...players, { name: "", number: "" }]);
  }

  function updatePlayer(index: number, field: "name" | "number", value: string) {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  }

  function removePlayer(index: number) {
    setPlayers(players.filter((_, i) => i !== index));
  }

  async function reloadTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*, team_players(*)")
      .eq("tournament_id", tournament.id)
      .order("created_at", { ascending: true });
    if (data) setTeams(data);
  }

  async function handleSave() {
    setLoading(true);
    const validPlayers = players.filter((p) => p.name.trim());

    if (selectedTeam) {
      const { error } = await supabase
        .from("teams")
        .update({ name: teamName, logo_url: logoUrl || null })
        .eq("id", selectedTeam.id);

      if (!error) {
        await supabase.from("team_players").delete().eq("team_id", selectedTeam.id);
        if (validPlayers.length > 0) {
          await supabase.from("team_players").insert(
            validPlayers.map((p) => ({
              team_id: selectedTeam.id,
              name: p.name.trim(),
              number: p.number ? parseInt(p.number) : null,
            }))
          );
        }
      }
    } else {
      const { data: newTeam, error } = await supabase
        .from("teams")
        .insert({
          tournament_id: tournament.id,
          name: teamName,
          logo_url: logoUrl || null,
        })
        .select()
        .single();

      if (!error && newTeam && validPlayers.length > 0) {
        await supabase.from("team_players").insert(
          validPlayers.map((p) => ({
            team_id: newTeam.id,
            name: p.name.trim(),
            number: p.number ? parseInt(p.number) : null,
          }))
        );
      }
    }

    setEditOpen(false);
    setLoading(false);
    router.refresh();
    await reloadTeams();
  }

  async function handleDelete() {
    if (!selectedTeam) return;
    setLoading(true);

    // Nullify team references in matches if bracket exists
    if (hasMatches) {
      await supabase
        .from("matches")
        .update({ home_team_id: null })
        .eq("tournament_id", tournament.id)
        .eq("home_team_id", selectedTeam.id);
      await supabase
        .from("matches")
        .update({ away_team_id: null })
        .eq("tournament_id", tournament.id)
        .eq("away_team_id", selectedTeam.id);
    }

    await supabase.from("team_players").delete().eq("team_id", selectedTeam.id);
    await supabase.from("teams").delete().eq("id", selectedTeam.id);

    setDeleteOpen(false);
    setSelectedTeam(null);
    setLoading(false);

    await reloadTeams();

    if (hasMatches) {
      const { data: freshMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("tournament_id", tournament.id)
        .order("stage")
        .order("round")
        .order("match_number");
      if (freshMatches) setMatches(freshMatches);
    }
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

      await supabase
        .from("tournaments")
        .update({ status: "in_progress" })
        .eq("id", tournament.id);

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

  return (
    <>
      <div className="mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {tCommon("back")}
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("manageTeams")}</h1>
          <p className="text-muted-foreground mt-1">
            {tournament.name} — {t("teamCount", { count: teams.length, max: tournament.max_teams })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Generate Bracket — next to Add Team */}
          {!hasMatches && teams.length >= 2 && (
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  {t("generateBracket")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{tMatches("confirmGenerate")}</DialogTitle>
                  <DialogDescription>{tMatches("confirmGenerateDesc")}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? tMatches("generating") : t("generateBracket")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={openCreate} disabled={isFull}>
            <Plus className="h-4 w-4 mr-2" />
            {isFull ? t("teamsFull") : t("addTeam")}
          </Button>
        </div>
      </div>

      {teams.length === 0 ? (
        <p className="text-muted-foreground">{t("noTeams")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {team.team_players.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t("players")} ({team.team_players.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {team.team_players.map((player) => (
                        <span
                          key={player.id}
                          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                        >
                          {player.number != null && (
                            <span className="font-bold">#{player.number}</span>
                          )}
                          {player.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(team)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    {t("editTeam")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedTeam(team);
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTeam ? t("editTeam") : t("addTeam")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">{t("teamName")}</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">{t("logoUrl")}</Label>
              <Input
                id="logoUrl"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground">{t("logoUrlHint")}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("players")}</Label>
                <Button type="button" variant="outline" size="sm" onClick={addPlayerRow}>
                  <Plus className="h-3 w-3 mr-1" />
                  {t("addPlayer")}
                </Button>
              </div>
              {players.map((player, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={t("playerName")}
                    value={player.name}
                    onChange={(e) => updatePlayer(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="#"
                    value={player.number}
                    onChange={(e) => updatePlayer(index, "number", e.target.value)}
                    className="w-16"
                    type="number"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    {t("removePlayer")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={loading || !teamName.trim()}>
              {loading ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
            <DialogDescription>
              {t("confirmDeleteDesc", { name: selectedTeam?.name ?? "" })}
              {hasMatches && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-400">
                  {t("deleteTeamMatchWarning")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {t("deleteTeam")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
