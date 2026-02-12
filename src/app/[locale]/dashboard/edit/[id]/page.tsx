import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { TournamentForm } from "@/components/tournament/TournamentForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTournamentPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (!tournament) {
    notFound();
  }

  if (tournament.organizer_id !== user.id) {
    redirect("/dashboard");
  }

  const t = await getTranslations("Dashboard");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("editTournament")}</h1>
      <TournamentForm
        initial={{
          id: tournament.id,
          name: tournament.name,
          description: tournament.description ?? "",
          format: tournament.format,
          max_teams: tournament.max_teams,
          start_date: tournament.start_date
            ? tournament.start_date.split("T")[0]
            : "",
        }}
      />
    </div>
  );
}
