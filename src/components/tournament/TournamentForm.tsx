"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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
import Image from "next/image";
import { Globe, Lock, AlertTriangle, Save, Megaphone, ImagePlus, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

type TournamentData = {
  id?: string;
  name: string;
  description: string;
  format: string;
  max_teams: number;
  start_date: string;
  end_date: string;
  venue?: string;
  visibility?: string;
  logo_url?: string;
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
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [visibility, setVisibility] = useState(initial?.visibility ?? "public");
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(t("logoTooLarge"));
      return;
    }

    setLogoUploading(true);
    setError("");

    const ext = file.name.split(".").pop() ?? "png";
    const path = `tournament-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("public-assets")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setLogoUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("public-assets")
      .getPublicUrl(path);

    setLogoUrl(urlData.publicUrl);
    setLogoUploading(false);
  }

  async function handleSave(status: "draft" | "registration") {
    setLoading(true);
    setError("");

    const data = {
      name,
      description,
      format,
      max_teams: maxTeams,
      start_date: startDate || null,
      end_date: endDate || null,
      venue: venue || null,
      visibility,
      logo_url: logoUrl || null,
      status,
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
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">{t("tournamentName")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Tournament Logo */}
      <div className="space-y-2">
        <Label>{t("tournamentLogo")}</Label>
        {logoUrl ? (
          <div className="relative group w-full">
            <Image
              src={logoUrl}
              alt="Logo"
              width={400}
              height={200}
              className="w-full rounded-lg object-contain border bg-muted/30"
              style={{ maxHeight: "200px" }}
            />
            <button
              type="button"
              onClick={() => setLogoUrl("")}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={logoUploading}
            className="w-full h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <ImagePlus className="h-8 w-8 text-muted-foreground/40" />
            <span className="text-sm text-muted-foreground">
              {logoUploading ? t("uploading") : t("uploadLogo")}
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLogoUpload(file);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-muted-foreground">
          {t("logoHint")}
        </p>
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

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="endDate">{t("endDate")}</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={loading || !name}
          onClick={() => handleSave("draft")}
        >
          <Save className="h-4 w-4 mr-1.5" />
          {t("saveDraft")}
        </Button>
        <Button
          type="button"
          disabled={loading || !name}
          onClick={() => handleSave("registration")}
        >
          <Megaphone className="h-4 w-4 mr-1.5" />
          {t("publish")}
        </Button>
      </div>
    </form>
  );
}
