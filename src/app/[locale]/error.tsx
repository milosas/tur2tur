"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="text-muted-foreground mb-6">{t("description")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
