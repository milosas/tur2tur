"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "tur2tur-cookie-consent";

export function CookieConsent() {
  const t = useTranslations("CookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    // If user previously declined, disable analytics
    if (consent === "declined") {
      disableAnalytics();
    }
  }, []);

  function disableAnalytics() {
    // Disable GA4
    (window as any)[`ga-disable-G-LRVHKZ7LM5`] = true;
    // Remove FB Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("consent", "revoke");
    }
  }

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    disableAnalytics();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-lg rounded-lg border bg-background p-4 shadow-lg">
        <p className="text-sm text-muted-foreground mb-3">
          {t("message")}{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t("learnMore")}
          </Link>
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleDecline}>
            {t("decline")}
          </Button>
          <Button size="sm" onClick={handleAccept}>
            {t("accept")}
          </Button>
        </div>
      </div>
    </div>
  );
}
