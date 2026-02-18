"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/tournament/DeleteDialog";
import { TournamentQR } from "@/components/tournament/TournamentQR";
import { Plus, Pencil, Users, Swords, UserCircle, Globe, Lock, Crown, Zap, ExternalLink } from "lucide-react";
import type { SubscriptionTier } from "@/lib/types";

type DBTournament = {
  id: string;
  name: string;
  description: string | null;
  format: string;
  status: string;
  max_teams: number;
  start_date: string | null;
  end_date: string | null;
  accent_colors: string[] | null;
  visibility: string | null;
  logo_url: string | null;
  created_at: string;
};

type SubscriptionInfo = {
  tier: SubscriptionTier;
  tournamentCount: number;
  credits: number;
  maxFree: number;
  subscriptionEnd?: string | null;
};

export function DashboardContent({
  tournaments,
  locale,
  subscription,
}: {
  tournaments: DBTournament[];
  locale: string;
  subscription: SubscriptionInfo;
}) {
  const t = useTranslations("Dashboard");
  const tTeams = useTranslations("Teams");
  const tTour = useTranslations("Tournaments");

  const todayStr = new Date().toISOString().slice(0, 10);

  function getTournamentCategory(tour: DBTournament): "ongoing" | "upcoming" | "past" | "draft" {
    if (tour.status === "draft") return "draft";
    const isActive = ["in_progress", "group_stage", "playoffs"].includes(tour.status);
    const isCompleted = tour.status === "completed";
    const startStr = tour.start_date?.slice(0, 10) ?? null;
    const endStr = tour.end_date?.slice(0, 10) ?? startStr;
    if (isActive) return "ongoing";
    if (isCompleted) return "past";
    if (!startStr || startStr > todayStr) return "upcoming";
    if (startStr <= todayStr && (!endStr || endStr >= todayStr)) return "ongoing";
    return "past";
  }

  const categoryLabels: Record<string, string> = {
    ongoing: tTour("categoryOngoing"),
    upcoming: tTour("categoryUpcoming"),
    past: tTour("categoryPast"),
    draft: t("statusDraft"),
  };
  const categoryVariants: Record<string, "default" | "secondary" | "outline"> = {
    ongoing: "default",
    upcoming: "secondary",
    past: "outline",
    draft: "outline",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            {subscription.tier === "unlimited" ? (
              <>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1">
                  <Crown className="h-3 w-3" />
                  {t("tierUnlimited")}
                </Badge>
                {subscription.subscriptionEnd && (
                  <span className="text-sm text-muted-foreground">
                    {t("validUntil", { date: new Date(subscription.subscriptionEnd).toLocaleDateString() })}
                  </span>
                )}
              </>
            ) : (
              <>
                {subscription.tournamentCount < subscription.maxFree && (
                  <Badge variant="outline" className="gap-1">
                    {t("tierFree")}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {subscription.tournamentCount < subscription.maxFree ? (
                    t("tournamentsCreated", {
                      count: subscription.tournamentCount,
                      max: subscription.maxFree,
                    })
                  ) : subscription.credits > 0 ? (
                    t("creditsUsed", {
                      total: subscription.tournamentCount,
                      count: Math.max(0, subscription.tournamentCount - subscription.maxFree),
                      max: subscription.credits,
                    })
                  ) : (
                    t("freeUsedUp")
                  )}
                </span>
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                  <Link href="/pricing">
                    <Zap className="h-3 w-3 mr-1" />
                    {t("upgradePlan")}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/profile">
              <UserCircle className="h-4 w-4 mr-2" />
              {t("profile")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/create">
              <Plus className="h-4 w-4 mr-2" />
              {t("createTournament")}
            </Link>
          </Button>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">{t("noTournaments")}</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => {
            const ac = tournament.accent_colors ?? [];
            const hasColors = ac.length > 0;
            const primary = ac[0] ?? null;
            const fadedBg = hasColors
              ? ac.length === 1
                ? `linear-gradient(160deg, ${ac[0]}12 0%, transparent 50%)`
                : `linear-gradient(160deg, ${ac[0]}12 0%, ${ac[ac.length - 1]}08 40%, transparent 60%)`
              : undefined;

            return (
            <Card
              key={tournament.id}
              className="relative overflow-hidden"
              style={{
                ...(hasColors
                  ? {
                      borderTopWidth: "3px",
                      borderTopColor: primary!,
                      borderImage:
                        ac.length > 1
                          ? `linear-gradient(to right, ${ac.join(", ")}) 1`
                          : undefined,
                    }
                  : {}),
              }}
            >
              {fadedBg && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: fadedBg }}
                />
              )}
              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {tournament.logo_url && (
                      <img
                        src={tournament.logo_url}
                        alt=""
                        className="h-16 w-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                    <Button asChild variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Link href={`/tournaments/${tournament.id}`} target="_blank">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tournament.visibility === "private" ? (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Lock className="h-3 w-3" />
                        {t("visibilityPrivate")}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Globe className="h-3 w-3" />
                        {t("visibilityPublic")}
                      </Badge>
                    )}
                    {(() => {
                      const cat = getTournamentCategory(tournament);
                      return <Badge variant={categoryVariants[cat]}>{categoryLabels[cat]}</Badge>;
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                {tournament.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {tournament.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                  <Badge
                    variant="outline"
                    style={primary ? { borderColor: `${primary}50`, color: primary } : undefined}
                  >
                    {t.has(`formatOptions.${tournament.format}`)
                      ? t(`formatOptions.${tournament.format}` as any)
                      : tournament.format}
                  </Badge>
                  <span>{t("maxTeams")}: {tournament.max_teams}</span>
                  {tournament.start_date && (
                    <span>
                      {new Date(tournament.start_date).toLocaleDateString()}
                      {tournament.end_date && ` – ${new Date(tournament.end_date).toLocaleDateString()}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tournament/${tournament.id}/teams`}>
                      <Users className="h-3 w-3 mr-1" />
                      {tTeams("manageTeams")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/tournament/${tournament.id}/matches`}>
                      <Swords className="h-3 w-3 mr-1" />
                      {t("manageTournament")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/edit/${tournament.id}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      {t("editTournament")}
                    </Link>
                  </Button>
                  <TournamentQR
                    tournamentId={tournament.id}
                    tournamentName={tournament.name}
                    locale={locale}
                  />
                  <DeleteDialog
                    tournamentId={tournament.id}
                    tournamentName={tournament.name}
                  />
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
