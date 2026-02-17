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
import { ColorPicker } from "./ColorPicker";
import { Globe, Lock, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/navigation";

type TournamentData = {
  id?: string;
  name: string;
  description: string;
  format: string;
  max_teams: number;
  start_date: string;
  venue?: string;
  accent_colors?: string[];
  visibility?: string;
};

export function TournamentForm({
  initial,
  canCreate = true,
}: {
  initial?: TournamentData;
  canCreate?: boolean;
}) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [format, setFormat] = useState(initial?.format ?? "group_playoff");
  const [maxTeams, setMaxTeams] = useState(initial?.max_teams ?? 16);
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [accentColors, setAccentColors] = useState<string[]>(
    initial?.accent_colors ?? []
  );
  const [visibility, setVisibility] = useState(initial?.visibility ?? "public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initial?.id;
  const tPricing = useTranslations("Pricing");

  if (!canCreate && !isEdit) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              {t("limitReached")}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {t("limitReachedDesc")}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/pricing">{tPricing("upgrade")}</Link>
        </Button>
      </div>
    );
  }

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
      venue: venue || null,
      accent_colors: accentColors,
      visibility,
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
      // Increment lifetime tournament counter (never decreases on delete)
      await supabase.rpc("increment_tournaments_created", { user_id: user.id });
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

      <div className="space-y-2">
        <Label htmlFor="venue">{t("venue")}</Label>
        <Input
          id="venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder={t("venuePlaceholder")}
        />
      </div>

      <ColorPicker colors={accentColors} onChange={setAccentColors} />

      {/* Visibility */}
      <div className="space-y-2">
        <Label>{t("visibility")}</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              visibility === "public"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <Globe className="h-4 w-4" />
            {t("visibilityPublic")}
          </button>
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
              visibility === "private"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            <Lock className="h-4 w-4" />
            {t("visibilityPrivate")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {visibility === "public" ? t("visibilityPublicHint") : t("visibilityPrivateHint")}
        </p>
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
