import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TournamentForm } from "@/components/tournament/TournamentForm";
import { FREE_TOURNAMENT_LIMIT } from "@/lib/stripe";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sukurti turnyrą",
  description: "Sukurkite naują sporto turnyrą. Pasirinkite formatą, pridėkite komandas ir pradėkite varžybas.",
};

export default async function CreateTournamentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check tournament limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, tournament_credits, tournaments_created, subscription_end_date")
    .eq("id", user.id)
    .single();

  const tournamentCount = profile?.tournaments_created ?? 0;
  const tier = profile?.subscription_tier ?? "free";
  const credits = profile?.tournament_credits ?? 0;
  const isUnlimited =
    tier === "unlimited" &&
    profile?.subscription_end_date &&
    new Date(profile.subscription_end_date) > new Date();

  const maxAllowed = FREE_TOURNAMENT_LIMIT + credits;
  const canCreate = isUnlimited || tournamentCount < maxAllowed;

  const t = await getTranslations("Dashboard");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("createTournament")}</h1>
      <TournamentForm canCreate={canCreate} />
    </div>
  );
}
