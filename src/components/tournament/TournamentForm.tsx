"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TournamentData = {
  id?: string;
  name: string;
  description: string;
  format: string;
  max_teams: number;
  start_date: string;
};

export function TournamentForm({ initial }: { initial?: TournamentData }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [format, setFormat] = useState(initial?.format ?? "group_playoff");
  const [maxTeams, setMaxTeams] = useState(initial?.max_teams ?? 16);
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initial?.id;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      name,
      description,
      format,
      max_teams: maxTeams,
      start_date: startDate || null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("tournaments")
        .update(data)
        .eq("id", initial!.id!);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const { error } = await supabase
        .from("tournaments")
        .insert({ ...data, organizer_id: user.id });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">{t("tournamentName")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("tournamentDesc")}</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="format">{t("format")}</Label>
        <Select value={format} onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="group_playoff">
              {t("formatOptions.group_playoff")}
            </SelectItem>
            <SelectItem value="round_robin">
              {t("formatOptions.round_robin")}
            </SelectItem>
            <SelectItem value="single_elimination">
              {t("formatOptions.single_elimination")}
            </SelectItem>
            <SelectItem value="group_reclass">
              {t("formatOptions.group_reclass")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTeams">{t("maxTeams")}</Label>
        <Input
          id="maxTeams"
          type="number"
          min={2}
          max={64}
          value={maxTeams}
          onChange={(e) => setMaxTeams(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">{t("startDate")}</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading
          ? isEdit
            ? t("saving")
            : t("creating")
          : t("save")}
      </Button>
    </form>
  );
}
