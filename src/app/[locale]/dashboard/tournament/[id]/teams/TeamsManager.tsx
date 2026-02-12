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
import { Plus, Pencil, Trash2, Users, ArrowLeft } from "lucide-react";

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
  max_teams: number;
};

export function TeamsManager({
  tournament,
  initialTeams,
}: {
  tournament: Tournament;
  initialTeams: Team[];
}) {
  const t = useTranslations("Teams");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const supabase = createClient();

  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [teamName, setTeamName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [players, setPlayers] = useState<{ name: string; number: string }[]>([]);

  const isFull = teams.length >= tournament.max_teams;

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

  async function handleSave() {
    setLoading(true);

    const validPlayers = players.filter((p) => p.name.trim());

    if (selectedTeam) {
      // Update team
      const { error } = await supabase
        .from("teams")
        .update({ name: teamName, logo_url: logoUrl || null })
        .eq("id", selectedTeam.id);

      if (!error) {
        // Delete old players and insert new ones
        await supabase
          .from("team_players")
          .delete()
          .eq("team_id", selectedTeam.id);

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
      // Create team
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

    // Reload teams
    const { data } = await supabase
      .from("teams")
      .select("*, team_players(*)")
      .eq("tournament_id", tournament.id)
      .order("created_at", { ascending: true });
    if (data) setTeams(data);
  }

  async function handleDelete() {
    if (!selectedTeam) return;
    setLoading(true);

    await supabase.from("team_players").delete().eq("team_id", selectedTeam.id);
    await supabase.from("teams").delete().eq("id", selectedTeam.id);

    setDeleteOpen(false);
    setSelectedTeam(null);
    setLoading(false);

    const { data } = await supabase
      .from("teams")
      .select("*, team_players(*)")
      .eq("tournament_id", tournament.id)
      .order("created_at", { ascending: true });
    if (data) setTeams(data);
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
        <Button onClick={openCreate} disabled={isFull}>
          <Plus className="h-4 w-4 mr-2" />
          {isFull ? t("teamsFull") : t("addTeam")}
        </Button>
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
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(team)}
                  >
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

            {/* Players */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("players")}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPlayerRow}
                >
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
