import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TeamsManager } from "./TeamsManager";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TeamsPage({ params }: Props) {
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

  const { data: teams } = await supabase
    .from("teams")
    .select("*, team_players(*)")
    .eq("tournament_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamsManager
        tournament={tournament}
        initialTeams={teams ?? []}
      />
    </div>
  );
}
