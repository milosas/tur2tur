import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MatchesManager } from "./MatchesManager";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchesPage({ params }: Props) {
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
    .select("id, name")
    .eq("tournament_id", id)
    .order("name");

  const { data: groups } = await supabase
    .from("tournament_groups")
    .select("*")
    .eq("tournament_id", id)
    .order("name");

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", id)
    .order("stage")
    .order("round")
    .order("match_number");

  return (
    <div className="container mx-auto px-4 py-8">
      <MatchesManager
        tournament={tournament}
        teams={teams ?? []}
        initialGroups={groups ?? []}
        initialMatches={matches ?? []}
      />
    </div>
  );
}
