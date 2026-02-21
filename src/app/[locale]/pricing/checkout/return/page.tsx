"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { trackPurchase } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Loader2 } from "lucide-react";

export default function CheckoutReturnPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const t = useTranslations("Pricing");

  const [status, setStatus] = useState<"loading" | "complete" | "open">(
    "loading"
  );
  const [plan, setPlan] = useState<string | null>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/checkout/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status === "complete" ? "complete" : "open");
        setPlan(data.plan);
        if (data.status === "complete" && data.plan && !tracked.current) {
          tracked.current = true;
          trackPurchase(data.plan, data.plan === "single" ? 5 : 9.9);
        }
      })
      .catch(() => setStatus("open"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <Card>
          <CardContent className="pt-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold">{t("paymentSuccess")}</h1>
            <p className="text-muted-foreground">
              {plan === "unlimited"
                ? t("unlimitedActivated")
                : t("creditAdded")}
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">{t("backToDashboard")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // status === "open" — payment failed or was abandoned
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardContent className="pt-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">{t("paymentFailed")}</h1>
          <p className="text-muted-foreground">{t("paymentFailedDesc")}</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/pricing">{t("tryAgain")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
