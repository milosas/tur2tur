import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TournamentsList } from "./TournamentsList";

export default async function TournamentsPage() {
  const supabase = await createClient();
  const t = await getTranslations("Tournaments");

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 animate-fade-in-up">{t("title")}</h1>
      <TournamentsList tournaments={tournaments ?? []} />
    </div>
  );
}
