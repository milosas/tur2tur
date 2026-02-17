import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./DashboardContent";
import { FREE_TOURNAMENT_LIMIT } from "@/lib/stripe";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: tournaments }, { data: profile }] = await Promise.all([
    supabase
      .from("tournaments")
      .select("*")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("subscription_tier, tournament_credits, tournaments_created, subscription_end_date")
      .eq("id", user.id)
      .single(),
  ]);

  const t = await getTranslations("Dashboard");
  const locale = await getLocale();

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardContent
        tournaments={tournaments ?? []}
        locale={locale}
        subscription={{
          tier: (profile?.subscription_tier as "free" | "single" | "unlimited") ?? "free",
          tournamentCount: profile?.tournaments_created ?? 0,
          credits: profile?.tournament_credits ?? 0,
          maxFree: FREE_TOURNAMENT_LIMIT,
          subscriptionEnd: profile?.subscription_end_date ?? null,
        }}
      />
    </div>
  );
}
