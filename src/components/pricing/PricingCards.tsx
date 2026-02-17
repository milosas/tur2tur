"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Trophy } from "lucide-react";
import type { SubscriptionTier } from "@/lib/types";

export function PricingCards({
  currentTier,
  isLoggedIn,
}: {
  currentTier?: SubscriptionTier;
  isLoggedIn: boolean;
}) {
  const t = useTranslations("Pricing");
  const router = useRouter();

  function handleCheckout(plan: "single" | "unlimited") {
    router.push(`/pricing/checkout?plan=${plan}`);
  }

  const features = [
    t("featureAllFormats"),
    t("featureTeamManagement"),
    t("featureLiveScores"),
    t("featureQrCodes"),
    t("featureMultiLanguage"),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
      {/* Free Tier */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{t("free")}</CardTitle>
          </div>
          <div className="text-3xl font-bold">
            €0
          </div>
          <p className="text-sm text-muted-foreground">{t("freeDesc")}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              {t("freeTournamentLimit")}
            </li>
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {currentTier === "free" && (
            <Badge variant="outline" className="w-full justify-center">
              {t("currentPlan")}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Single Tournament */}
      <Card className="relative">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <CardTitle>{t("single")}</CardTitle>
          </div>
          <div className="text-3xl font-bold">
            €5
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {t("oneTime")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t("singleDesc")}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              {t("singleBenefit")}
            </li>
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <Button
              onClick={() => handleCheckout("single")}
              className="w-full h-12 text-base"
              variant="outline"
            >
              {t("buyCredit")}
            </Button>
          ) : (
            <Button asChild className="w-full h-12 text-base" variant="outline">
              <a href="/auth/login">{t("loginToBuy")}</a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Unlimited */}
      <Card className="relative border-primary">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">
            {t("popular")}
          </Badge>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <CardTitle>{t("unlimited")}</CardTitle>
          </div>
          <div className="text-3xl font-bold">
            €9.90
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {t("perMonth")}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{t("unlimitedDesc")}</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              {t("unlimitedBenefit")}
            </li>
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {currentTier === "unlimited" ? (
            <Badge variant="outline" className="w-full justify-center">
              {t("currentPlan")}
            </Badge>
          ) : isLoggedIn ? (
            <Button
              onClick={() => handleCheckout("unlimited")}
              className="w-full"
            >
              {t("subscribe")}
            </Button>
          ) : (
            <Button asChild className="w-full">
              <a href="/auth/login">{t("loginToBuy")}</a>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
