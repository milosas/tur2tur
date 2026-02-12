import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TournamentDetail } from "./TournamentDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (!tournament) {
    notFound();
  }

  // Fetch teams for this tournament
  const { data: teams } = await supabase
    .from("teams")
    .select("*, team_players(*)")
    .eq("tournament_id", tournament.id)
    .order("name");

  // Fetch groups
  const { data: groups } = await supabase
    .from("tournament_groups")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("name");

  // Fetch matches
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("tournament_id", tournament.id)
    .order("stage")
    .order("round")
    .order("match_number");

  // Fetch organizer profile
  const { data: organizer } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", tournament.organizer_id)
    .single();

  // Count organizer's tournaments
  let organizerTournamentCount = 0;
  if (organizer) {
    const { count } = await supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .eq("organizer_id", tournament.organizer_id);
    organizerTournamentCount = count ?? 0;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 overflow-hidden">
      <TournamentDetail
        tournament={tournament}
        teams={teams ?? []}
        groups={groups ?? []}
        matches={matches ?? []}
        organizer={organizer}
        organizerTournamentCount={organizerTournamentCount}
      />
    </div>
  );
}
