"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { TournamentStatus } from "@/lib/types";

const variantMap: Record<TournamentStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  registration: "secondary",
  in_progress: "default",
  group_stage: "default",
  playoffs: "default",
  completed: "secondary",
};

export function StatusBadge({ status }: { status: TournamentStatus }) {
  const t = useTranslations("Tournaments.status");
  return <Badge variant={variantMap[status]}>{t(status)}</Badge>;
}
