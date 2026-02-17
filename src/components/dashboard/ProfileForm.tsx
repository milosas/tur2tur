"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Check, Pencil, Mail, Phone, User, Crown, Zap, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { DBProfile } from "@/lib/types";

export function ProfileForm({
  profile,
  tournamentCount = 0,
}: {
  profile: DBProfile;
  tournamentCount?: number;
}) {
  const t = useTranslations("Profile");
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Saved values to display in view mode
  const [savedData, setSavedData] = useState({
    fullName: profile.full_name ?? "",
    bio: profile.bio ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    avatarUrl: profile.avatar_url ?? "",
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${profile.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  function applyLogoUrl() {
    if (logoUrlInput.trim()) {
      setAvatarUrl(logoUrlInput.trim());
      setLogoUrlInput("");
    }
  }

  function removeLogo() {
    setAvatarUrl("");
  }

  function startEditing() {
    setEditing(true);
    setSaved(false);
    setError("");
  }

  function cancelEditing() {
    setFullName(savedData.fullName);
    setBio(savedData.bio);
    setEmail(savedData.email);
    setPhone(savedData.phone);
    setAvatarUrl(savedData.avatarUrl);
    setEditing(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        bio: bio || null,
        email: email || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    const newSaved = {
      fullName,
      bio,
      email,
      phone,
      avatarUrl,
    };
    setSavedData(newSaved);
    setSaving(false);
    setSaved(true);
    setEditing(false);
  }

  // View mode
  if (!editing) {
    return (
      <Card className="max-w-lg">
        <CardContent className="pt-6 space-y-5">
          {/* Logo + Name */}
          <div className="flex items-center gap-4">
            {savedData.avatarUrl ? (
              <img
                src={savedData.avatarUrl}
                alt="Logo"
                className="h-20 w-20 rounded-lg object-cover border shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <User className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-semibold truncate">
                {savedData.fullName || t("noName")}
              </h2>
              {savedData.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {savedData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Contact info */}
          {(savedData.email || savedData.phone) && (
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {savedData.email && (
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  {savedData.email}
                </span>
              )}
              {savedData.phone && (
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  {savedData.phone}
                </span>
              )}
            </div>
          )}

          {/* No data message */}
          {!savedData.fullName && !savedData.bio && !savedData.email && !savedData.phone && !savedData.avatarUrl && (
            <p className="text-sm text-muted-foreground">{t("noData")}</p>
          )}

          {saved && (
            <p className="text-sm text-green-600 flex items-center gap-1.5">
              <Check className="h-4 w-4" />
              {t("saved")}
            </p>
          )}

          <Button onClick={startEditing} variant="outline" className="w-full">
            <Pencil className="h-4 w-4 mr-2" />
            {t("editProfile")}
          </Button>

          {/* Subscription section */}
          <SubscriptionSection
            tier={profile.subscription_tier ?? "free"}
            credits={profile.tournament_credits ?? 0}
            subscriptionEnd={profile.subscription_end_date}
            tournamentCount={tournamentCount}
            stripeCustomerId={profile.stripe_customer_id}
          />
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      {/* Logo */}
      <div className="space-y-3">
        <Label>{t("logo")}</Label>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <div className="relative">
              <img
                src={avatarUrl}
                alt="Logo"
                className="h-20 w-20 rounded-lg object-cover border shrink-0"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                aria-label={t("removeLogo")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
              <Upload className="h-6 w-6 text-muted-foreground/50" />
            </div>
          )}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? t("uploading") : t("uploadLogo")}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
        {/* Logo URL fallback */}
        <div className="flex gap-2">
          <Input
            placeholder={t("logoUrlPlaceholder")}
            value={logoUrlInput}
            onChange={(e) => setLogoUrlInput(e.target.value)}
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyLogoUrl}
            disabled={!logoUrlInput.trim()}
          >
            {t("apply")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">{t("bio")}</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t("phone")}</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? t("saving") : t("save")}
        </Button>
        <Button type="button" variant="outline" onClick={cancelEditing}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

function SubscriptionSection({
  tier,
  credits,
  subscriptionEnd,
  tournamentCount,
  stripeCustomerId,
}: {
  tier: string;
  credits: number;
  subscriptionEnd: string | null;
  tournamentCount: number;
  stripeCustomerId: string | null;
}) {
  const t = useTranslations("Profile");
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="border-t pt-4 space-y-3">
      <h3 className="font-medium text-sm">{t("subscription")}</h3>
      <div className="flex items-center gap-2">
        {tier === "unlimited" ? (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1">
            <Crown className="h-3 w-3" />
            {t("planUnlimited")}
          </Badge>
        ) : tournamentCount < 5 ? (
          <Badge variant="outline">{t("planFree")}</Badge>
        ) : null}
      </div>
      {tier === "unlimited" ? (
        subscriptionEnd && (
          <p className="text-sm text-muted-foreground">
            {t("validUntil", {
              date: new Date(subscriptionEnd).toLocaleDateString(),
            })}
          </p>
        )
      ) : (
        <p className="text-sm text-muted-foreground">
          {tournamentCount < 5 ? (
            t("tournamentsCreated", { count: tournamentCount, max: 5 })
          ) : credits > 0 ? (
            t("creditsUsed", {
              total: tournamentCount,
              count: Math.max(0, tournamentCount - 5),
              max: credits,
            })
          ) : (
            t("freeUsedUp")
          )}
        </p>
      )}
      <div className="flex gap-2">
        {stripeCustomerId && (
          <Button
            variant="outline"
            size="sm"
            onClick={openPortal}
            disabled={portalLoading}
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {t("manageSubscription")}
          </Button>
        )}
        {tier !== "unlimited" && (
          <Button asChild size="sm">
            <Link href="/pricing">
              <Zap className="h-3 w-3 mr-1" />
              {t("upgradePlan")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
